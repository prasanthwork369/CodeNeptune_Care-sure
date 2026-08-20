import {
  isRichCampaign,
  toRichCampaignData,
  RichCampaignHandler,
} from "../../src/services/notifications/handlers/richCampaignNotification";
import { getCanonicalType, getNotificationHandler } from "../../src/services/notifications/registry";

describe("RichCampaignNotification & Registry", () => {
  it("identifies rich campaign notification types correctly", () => {
    expect(isRichCampaign({ type: "PROMOTION" })).toBe(true);
    expect(isRichCampaign({ type: "OFFER" })).toBe(true);
    expect(isRichCampaign({ type: "RICH_CAMPAIGN" })).toBe(true);
    expect(isRichCampaign({ type: "REORDER" })).toBe(true);
    expect(isRichCampaign({ type: "CART_REMINDER" })).toBe(true);
    expect(isRichCampaign({ notificationType: "rich_campaign" })).toBe(true);

    // Non-rich types
    expect(isRichCampaign({ type: "ORDER_PLACED" })).toBe(false);
    expect(isRichCampaign({ type: "PRESCRIPTION_APPROVED" })).toBe(false);
  });

  it("normalizes flat FCM data into RichCampaignNotificationData", () => {
    const rawData = {
      notificationId: "apollo_123",
      type: "PROMOTION",
      title: "Don't Miss Your Medicine",
      body: "Your healthcare essentials are waiting. Order now and save more.",
      imageUrl: "https://cdn.example.com/banner.webp",
      expiresAt: "1787222400000",
      actionLabel: "Check Now",
      deepLink: "caresure://offers",
      campaignId: "aug_med_sale",
    };

    const normalized = toRichCampaignData(rawData);
    expect(normalized).not.toBeNull();
    expect(normalized?.title).toBe("Don't Miss Your Medicine");
    expect(normalized?.body).toBe("Your healthcare essentials are waiting. Order now and save more.");
    expect(normalized?.expiresAt).toBe(1787222400000);
    expect(normalized?.actionLabel).toBe("Check Now");
    expect(normalized?.deepLink).toBe("caresure://offers");
  });

  it("falls back to a real route (/notifications) when no deepLink/route/productId is given", () => {
    const normalized = toRichCampaignData({
      title: "Reminder",
      type: "CART_REMINDER",
    });

    expect(normalized?.deepLink).toBe("caresure://notifications");
  });

  it("resolves canonical types in registry for rich campaigns and preserves order timeline handlers", () => {
    expect(getCanonicalType({ type: "PROMOTION" })).toBe("PROMOTION");
    expect(getNotificationHandler("PROMOTION")).toBe(RichCampaignHandler);

    expect(getCanonicalType({ type: "OFFER" })).toBe("OFFER");
    expect(getNotificationHandler("OFFER")).toBe(RichCampaignHandler);

    expect(getCanonicalType({ notificationType: "rich_campaign" })).toBe("RICH_CAMPAIGN");
    expect(getNotificationHandler("RICH_CAMPAIGN")).toBe(RichCampaignHandler);

    // Preserved transactional order handler
    expect(getCanonicalType({ type: "ORDER_DELIVERED" })).toBe("ORDER_DELIVERED");
    expect(getNotificationHandler("ORDER_DELIVERED")).not.toBe(RichCampaignHandler);
  });

  it("resolves tap destinations properly", () => {
    expect(RichCampaignHandler.getTapDestination?.({ productId: "123" })).toEqual({
      pathname: "/product/[id]",
      params: { id: "123" },
    });

    expect(RichCampaignHandler.getTapDestination?.({ categoryId: "cat_456" })).toEqual({
      pathname: "/category/[id]",
      params: { id: "cat_456" },
    });

    expect(RichCampaignHandler.getTapDestination?.({ route: "/(commerce)/cart" })).toEqual({
      pathname: "/(commerce)/cart",
    });
  });

  it("returns null when no productId/categoryId/route is present, so NotificationNavigation's own switch-case (e.g. CART_REMINDER -> cart) can run", () => {
    expect(
      RichCampaignHandler.getTapDestination?.({ type: "CART_REMINDER" }),
    ).toBeNull();
    expect(
      RichCampaignHandler.getTapDestination?.({ type: "PROMOTION" }),
    ).toBeNull();
  });
});
