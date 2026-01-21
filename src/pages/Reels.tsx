import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Reels = () => {
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);

  const reels = posts?.filter((post) => post.is_reel) || [];
  const currentReel = reels[currentIndex];

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = () => {
    if (!user || !currentReel) return;
    if (currentReel.is_liked) {
      unlikePost.mutate(currentReel.id);
    } else {
      likePost.mutate(currentReel.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <main className="pt-20 pb-20 flex items-center justify-center">
          <Skeleton className="w-full max-w-md aspect-[9/16]" />
        </main>
        <MobileNav />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <main className="pt-20 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">No Reels Yet</p>
            <p className="text-muted-foreground">Upload a video to create a reel!</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main 
        className="pt-16 pb-14 md:pb-0 h-screen flex items-center justify-center"
        onWheel={(e) => handleScroll(e.deltaY > 0 ? 'down' : 'up')}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReel?.id}
            className="relative w-full max-w-md aspect-[9/16] bg-card rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
          >
            <video
              src={currentReel?.media_url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={muted}
              playsInline
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex">
              {/* Left side - tap to go back */}
              <div 
                className="w-1/3 h-full"
                onClick={() => handleScroll('up')}
              />
              
              {/* Right side - tap to go forward */}
              <div 
                className="w-2/3 h-full"
                onClick={() => handleScroll('down')}
              />
            </div>

            {/* Sound toggle */}
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
              onClick={() => setMuted(!muted)}
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center gap-1"
              >
                <Heart
                  className={`w-7 h-7 ${
                    currentReel?.is_liked ? 'text-primary fill-primary' : 'text-white'
                  }`}
                />
                <span className="text-white text-xs">{currentReel?.likes_count}</span>
              </motion.button>
              
              <button className="flex flex-col items-center gap-1">
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="text-white text-xs">{currentReel?.comments_count}</span>
              </button>
              
              <button>
                <Send className="w-7 h-7 text-white" />
              </button>
              
              <button>
                <Bookmark className="w-7 h-7 text-white" />
              </button>
              
              <button>
                <MoreHorizontal className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* User info */}
            <div className="absolute left-4 bottom-20 right-20">
              <Link to={`/profile/${currentReel?.profile.username}`} className="flex items-center gap-2 mb-2">
                <img
                  src={currentReel?.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={currentReel?.profile.username}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white"
                />
                <span className="text-white font-semibold">{currentReel?.profile.username}</span>
              </Link>
              {currentReel?.caption && (
                <p className="text-white text-sm line-clamp-2">{currentReel.caption}</p>
              )}
            </div>

            {/* Progress indicator */}
            <div className="absolute top-2 left-0 right-0 flex gap-1 px-2">
              {reels.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <MobileNav />
    </div>
  );
};

export default Reels;
