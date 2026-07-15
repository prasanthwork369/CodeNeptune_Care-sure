import { contactService } from '../contact.service';

/**
 * Action ids used on notification buttons. The value is what comes back in the
 * notifee event, so keep these in sync with whatever sets `pressAction.id`.
 */
export const NOTIFICATION_ACTIONS = {
  CALL: 'call',
  LATER: 'later',
} as const;

const getNotifee = () => require('@notifee/react-native');

/**
 * Runs a notification button press. Shared by the foreground and background
 * handlers so a button behaves the same whichever one receives it.
 */
export async function handleNotificationAction(
  actionId: string,
  notificationId?: string,
  data?: Record<string, any>,
): Promise<void> {
  switch (actionId) {
    case NOTIFICATION_ACTIONS.CALL:
      // `data.phone` lets a push override the default support number.
      await contactService.call(data?.phone);
      break;

    case NOTIFICATION_ACTIONS.LATER:
      break;

    default:
      return;
  }

  // Both actions finish the notification's job, so clear it either way.
  if (notificationId) {
    const notifee = getNotifee().default;
    await notifee.cancelNotification(notificationId);
  }
}
