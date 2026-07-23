package com.codeneptune.caresure.notifications

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.concurrent.Executors

/**
 * RN bridge for the custom product-offer notification. Called from the JS FCM
 * dispatch (foreground onMessage + headless background handler). The Promise
 * resolves only after notify(), keeping the headless task alive through the
 * image download.
 */
class ProductOfferNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // Single background thread: marketing pushes are rare; serial is plenty and
    // keeps image downloads off the main + JS threads.
    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "ProductOfferNotification"

    @ReactMethod
    fun display(payload: ReadableMap, promise: Promise) {
        val productId = payload.getStringSafe("productId")
        val title = payload.getStringSafe("title")
        val deepLink = payload.getStringSafe("deepLink")
        if (productId.isNullOrBlank() || title.isNullOrBlank() || deepLink.isNullOrBlank()) {
            promise.reject("E_INVALID_PAYLOAD", "productId, title and deepLink are required")
            return
        }

        val data = ProductOfferData(
            productId = productId,
            title = title.take(120), // hard cap; XML ellipsize handles display truncation
            mrp = payload.getStringSafe("mrp"),
            offerPrice = payload.getStringSafe("offerPrice"),
            discountText = payload.getStringSafe("discountText"),
            couponText = payload.getStringSafe("couponText"),
            imageUrl = payload.getStringSafe("imageUrl"),
            buttonText = payload.getStringSafe("buttonText")?.takeIf { it.isNotBlank() } ?: "VIEW",
            deepLink = deepLink,
        )

        executor.execute {
            try {
                ProductOfferRenderer.display(reactContext, data)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_DISPLAY_FAILED", e.javaClass.simpleName, e)
            }
        }
    }

    private fun ReadableMap.getStringSafe(key: String): String? =
        if (hasKey(key)) getString(key) else null
}
