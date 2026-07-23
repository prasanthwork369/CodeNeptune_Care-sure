package com.codeneptune.caresure.notifications

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
import com.codeneptune.caresure.MainActivity
import com.codeneptune.caresure.R
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
    /** Optional header line (e.g. "Shop Now on CareSure") shown in the system decoration. */
    val subText: String?,
)

/**
 * Builds and posts the custom RemoteViews product-offer notification
 * (collapsed + expanded) using DecoratedCustomViewStyle so Android keeps the
 * system header. Marketing-only — transactional notifications are untouched.
 */
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
        // Stable per-product id: same product updates in place, different products coexist.
        val notificationId = "product_offer_${data.productId}".hashCode()
        val tapIntent = buildTapIntent(context, data.deepLink, notificationId)

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

        // Myntra-style header line next to the app name ("Shop Now on …").
        if (!data.subText.isNullOrBlank()) builder.setSubText(data.subText)

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build())
        } catch (e: SecurityException) {
            // POST_NOTIFICATIONS revoked between the check and notify — never crash.
            Log.w(TAG, "notify blocked: ${e.message}")
        }
    }

    /** Shared collapsed/expanded population — optional fields collapse cleanly via GONE. */
    private fun populate(
        views: RemoteViews,
        data: ProductOfferData,
        bitmap: Bitmap?,
        tapIntent: PendingIntent,
    ) {
        views.setTextViewText(R.id.notif_title, data.title)

        // Strike-through MRP via SpannableString — native styling, no HTML.
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

        // No broken placeholder: image view disappears entirely when download failed.
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

    /**
     * Deep-link straight into MainActivity so expo-router's Linking handles
     * navigation — Firebase/notifee tap listeners never fire for it, which makes
     * duplicate navigation impossible by construction. requestCode = notification
     * id so each product's PendingIntent stays distinct.
     */
    private fun buildTapIntent(context: Context, deepLink: String, requestCode: Int): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse(deepLink)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        return PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /** Blocking download + downsample; caller is already off the main thread. */
    private fun downloadBitmap(url: String): Bitmap? {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = IMAGE_TIMEOUT_MS
                readTimeout = IMAGE_TIMEOUT_MS
                instanceFollowRedirects = true
            }
            val bytes = connection.inputStream.use { it.readBytes() }

            // Two-pass decode: bounds first, then downsample to <= MAX_IMAGE_PX
            // so oversized CDN images can't OOM the notification process.
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
            var sample = 1
            while (bounds.outWidth / (sample * 2) >= MAX_IMAGE_PX ||
                bounds.outHeight / (sample * 2) >= MAX_IMAGE_PX
            ) sample *= 2
            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, opts)
        } catch (e: Exception) {
            // Notification still shows without the image; never log the URL (may carry tokens).
            Log.w(TAG, "Image download failed: ${e.javaClass.simpleName}")
            null
        } finally {
            connection?.disconnect()
        }
    }

    /** White silhouette generated by the expo-notifications plugin; app icon fallback. */
    private fun smallIconRes(context: Context): Int {
        val res = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
        return if (res != 0) res else context.applicationInfo.icon
    }

    /** Idempotent; mirrors the JS-created "offers" channel so ids never diverge. */
    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Offers & Promotions", NotificationManager.IMPORTANCE_DEFAULT),
        )
    }
}
