import { NotificationData } from "../../types/notification";

export interface NotificationDestination {
  pathname: string;
  params?: Record<string, string | string[]>;
}

export interface NotificationHandler {
  /**
   * Displays the remote notification.
   * Returns true when the notification is visually presented, or false on fallback/failure.
   */
  display(data: NotificationData): Promise<boolean>;

  /**
   * Translates the notification payload into an Expo Router destination.
   * Returns null if there is no valid destination.
   */
  getTapDestination?(data: NotificationData): NotificationDestination | null;
}
