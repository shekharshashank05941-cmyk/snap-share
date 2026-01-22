import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
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
        className="bg-card border border-border rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4">
          <Link to={`/profile/${post.profile.username}`} className="flex items-center gap-2 sm:gap-3">
            <div className="story-ring">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-card p-[2px]">
                <img
                  src={post.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={post.profile.username}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{post.profile.username}</h3>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-foreground hover:text-muted-foreground transition-colors p-1"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.id === post.user_id && (
                <DropdownMenuItem
                  onClick={() => {
                    deletePost.mutate(post.id);
                    toast.success('Post deleted');
                  }}
                  className="text-destructive"
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
          className="relative aspect-square cursor-pointer bg-muted"
          onDoubleClick={handleDoubleTap}
        >
          {post.is_reel ? (
            <video
              src={post.media_url}
              controls
              className="w-full h-full object-cover"
              playsInline
            />
          ) : (
            <img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className="w-20 h-20 sm:w-24 sm:h-24 text-white fill-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.8 }}
                disabled={likePost.isPending || unlikePost.isPending}
                className="disabled:opacity-50"
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    post.is_liked 
                      ? 'text-primary fill-primary scale-110' 
                      : 'text-foreground hover:text-muted-foreground'
                  }`}
                />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComments(true)}
              >
                <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground transition-colors" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Send className="w-6 h-6 text-foreground hover:text-muted-foreground transition-colors" />
              </motion.button>
            </div>
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleSave}
            >
              <Bookmark
                className={`w-6 h-6 transition-colors ${
                  isSaved ? 'text-foreground fill-foreground' : 'text-foreground hover:text-muted-foreground'
                }`}
              />
            </motion.button>
          </div>

          {/* Likes */}
          <p className="font-semibold text-sm text-foreground mb-1 sm:mb-2">
            {post.likes_count.toLocaleString()} {post.likes_count === 1 ? 'like' : 'likes'}
          </p>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-foreground">
              <Link to={`/profile/${post.profile.username}`} className="font-semibold mr-2 hover:underline">
                {post.profile.username}
              </Link>
              {post.caption}
            </p>
          )}

          {/* Comments */}
          {post.comments_count > 0 && (
            <button 
              className="text-sm text-muted-foreground mt-1 sm:mt-2 hover:text-foreground transition-colors"
              onClick={() => setShowComments(true)}
            >
              View all {post.comments_count} comments
            </button>
          )}

          {/* Add Comment */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || addComment.isPending}
                className="text-sm font-semibold text-primary disabled:opacity-50 hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
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