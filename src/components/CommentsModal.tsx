import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Heart, Loader2 } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface CommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsModal = ({ postId, isOpen, onClose }: CommentsModalProps) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useComments(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    addComment.mutate(newComment);
    setNewComment('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-xl z-50 overflow-hidden max-h-[85vh] flex flex-col shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-50%' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-lg">Comments</h2>
              <motion.button 
                onClick={onClose} 
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No comments yet</p>
                  <p className="text-sm text-muted-foreground/70">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments?.map((comment, index) => (
                  <motion.div 
                    key={comment.id} 
                    className="flex gap-3 group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/profile/${comment.profile.username}`}>
                      <img
                        src={comment.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={comment.profile.username}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link to={`/profile/${comment.profile.username}`}>
                            <span className="font-semibold text-sm hover:underline">{comment.profile.username}</span>
                          </Link>
                          <span className="text-sm ml-2 break-words">{comment.content}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {user?.id === comment.user_id && (
                            <motion.button
                              onClick={() => deleteComment.mutate(comment.id)}
                              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              whileTap={{ scale: 0.8 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button 
                            className="text-muted-foreground hover:text-primary p-1"
                            whileTap={{ scale: 0.8 }}
                          >
                            <Heart className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border flex gap-2 sm:gap-3 items-center">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
                  alt="You"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow min-w-0"
                />
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || addComment.isPending}
                  className="text-primary disabled:opacity-50 p-2"
                  whileTap={{ scale: 0.9 }}
                >
                  {addComment.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </form>
            ) : (
              <div className="p-4 border-t border-border text-center">
                <Link to="/auth" className="text-primary font-semibold hover:opacity-80">
                  Sign in to comment
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;