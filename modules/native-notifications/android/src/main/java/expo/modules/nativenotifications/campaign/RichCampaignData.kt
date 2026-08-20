package expo.modules.nativenotifications.campaign

/**
 * Normalized data model for CareSure Apollo-style Rich Campaign Notifications.
 */
data class RichCampaignData(
    val notificationId: String,
    val title: String,
    val body: String,
    val imageUrl: String? = null,
    val expiresAt: Long? = null, // Unix epoch timestamp in milliseconds
    val actionLabel: String = "Check Now",
    val deepLink: String = "caresure://notifications",
    val campaignId: String? = null,
    val subText: String? = null,
)
