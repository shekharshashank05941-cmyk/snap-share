import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2 } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

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
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-xl z-50 overflow-hidden max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-50%' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Comments</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : comments?.length === 0 ? (
                <p className="text-center text-muted-foreground">No comments yet. Be the first!</p>
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                      alt={comment.profile.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-sm">{comment.profile.username}</span>
                          <span className="text-sm ml-2">{comment.content}</span>
                        </div>
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => deleteComment.mutate(comment.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="text-primary disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-border text-center text-muted-foreground">
                Sign in to comment
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;
