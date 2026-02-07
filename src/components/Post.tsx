import { useState, memo } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Loader2, Sparkles } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { useVideoVisibility } from '@/hooks/useVideoVisibility';
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

const Post = memo(({ post, index }: PostProps) => {
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { likePost, unlikePost, deletePost } = usePosts();
  const { addComment } = useComments(post.id);
  const { ref: videoRef, isVisible } = useVideoVisibility(0.5);

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
      <article
        className="relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-3 sm:p-4">
          <Link to={`/profile/${post.profile.username}`} className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-card ring-2 ring-primary/30 p-[2px]">
                <img
                  src={post.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={post.profile.username}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
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
              <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary/50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-lg">
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
          ref={post.is_reel ? videoRef : undefined}
          className={`relative cursor-pointer overflow-hidden ${
            post.is_reel ? 'aspect-video bg-black' : 'aspect-square bg-muted/50'
          }`}
          onDoubleClick={handleDoubleTap}
        >
          {post.is_reel ? (
            <VideoPlayer
              src={post.media_url}
              className="w-full h-full"
              isVisible={isVisible}
              autoPlay={isVisible}
              loop
            />
          ) : (
            <img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          
          {/* Double-tap heart animation */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 animate-fade-in">
              <Heart className="w-24 h-24 sm:w-32 sm:h-32 text-white fill-primary drop-shadow-2xl animate-heart-pop" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={likePost.isPending || unlikePost.isPending}
                className="relative p-2 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-50 active:scale-90 transition-transform"
              >
                <Heart
                  className={`w-7 h-7 transition-colors duration-200 ${
                    post.is_liked 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-foreground hover:text-red-500'
                  }`}
                />
              </button>
              
              {/* Comment button */}
              <button 
                onClick={() => setShowComments(true)}
                className="p-2 rounded-full hover:bg-secondary/50 transition-colors active:scale-90 transition-transform"
              >
                <MessageCircle className="w-7 h-7 text-foreground hover:text-primary transition-colors" />
              </button>
              
              {/* Share button */}
              <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors active:scale-90 transition-transform">
                <Send className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
              </button>
            </div>
            
            {/* Save button */}
            <button 
              onClick={handleSave}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors active:scale-90 transition-transform"
            >
              <Bookmark
                className={`w-7 h-7 transition-colors duration-200 ${
                  isSaved ? 'text-primary fill-primary' : 'text-foreground hover:text-primary'
                }`}
              />
            </button>
          </div>

          {/* Likes & Comments stats */}
          <div className="flex items-center gap-4 mb-2">
            <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              {post.likes_count.toLocaleString()} {post.likes_count === 1 ? 'like' : 'likes'}
            </p>
            <button 
              className="font-bold text-sm text-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              {post.comments_count.toLocaleString()} {post.comments_count === 1 ? 'comment' : 'comments'}
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-foreground leading-relaxed">
              <Link to={`/profile/${post.profile.username}`} className="font-bold mr-2 hover:text-primary transition-colors">
                {post.profile.username}
              </Link>
              <span className="text-foreground">{post.caption}</span>
            </p>
          )}

          {/* View comments button */}
          {post.comments_count > 2 && (
            <button 
              className="text-sm text-muted-foreground mt-2 hover:text-primary transition-colors flex items-center gap-1.5"
              onClick={() => setShowComments(true)}
            >
              View all {post.comments_count} comments
            </button>
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
                  className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-secondary/50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>
              <button 
                type="submit"
                disabled={!newComment.trim() || addComment.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </article>

      <CommentsModal
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
});

Post.displayName = 'Post';

export default Post;
