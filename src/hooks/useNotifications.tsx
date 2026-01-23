import { useEffect, useState, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return null;
    
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
  }, [isSupported, permission]);

  const notifyLike = useCallback((username: string, postCaption?: string) => {
    sendNotification(`${username} liked your post`, {
      body: postCaption ? `"${postCaption.slice(0, 50)}${postCaption.length > 50 ? '...' : ''}"` : 'Check it out!',
      tag: 'like-notification',
    });
  }, [sendNotification]);

  const notifyComment = useCallback((username: string, comment: string) => {
    sendNotification(`${username} commented on your post`, {
      body: `"${comment.slice(0, 100)}${comment.length > 100 ? '...' : ''}"`,
      tag: 'comment-notification',
    });
  }, [sendNotification]);

  const notifyFollow = useCallback((username: string) => {
    sendNotification(`${username} started following you`, {
      body: 'Check out their profile!',
      tag: 'follow-notification',
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyLike,
    notifyComment,
    notifyFollow,
  };
};
