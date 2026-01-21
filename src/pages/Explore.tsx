import { motion } from 'framer-motion';
import { Film, Heart, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { usePosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';

const Explore = () => {
  const { posts, isLoading } = usePosts();

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <main className="pt-20 pb-20 max-w-5xl mx-auto px-4">
        <h1 className="text-xl font-semibold mb-6">Explore</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts to explore yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts?.map((post) => (
              <motion.div
                key={post.id}
                className="aspect-square relative cursor-pointer group"
                whileHover={{ scale: 0.98 }}
              >
                {post.is_reel ? (
                  <video
                    src={post.media_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={post.media_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <span className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-white" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {post.comments_count}
                  </span>
                </div>
                {post.is_reel && (
                  <div className="absolute top-2 right-2">
                    <Film className="w-5 h-5 text-white drop-shadow" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default Explore;
