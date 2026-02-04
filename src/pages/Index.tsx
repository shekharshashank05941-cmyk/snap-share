import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { Sparkles, ImageIcon } from 'lucide-react';

const Index = () => {
  const { posts, isLoading, refetch } = usePosts();
  const { isSupported, permission, requestPermission } = useNotifications();
  const isMobile = useIsMobile();
  
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
              <motion.div 
                key={i} 
                className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
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
              </motion.div>
            ))}
          </>
        ) : posts?.length === 0 ? (
          <motion.div 
            className="text-center py-16 px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Follow someone or create a post to get started!
            </p>
          </motion.div>
        ) : (
          posts?.map((post, index) => (
            <Post key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 dark">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="relative pt-20 pb-24 md:pb-8 max-w-5xl mx-auto px-2 sm:px-4">
        <div className="flex gap-4 lg:gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-[470px] mx-auto lg:mx-0">
            {/* Feed header */}
            <motion.div 
              className="flex items-center gap-2 mb-4 px-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-2 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-lg text-foreground">Your Feed</h2>
            </motion.div>
            
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
