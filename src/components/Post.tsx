import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import type { Post as PostType } from '@/data/mockData';

interface PostProps {
  post: PostType;
  index: number;
}

const Post = ({ post, index }: PostProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likes, setLikes] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(likes + 1);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <motion.article
      className="bg-card border border-border rounded-lg overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="story-ring">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-card p-[2px]">
              <img
                src={post.avatar}
                alt={post.username}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{post.username}</h3>
            <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-foreground hover:text-muted-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Image */}
      <div
        className="relative aspect-square cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.image}
          alt="Post"
          className="w-full h-full object-cover"
        />
        <AnimatePresence>
          {showHeart && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              className={isLiked ? 'animate-heart-pop' : ''}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'text-primary fill-primary' : 'text-foreground hover:text-muted-foreground'
                }`}
              />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground transition-colors" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Send className="w-6 h-6 text-foreground hover:text-muted-foreground transition-colors" />
            </motion.button>
          </div>
          <motion.button
            onClick={() => setIsSaved(!isSaved)}
            whileTap={{ scale: 0.8 }}
          >
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                isSaved ? 'text-foreground fill-foreground' : 'text-foreground hover:text-muted-foreground'
              }`}
            />
          </motion.button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm text-foreground mb-2">
          {likes.toLocaleString()} likes
        </p>

        {/* Caption */}
        <p className="text-sm text-foreground">
          <span className="font-semibold mr-2">{post.username}</span>
          {post.caption}
        </p>

        {/* Comments */}
        <button className="text-sm text-muted-foreground mt-2 hover:text-foreground transition-colors">
          View all {post.comments} comments
        </button>

        {/* Add Comment */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="text-sm font-semibold text-primary opacity-50 hover:opacity-100 transition-opacity">
            Post
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default Post;
