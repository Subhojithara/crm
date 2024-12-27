interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  userName?: string;
}

export const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  return notifications.reduce(
    (acc: Record<string, Notification[]>, notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(notification);
      return acc;
    },
    {}
  );
}; 