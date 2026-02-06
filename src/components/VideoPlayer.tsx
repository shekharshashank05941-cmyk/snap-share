import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  isVisible?: boolean;
}

const VideoPlayer = ({ src, className = '', autoPlay = false, loop = true, isVisible = true }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout>();

  // Auto-pause when not visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isVisible) {
      video.pause();
      setIsPlaying(false);
    } else if (autoPlay) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isVisible, autoPlay]);

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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const prog = (video.currentTime / video.duration) * 100;
    setProgress(prog);
    setCurrentTime(video.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;
    const buf = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
    setBuffered(buf);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  }, []);

  const showControlsTemporary = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (isPlaying) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    } else {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); };
  }, [isPlaying]);

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer select-none ${className}`}
      onClick={togglePlay}
      onMouseMove={showControlsTemporary}
      onTouchStart={showControlsTemporary}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        loop={loop}
        muted={isMuted}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
      />

      {/* Center play/pause button */}
      <AnimatePresence>
        {(!isPlaying || showControls) && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!isPlaying && (
              <motion.div
                className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay at bottom */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-2 px-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2 group/progress hover:h-2.5 transition-all"
              onClick={handleProgressClick}
            >
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                {/* Thumb */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={togglePlay}
                  whileTap={{ scale: 0.85 }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  )}
                </motion.button>

                <motion.button
                  onClick={toggleMute}
                  whileTap={{ scale: 0.85 }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </motion.button>

                <span className="text-white/80 text-xs font-mono tracking-wide">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <motion.button
                onClick={toggleFullscreen}
                whileTap={{ scale: 0.85 }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
