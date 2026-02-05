import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, PostWithDetails } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import CommentsModal from './CommentsModal';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface PostProps {
  post: PostWithDetails;
  index: number;
}

const Post = ({ post, index }: PostProps) => {
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { likePost, unlikePost, deletePost } = usePosts();
  const { addComment } = useComments(post.id);

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }
    if (post.is_liked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  const handleDoubleTap = () => {
    if (!user) return;
    if (!post.is_liked) {
      likePost.mutate(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    addComment.mutate(newComment);
    setNewComment('');
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Please sign in to save posts');
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to collection');
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <>
      <motion.article
        className="relative bg-gradient-to-br from-card via-card to-card/80 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-3 sm:p-4">
          <Link to={`/profile/${post.profile.username}`} className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              {/* Animated ring */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-full opacity-75 blur-sm group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-card p-[2px] ring-2 ring-background">
                <img
                  src={post.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={post.profile.username}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {post.profile.username}
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary/50"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
              {user?.id === post.user_id && (
                <DropdownMenuItem
                  onClick={() => {
                    deletePost.mutate(post.id);
                    toast.success('Post deleted');
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Media */}
        <div
          className={`relative cursor-pointer overflow-hidden ${
            post.is_reel ? 'aspect-video bg-black' : 'aspect-square bg-muted/50'
          }`}
          onDoubleClick={handleDoubleTap}
        >
          {post.is_reel ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={post.media_url}
                controls
                className="w-full h-full object-contain"
                playsInline
                preload="metadata"
              />
              {/* Play button overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
            </div>
          ) : (
            <motion.img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            />
          )}
          
          {/* Double-tap heart animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Heart className="w-24 h-24 sm:w-32 sm:h-32 text-white fill-primary drop-shadow-2xl" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>

        {/* Actions */}
        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {/* Like button */}
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.7 }}
                disabled={likePost.isPending || unlikePost.isPending}
                className="relative p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                <motion.div
                  animate={post.is_liked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-7 h-7 transition-all duration-300 ${
                      post.is_liked 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-foreground hover:text-red-500'
                    }`}
                  />
                </motion.div>
                {post.is_liked && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>
              
              {/* Comment button */}
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComments(true)}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <MessageCircle className="w-7 h-7 text-foreground hover:text-primary transition-colors" />
              </motion.button>
              
              {/* Share button */}
              <motion.button 
                whileHover={{ scale: 1.1, x: 2 }} 
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <Send className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
              </motion.button>
            </div>
            
            {/* Save button */}
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <motion.div
                animate={isSaved ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  className={`w-7 h-7 transition-all duration-300 ${
                    isSaved ? 'text-primary fill-primary' : 'text-foreground hover:text-primary'
                  }`}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Likes & Comments stats */}
          <div className="flex items-center gap-4 mb-2">
            <motion.p 
              className="font-bold text-sm text-foreground flex items-center gap-1.5"
              key={post.likes_count}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              {post.likes_count.toLocaleString()} {post.likes_count === 1 ? 'like' : 'likes'}
            </motion.p>
            <motion.button 
              className="font-bold text-sm text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
              onClick={() => setShowComments(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              {post.comments_count.toLocaleString()} {post.comments_count === 1 ? 'comment' : 'comments'}
            </motion.button>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-foreground leading-relaxed">
              <Link to={`/profile/${post.profile.username}`} className="font-bold mr-2 hover:text-primary transition-colors">
                {post.profile.username}
              </Link>
              <span className="text-white">{post.caption}</span>
            </p>
          )}

          {/* View comments button - only show if more than 2 comments */}
          {post.comments_count > 2 && (
            <motion.button 
              className="text-sm text-muted-foreground mt-2 hover:text-primary transition-colors flex items-center gap-1.5"
              onClick={() => setShowComments(true)}
              whileHover={{ x: 3 }}
            >
              View all {post.comments_count} comments
            </motion.button>
          )}

          {/* Add Comment Input */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-secondary/50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/60"
                />
              </div>
              <motion.button 
                type="submit"
                disabled={!newComment.trim() || addComment.isPending}
                className="px-4 py-2 bg-gradient-to-r from-primary to-pink-500 text-white rounded-full text-sm font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-1.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.article>

      <CommentsModal
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
};

export default Post;
