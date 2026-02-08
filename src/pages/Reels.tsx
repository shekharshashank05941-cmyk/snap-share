import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import ReelItem from '@/components/ReelItem';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Reels = () => {
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const reels = posts?.filter((post) => post.is_reel) || [];

  // IntersectionObserver to detect which reel is visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels.length]);

  const handleLike = useCallback(
    (reelId: string, isLiked: boolean) => {
      if (!user) return;
      if (isLiked) {
        unlikePost.mutate(reelId);
      } else {
        likePost.mutate(reelId);
      }
    },
    [user, likePost, unlikePost]
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
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
    <div className="h-[100dvh] bg-black flex flex-col overflow-hidden">
      <Navbar />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            ref={(el) => { reelRefs.current[index] = el; }}
            data-index={index}
            className="h-[100dvh] w-full snap-start snap-always"
          >
            <ReelItem
              reel={reel}
              isActive={activeIndex === index}
              muted={muted}
              onToggleMute={toggleMute}
              onLike={() => handleLike(reel.id, reel.is_liked)}
            />
          </div>
        ))}
      </div>

      <MobileNav />
    </div>
  );
};

export default Reels;
