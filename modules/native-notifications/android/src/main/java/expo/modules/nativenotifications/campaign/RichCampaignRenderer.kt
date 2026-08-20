package expo.modules.nativenotifications.campaign

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.nativenotifications.R
import java.net.HttpURLConnection
import java.net.URL

/**
 * Native Android Apollo-Style Rich Notification Renderer.
 * Supports Title, 2-line Description, Live Native Chronometer Countdown,
 * Full-width Campaign Banner Image, and "Check Now" Action CTA.
 */
object RichCampaignRenderer {

    private const val TAG = "RichCampaignNotif"
    private const val CHANNEL_ID = "caresure_promotions"
    private const val CHANNEL_NAME = "Offers & Promotions"
    private const val IMAGE_TIMEOUT_MS = 8_000
    private const val MAX_IMAGE_PX = 1024

    /**
     * Inspects incoming FCM data to determine whether it should be rendered
     * as an Apollo-style rich campaign notification.
     */
    fun isRichCampaign(data: Map<String, String?>): Boolean {
        val type = (data["type"] ?: data["notificationType"] ?: "").uppercase().trim()
        return type in setOf(
            "RICH_CAMPAIGN",
            "PROMOTION",
            "OFFER",
            "CAMPAIGN",
            "REORDER",
            "CART_REMINDER",
            "PRODUCT_OFFER",
        )
    }

    /**
     * Safely normalizes string-based FCM data map into RichCampaignData.
     */
    fun parsePayload(data: Map<String, String?>): RichCampaignData? {
        val title = data["title"]?.takeIf { it.isNotBlank() } ?: return null
        val body = data["body"] ?: ""
        val notificationId = data["notificationId"] ?: data["id"] ?: "promo_${System.currentTimeMillis()}"
        val imageUrl = data["imageUrl"]?.takeIf { it.isNotBlank() }
        val expiresAt = data["expiresAt"]?.toLongOrNull()
        val actionLabel = data["actionLabel"]?.takeIf { it.isNotBlank() } ?: "Check Now"
        val deepLink = data["deepLink"]?.takeIf { it.isNotBlank() } ?: "caresure://notifications"
        val campaignId = data["campaignId"]
        val subText = data["subText"]

        return RichCampaignData(
            notificationId = notificationId,
            title = title.take(120),
            body = body.take(200),
            imageUrl = imageUrl,
            expiresAt = expiresAt,
            actionLabel = actionLabel,
            deepLink = deepLink,
            campaignId = campaignId,
            subText = subText,
        )
    }

    /**
     * Builds and posts the custom Apollo-style notification using RemoteViews.
     * Can be invoked from the native FirebaseMessagingService or the JS NativeNotifications bridge.
     */
    fun display(context: Context, data: RichCampaignData) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            Log.w(TAG, "Notifications disabled for package; skipping display")
            return
        }

        ensureChannel(context)

        // Download and downsample image on background thread
        val bitmap = data.imageUrl?.let { downloadBitmap(it) }

        val notificationId = "rich_campaign_${data.notificationId}".hashCode()
        val tapIntent = buildTapIntent(context, data.deepLink, notificationId)
        if (tapIntent == null) {
            Log.e(TAG, "No launcher activity component found; skipping display")
            return
        }

        val collapsed = RemoteViews(context.packageName, R.layout.caresure_notification_collapsed)
        val expanded = RemoteViews(context.packageName, R.layout.caresure_notification_expanded)

        populate(collapsed, data, bitmap, tapIntent, isExpanded = false)
        populate(expanded, data, bitmap, tapIntent, isExpanded = true)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(smallIconRes(context))
            .setColor(Color.WHITE)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(collapsed)
            .setCustomBigContentView(expanded)
            .setContentIntent(tapIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)

        if (!data.subText.isNullOrBlank()) {
            builder.setSubText(data.subText)
        }

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build())
        } catch (e: SecurityException) {
            Log.w(TAG, "Notification notify blocked: ${e.message}")
        }
    }

    /**
     * Populates RemoteViews elements for expanded and collapsed layouts.
     */
    private fun populate(
        views: RemoteViews,
        data: RichCampaignData,
        bitmap: Bitmap?,
        tapIntent: PendingIntent,
        isExpanded: Boolean,
    ) {
        views.setTextViewText(R.id.caresure_notif_title, data.title)
        views.setTextViewText(R.id.caresure_notif_body, data.body)

        // 1. Live Countdown via native Chronometer
        if (data.expiresAt != null && data.expiresAt > System.currentTimeMillis()) {
            val remainingMillis = data.expiresAt - System.currentTimeMillis()
            val base = SystemClock.elapsedRealtime() + remainingMillis

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                views.setChronometerCountDown(R.id.caresure_notif_countdown, true)
            }
            views.setChronometer(R.id.caresure_notif_countdown, base, null, true)
            views.setViewVisibility(R.id.caresure_notif_countdown, View.VISIBLE)
        } else {
            views.setViewVisibility(R.id.caresure_notif_countdown, View.GONE)
        }

        // 2. Banner image (expanded only)
        if (isExpanded) {
            if (bitmap != null) {
                views.setImageViewBitmap(R.id.caresure_notif_banner, bitmap)
                views.setViewVisibility(R.id.caresure_notif_banner, View.VISIBLE)
            } else {
                views.setViewVisibility(R.id.caresure_notif_banner, View.GONE)
            }

            // 3. CTA Action
            views.setTextViewText(R.id.caresure_notif_cta, data.actionLabel)
            views.setOnClickPendingIntent(R.id.caresure_notif_cta, tapIntent)
        }
    }

    /**
     * Creates a PendingIntent launching MainActivity with ACTION_VIEW and the CareSure deep link.
     */
    private fun buildTapIntent(context: Context, deepLink: String, requestCode: Int): PendingIntent? {
        val launcherComponent = context.packageManager
            .getLaunchIntentForPackage(context.packageName)
            ?.component
            ?: return null

        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
            component = launcherComponent
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }

        return PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /**
     * Safely downloads and downsamples the campaign banner bitmap in 2 passes.
     */
    private fun downloadBitmap(url: String): Bitmap? {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = IMAGE_TIMEOUT_MS
                readTimeout = IMAGE_TIMEOUT_MS
                instanceFollowRedirects = true
            }
            if (connection.responseCode !in 200..299) {
                return null
            }
            val bytes = connection.inputStream.use { it.readBytes() }

            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

            var sample = 1
            while (bounds.outWidth / (sample * 2) >= MAX_IMAGE_PX ||
                bounds.outHeight / (sample * 2) >= MAX_IMAGE_PX
            ) {
                sample *= 2
            }

            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, opts)
        } catch (e: Exception) {
            Log.w(TAG, "Campaign banner image download failed: ${e.javaClass.simpleName}")
            null
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Resolves the small status bar notification icon.
     */
    private fun smallIconRes(context: Context): Int {
        val res = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
        return if (res != 0) res else context.applicationInfo.icon
    }

    /**
     * Idempotently ensures the offers/promotions notification channel exists.
     */
    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT).apply {
            enableVibration(true)
            setShowBadge(true)
        }
        manager.createNotificationChannel(channel)
    }
}
