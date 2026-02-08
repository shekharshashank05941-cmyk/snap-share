import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Heart, MessageCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import CommentsModal from '@/components/CommentsModal';
import { usePosts, PostWithDetails } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const Explore = () => {
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const { user } = useAuth();
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [showComments, setShowComments] = useState(false);

  const handleLike = (post: PostWithDetails) => {
    if (!user) return;
    if (post.is_liked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8 max-w-5xl mx-auto px-2 sm:px-4">
        <h1 className="text-xl font-semibold mb-4 sm:mb-6 px-2 sm:px-0">Explore</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts to explore yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2">
            {posts?.map((post, index) => (
              <motion.div
                key={post.id}
                className="aspect-square relative cursor-pointer group overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedPost(post)}
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
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 sm:gap-6 text-white">
                  <span className="flex items-center gap-1 text-xs sm:text-base">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1 text-xs sm:text-base">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    {post.comments_count}
                  </span>
                </div>
                {post.is_reel && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-card rounded-xl z-50 overflow-hidden flex flex-col md:flex-row"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Media */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[200px] md:min-h-0">
                {selectedPost.is_reel ? (
                  <video
                    src={selectedPost.media_url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain"
                    playsInline
                  />
                ) : (
                  <img
                    src={selectedPost.media_url}
                    alt="Post"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Details */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col border-l border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
                  <Link 
                    to={`/profile/${selectedPost.profile.username}`} 
                    className="flex items-center gap-3"
                    onClick={() => setSelectedPost(null)}
                  >
                    <img
                      src={selectedPost.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                      alt={selectedPost.profile.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold text-sm hover:underline">{selectedPost.profile.username}</span>
                  </Link>
                  <button 
                    onClick={() => setSelectedPost(null)} 
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption & Comments Preview */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                  {selectedPost.caption && (
                    <div className="flex gap-3 mb-4">
                      <img
                        src={selectedPost.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={selectedPost.profile.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-sm mr-2">{selectedPost.profile.username}</span>
                        <span className="text-sm">{selectedPost.caption}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(selectedPost.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPost.comments_count > 0 && (
                    <button 
                      onClick={() => setShowComments(true)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all {selectedPost.comments_count} comments
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 md:p-4 border-t border-border">
                  <div className="flex items-center gap-4 mb-3">
                    <motion.button
                      onClick={() => handleLike(selectedPost)}
                      whileTap={{ scale: 0.8 }}
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors ${
                          selectedPost.is_liked 
                            ? 'text-primary fill-primary' 
                            : 'text-foreground hover:text-muted-foreground'
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      onClick={() => setShowComments(true)}
                      whileTap={{ scale: 0.8 }}
                    >
                      <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground" />
                    </motion.button>
                  </div>
                  <p className="font-semibold text-sm">{selectedPost.likes_count} likes</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          postId={selectedPost.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default Explore;