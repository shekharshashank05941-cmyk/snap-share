import { useEffect, useState, useCallback } from 'react';
import { 
  checkNotificationSupport, 
  getNotificationPermission, 
  requestNotificationPermission as requestPermission,
  sendNotification,
  notifyLike,
  notifyComment,
  notifyFollow
} from '@/lib/notifications';

// Hook version for components that need reactive permission state
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(checkNotificationSupport());
    setPermission(getNotificationPermission());
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const granted = await requestPermission();
    setPermission(getNotificationPermission());
    return granted;
  }, []);

  return {
    isSupported,
    permission,
    requestPermission: requestNotificationPermission,
    sendNotification,
    notifyLike,
    notifyComment,
    notifyFollow,
  };
};
