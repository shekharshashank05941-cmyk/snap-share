import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play, Pause } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout>();

  const reels = posts?.filter((post) => post.is_reel) || [];
  const currentReel = reels[currentIndex];

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
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

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const showControlsTemporary = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    video.addEventListener('timeupdate', handleTime);
    return () => video.removeEventListener('timeupdate', handleTime);
  }, [currentIndex]);

  // Auto-play on reel change
  useEffect(() => {
    const video = videoRef.current;
    if (video && isPlaying) {
      video.play().catch(() => {});
    }
  }, [currentIndex]);

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
            onClick={togglePlay}
            onMouseMove={showControlsTemporary}
            onTouchStart={showControlsTemporary}
          >
            <video
              ref={videoRef}
              src={currentReel?.media_url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={muted}
              playsInline
            />

            {/* Center play indicator */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-pink-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Sound toggle */}
            <button
              className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
              onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-5">
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-full">
                  <Heart
                    className={`w-6 h-6 ${
                      currentReel?.is_liked ? 'text-red-500 fill-red-500' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-white text-xs font-medium">{currentReel?.likes_count}</span>
              </motion.button>
              
              <button className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{currentReel?.comments_count}</span>
              </button>
              
              <button onClick={(e) => e.stopPropagation()}>
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-full">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </button>
              
              <button onClick={(e) => e.stopPropagation()}>
                <div className="p-2 bg-black/30 backdrop-blur-sm rounded-full">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>

            {/* User info */}
            <div className="absolute left-4 bottom-8 right-20">
              <Link to={`/profile/${currentReel?.profile.username}`} className="flex items-center gap-2.5 mb-2" onClick={(e) => e.stopPropagation()}>
                <img
                  src={currentReel?.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={currentReel?.profile.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                />
                <span className="text-white font-bold text-sm">{currentReel?.profile.username}</span>
              </Link>
              {currentReel?.caption && (
                <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">{currentReel.caption}</p>
              )}
            </div>

            {/* Progress indicator */}
            <div className="absolute top-2 left-0 right-0 flex gap-1 px-2">
              {reels.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
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
