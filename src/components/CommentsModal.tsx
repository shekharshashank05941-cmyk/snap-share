import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Heart, Loader2, MessageCircle, Sparkles } from 'lucide-react';
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
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useComments(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    addComment.mutate(newComment);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-x-3 sm:inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
            initial={{ opacity: 0, scale: 0.9, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-40%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative bg-gradient-to-br from-card via-card to-card/95 rounded-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl shadow-black/50 border border-border/30">
              {/* Gradient border glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-pink-500/30 opacity-50 pointer-events-none" />
              
              {/* Header */}
              <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-pink-500/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Comments</h2>
                    <p className="text-xs text-muted-foreground">{comments?.length || 0} comments</p>
                  </div>
                </div>
                <motion.button 
                  onClick={onClose} 
                  className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Comments List */}
              <div className="relative flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[200px] max-h-[50vh] custom-scrollbar touch-scroll">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-8 h-8 text-primary" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Loading comments...</p>
                  </div>
                ) : comments?.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-primary/60" />
                    </div>
                    <p className="text-foreground font-semibold text-lg mb-1">No comments yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </motion.div>
                ) : (
                  comments?.map((comment, index) => (
                    <motion.div 
                      key={comment.id} 
                      className="group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex gap-3 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300">
                        <Link to={`/profile/${comment.profile.username}`} className="flex-shrink-0">
                          <motion.div 
                            className="relative"
                            whileHover={{ scale: 1.1 }}
                          >
                            <img
                              src={comment.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                              alt={comment.profile.username}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                          </motion.div>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Link to={`/profile/${comment.profile.username}`}>
                                  <span className="font-bold text-sm hover:text-primary transition-colors text-foreground">
                                    {comment.profile.username}
                                  </span>
                                </Link>
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                  • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/90 break-words leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {user?.id === comment.user_id && (
                                <motion.button
                                  onClick={() => deleteComment.mutate(comment.id)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              )}
                              <motion.button 
                                onClick={() => handleLikeComment(comment.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                whileTap={{ scale: 0.8 }}
                              >
                                <Heart 
                                  className={`w-4 h-4 transition-all ${
                                    likedComments.has(comment.id) 
                                      ? 'text-red-500 fill-red-500' 
                                      : 'text-muted-foreground hover:text-red-500'
                                  }`} 
                                />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add Comment Section */}
              {user ? (
                <div className="relative p-4 sm:p-5 border-t border-border/50 bg-gradient-to-r from-primary/5 to-pink-500/5">
                  <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                    <div className="relative flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
                        alt="You"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                      />
                    </div>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-secondary/50 hover:bg-secondary focus:bg-secondary rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/60 text-foreground"
                      />
                    </div>
                    
                    <motion.button
                      type="submit"
                      disabled={!newComment.trim() || addComment.isPending}
                      className="p-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-primary/30 transition-all flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {addComment.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </form>
                </div>
              ) : (
                <div className="relative p-5 border-t border-border/50 bg-gradient-to-r from-primary/5 to-pink-500/5 text-center">
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Sign in to comment
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;
