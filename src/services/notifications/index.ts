/**
 * Notification services. The two background handlers are deliberately NOT
 * exported here — they register side effects on import and must stay direct
 * imports in index.js, before anything else loads.
 */
export { NotificationNavigation } from './NotificationNavigation';
export { orderNotification } from './orderNotification';
export type { OrderPlacedInput } from './orderNotification';
export { notificationService } from './notification.service';
export { notifeeService } from './notifeeService';
export { handleNotificationAction, NOTIFICATION_ACTIONS } from './notificationActions';
