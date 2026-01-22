import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
}

const StoryViewer = ({ stories, initialIndex, isOpen, onClose, onDelete }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory?.user_id === user?.id;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, onClose]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-black border-none">
        <div className="relative aspect-[9/16] w-full">
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{
                    width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                  }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-2 right-2 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={currentStory.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={currentStory.profile?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{currentStory.profile?.username}</p>
                <p className="text-xs text-white/70">
                  {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwnStory && onDelete && (
                <button
                  onClick={() => onDelete(currentStory.id)}
                  className="p-1 hover:bg-white/20 rounded-full"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Story content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {currentStory.media_url.includes('.mp4') || currentStory.media_url.includes('.webm') ? (
                <video
                  src={currentStory.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentStory.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation areas */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
            aria-label="Previous story"
          />
          <button
            onClick={goNext}
            className="absolute right-0 top-0 bottom-0 w-2/3 z-10"
            aria-label="Next story"
          />

          {/* Navigation arrows (visible on hover) */}
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
