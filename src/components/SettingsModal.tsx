import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Moon, Sun, Bell, Lock, HelpCircle, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      onClose();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Toggle dark/light theme',
          action: (
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          ),
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Enable push notifications',
          action: (
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          ),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Lock,
          label: 'Privacy',
          description: 'Manage your privacy settings',
          onClick: () => toast.info('Privacy settings coming soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help with your account',
          onClick: () => toast.info('Help center coming soon'),
        },
        {
          icon: Info,
          label: 'About',
          description: 'App version and info',
          onClick: () => toast.info('Picgram v1.0.0'),
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card w-full max-w-md rounded-xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {settingsGroups.map((group, groupIndex) => (
              <div key={group.title}>
                <div className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                      item.onClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={item.onClick}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {item.action}
                  </div>
                ))}
                {groupIndex < settingsGroups.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
