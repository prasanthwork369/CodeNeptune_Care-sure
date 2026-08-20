package expo.modules.nativenotifications

import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.nativenotifications.campaign.RichCampaignData
import expo.modules.nativenotifications.campaign.RichCampaignRenderer
import expo.modules.nativenotifications.offers.ProductOfferData
import expo.modules.nativenotifications.offers.ProductOfferRenderer
import java.util.concurrent.Executors

/** Custom native notification designs wrapper for marketing and transactional notifications. */
class NativeNotificationsModule : Module() {
    // Single background thread for image downloads and display
    private val executor = Executors.newSingleThreadExecutor()

    override fun definition() = ModuleDefinition {
        Name("NativeNotifications")

        AsyncFunction("display") { payload: Map<String, Any?>, promise: Promise ->
            val productId = payload.getStringSafe("productId")
            val title = payload.getStringSafe("title")
            val deepLink = payload.getStringSafe("deepLink")
            if (productId.isNullOrBlank() || title.isNullOrBlank() || deepLink.isNullOrBlank()) {
                promise.reject("E_INVALID_PAYLOAD", "productId, title and deepLink are required", null)
                return@AsyncFunction
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
                subText = payload.getStringSafe("subText"),
            )

            val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
            executor.execute {
                try {
                    ProductOfferRenderer.display(context, data)
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("E_DISPLAY_FAILED", e.javaClass.simpleName, e)
                }
            }
        }

        AsyncFunction("displayRichNotification") { payload: Map<String, Any?>, promise: Promise ->
            val title = payload.getStringSafe("title")
            if (title.isNullOrBlank()) {
                promise.reject("E_INVALID_PAYLOAD", "title is required", null)
                return@AsyncFunction
            }

            val expiresAtLong = (payload["expiresAt"] as? Number)?.toLong()
                ?: payload.getStringSafe("expiresAt")?.toLongOrNull()

            val data = RichCampaignData(
                notificationId = payload.getStringSafe("notificationId")
                    ?: payload.getStringSafe("id")
                    ?: "rich_${System.currentTimeMillis()}",
                title = title.take(120),
                body = payload.getStringSafe("body") ?: "",
                imageUrl = payload.getStringSafe("imageUrl"),
                expiresAt = expiresAtLong,
                actionLabel = payload.getStringSafe("actionLabel") ?: "Check Now",
                deepLink = payload.getStringSafe("deepLink") ?: "caresure://notifications",
                campaignId = payload.getStringSafe("campaignId"),
                subText = payload.getStringSafe("subText"),
            )

            val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
            executor.execute {
                try {
                    RichCampaignRenderer.display(context, data)
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("E_DISPLAY_FAILED", e.javaClass.simpleName, e)
                }
            }
        }
    }

    private fun Map<String, Any?>.getStringSafe(key: String): String? = this[key] as? String
}
