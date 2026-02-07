import { useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Stories from '@/components/Stories';
import Post from '@/components/Post';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import PullToRefresh from '@/components/PullToRefresh';
import { usePosts } from '@/hooks/usePosts';
import { useBotLikes } from '@/hooks/useBotLikes';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, ImageIcon, Loader2 } from 'lucide-react';

const Index = () => {
  const { posts, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();
  const { isSupported, permission, requestPermission } = useNotifications();
  const isMobile = useIsMobile();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Enable bot likes simulation
  useBotLikes(posts);

  useEffect(() => {
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const feedContent = (
    <>
      <Stories />
      
      <div className="space-y-5 sm:space-y-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : posts?.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Follow someone or create a post to get started!
            </p>
          </div>
        ) : (
          <>
            {posts?.map((post, index) => (
              <Post key={post.id} post={post} index={index} />
            ))}
            
            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Loading more posts...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-muted-foreground">Scroll for more</span>
              ) : posts.length > 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="relative pt-20 pb-24 md:pb-8 max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex gap-4 lg:gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-[470px] mx-auto lg:mx-0">
            {/* Feed header */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-lg text-foreground">Your Feed</h2>
            </div>
            
            {isMobile ? (
              <PullToRefresh onRefresh={handleRefresh}>
                {feedContent}
              </PullToRefresh>
            ) : (
              feedContent
            )}
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
