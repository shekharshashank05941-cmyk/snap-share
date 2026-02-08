import { useRef, useEffect, useState, memo } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Volume2, VolumeX, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PostWithDetails } from '@/hooks/usePosts';

interface ReelItemProps {
  reel: PostWithDetails;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onLike: () => void;
}

const ReelItem = memo(({ reel, isActive, muted, onToggleMute, onLike }: ReelItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    video.addEventListener('timeupdate', handleTime);
    return () => video.removeEventListener('timeupdate', handleTime);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-full w-full snap-start snap-always flex items-center justify-center bg-black">
      <div
        className="relative w-full max-w-md h-full max-h-[100dvh] overflow-hidden"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={reel.media_url}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          preload={isActive ? 'auto' : 'metadata'}
        />

        {/* Center play indicator */}
        {!isPlaying && isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border border-white/20">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Sound toggle */}
        <button
          className="absolute top-4 right-4 p-2.5 bg-black/40 rounded-full border border-white/10 z-10"
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Actions */}
        <div className="absolute right-3 bottom-24 flex flex-col gap-5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          >
            <div className="p-2 bg-black/30 rounded-full">
              <Heart
                className={`w-6 h-6 ${
                  reel.is_liked ? 'text-red-500 fill-red-500' : 'text-white'
                }`}
              />
            </div>
            <span className="text-white text-xs font-medium">{reel.likes_count}</span>
          </button>

          <button className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 bg-black/30 rounded-full">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium">{reel.comments_count}</span>
          </button>

          <button onClick={(e) => e.stopPropagation()}>
            <div className="p-2 bg-black/30 rounded-full">
              <Send className="w-6 h-6 text-white" />
            </div>
          </button>

          <button onClick={(e) => e.stopPropagation()}>
            <div className="p-2 bg-black/30 rounded-full">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* User info */}
        <div className="absolute left-4 bottom-8 right-20 z-10">
          <Link
            to={`/profile/${reel.profile.username}`}
            className="flex items-center gap-2.5 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={reel.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
              alt={reel.profile.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
              loading="lazy"
            />
            <span className="text-white font-bold text-sm">{reel.profile.username}</span>
          </Link>
          {reel.caption && (
            <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">{reel.caption}</p>
          )}
        </div>
      </div>
    </div>
  );
});

ReelItem.displayName = 'ReelItem';

export default ReelItem;
