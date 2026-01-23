// Notification utility functions (not a hook - safe to call anywhere)

export const checkNotificationSupport = () => 'Notification' in window;

export const getNotificationPermission = () => 
  checkNotificationSupport() ? Notification.permission : 'denied';

export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') return null;
  
  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

export const notifyLike = (username: string, postCaption?: string) => {
  sendNotification(`${username} liked your post`, {
    body: postCaption ? `"${postCaption.slice(0, 50)}${postCaption.length > 50 ? '...' : ''}"` : 'Check it out!',
    tag: 'like-notification',
  });
};

export const notifyComment = (username: string, comment: string) => {
  sendNotification(`${username} commented on your post`, {
    body: `"${comment.slice(0, 100)}${comment.length > 100 ? '...' : ''}"`,
    tag: 'comment-notification',
  });
};

export const notifyFollow = (username: string) => {
  sendNotification(`${username} started following you`, {
    body: 'Check out their profile!',
    tag: 'follow-notification',
  });
};
