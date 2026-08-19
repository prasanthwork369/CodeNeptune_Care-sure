package expo.modules.nativenotifications.offers

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.nativenotifications.R
import java.net.HttpURLConnection
import java.net.URL

/** Payload for a marketing product-offer notification. Optional fields hide their views. */
data class ProductOfferData(
    val productId: String,
    val title: String,
    val mrp: String?,
    val offerPrice: String?,
    val discountText: String?,
    val couponText: String?,
    val imageUrl: String?,
    val buttonText: String,
    val deepLink: String,
    /** Optional header line shown in the system decoration. */
    val subText: String?,
)

/** Builds and posts the custom RemoteViews product-offer notification (collapsed + expanded). */
object ProductOfferRenderer {

    private const val TAG = "ProductOfferNotif"
    // Must match NOTIFICATION_CHANNELS.OFFERS in src/constants/notificationChannels.ts
    private const val CHANNEL_ID = "offers"
    private const val IMAGE_TIMEOUT_MS = 8_000
    private const val MAX_IMAGE_PX = 512

    fun display(context: Context, data: ProductOfferData) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            Log.w(TAG, "Notifications disabled; skipping display")
            return
        }
        ensureChannel(context)

        // Never log product/user details — id only.
        val bitmap = data.imageUrl?.let { downloadBitmap(it) }
        // Stable per-product hash ID
        val notificationId = "product_offer_${data.productId}".hashCode()
        val tapIntent = buildTapIntent(context, data.deepLink, notificationId)
        if (tapIntent == null) {
            // Skip if launcher activity is unresolved
            Log.e(TAG, "No launcher activity found; skipping display")
            return
        }

        val collapsed = RemoteViews(context.packageName, R.layout.notification_product_collapsed)
        val expanded = RemoteViews(context.packageName, R.layout.notification_product_expanded)
        populate(collapsed, data, bitmap, tapIntent)
        populate(expanded, data, bitmap, tapIntent)

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(smallIconRes(context))
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(collapsed)
            .setCustomBigContentView(expanded)
            .setContentIntent(tapIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)

        if (!data.subText.isNullOrBlank()) builder.setSubText(data.subText)

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build())
        } catch (e: SecurityException) {
            // Handle POST_NOTIFICATIONS runtime revocation
            Log.w(TAG, "notify blocked: ${e.message}")
        }
    }

    /** Populate view elements and handle conditional visibilities */
    private fun populate(
        views: RemoteViews,
        data: ProductOfferData,
        bitmap: Bitmap?,
        tapIntent: PendingIntent,
    ) {
        views.setTextViewText(R.id.notif_title, data.title)

        // Apply strike-through to MRP
        setTextOrHide(views, R.id.notif_mrp, data.mrp?.let {
            SpannableString(it).apply {
                setSpan(StrikethroughSpan(), 0, length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            }
        })
        setTextOrHide(views, R.id.notif_offer_price, data.offerPrice)
        setTextOrHide(views, R.id.notif_discount, data.discountText)
        setTextOrHide(views, R.id.notif_coupon, data.couponText)

        views.setTextViewText(R.id.notif_action_btn, data.buttonText)
        views.setOnClickPendingIntent(R.id.notif_action_btn, tapIntent)

        // Hide image view if download fails
        if (bitmap != null) {
            views.setImageViewBitmap(R.id.notif_image, bitmap)
        } else {
            views.setViewVisibility(R.id.notif_image, View.GONE)
        }
    }

    private fun setTextOrHide(views: RemoteViews, viewId: Int, text: CharSequence?) {
        if (text.isNullOrEmpty()) {
            views.setViewVisibility(viewId, View.GONE)
        } else {
            views.setViewVisibility(viewId, View.VISIBLE)
            views.setTextViewText(viewId, text)
        }
    }

    /** Creates a PendingIntent launching the app with a deep link, resolved dynamically to avoid circular dependencies. */
    private fun buildTapIntent(context: Context, deepLink: String, requestCode: Int): PendingIntent? {
        val launcherComponent = context.packageManager
            .getLaunchIntentForPackage(context.packageName)
            ?.component
        if (launcherComponent == null) {
            Log.e(TAG, "getLaunchIntentForPackage returned no component for ${context.packageName}")
            return null
        }
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

    /** Downloads and downsamples notification image */
    private fun downloadBitmap(url: String): Bitmap? {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = IMAGE_TIMEOUT_MS
                readTimeout = IMAGE_TIMEOUT_MS
                instanceFollowRedirects = true
            }
            val bytes = connection.inputStream.use { it.readBytes() }

            // Two-pass decode to downsample large images and prevent OOMs
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
            var sample = 1
            while (bounds.outWidth / (sample * 2) >= MAX_IMAGE_PX ||
                bounds.outHeight / (sample * 2) >= MAX_IMAGE_PX
            ) sample *= 2
            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, opts)
        } catch (e: Exception) {
            // Fail gracefully without logging the URL
            Log.w(TAG, "Image download failed: ${e.javaClass.simpleName}")
            null
        } finally {
            connection?.disconnect()
        }
    }

    /** Resolves the status bar small icon */
    private fun smallIconRes(context: Context): Int {
        val res = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
        return if (res != 0) res else context.applicationInfo.icon
    }

    /** Idempotently creates the offers notification channel */
    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Offers & Promotions", NotificationManager.IMPORTANCE_DEFAULT),
        )
    }
}
