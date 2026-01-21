import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { stories } from '@/data/mockData';

const Stories = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {stories.map((story, index) => (
          <StoryItem
            key={story.id}
            username={story.username}
            avatar={story.avatar}
            hasNewStory={story.hasNewStory}
            isFirst={index === 0}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

interface StoryItemProps {
  username: string;
  avatar: string;
  hasNewStory: boolean;
  isFirst?: boolean;
  index: number;
}

const StoryItem = ({ username, avatar, hasNewStory, isFirst, index }: StoryItemProps) => (
  <motion.div
    className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05 }}
  >
    <div className={`relative ${hasNewStory ? 'story-ring' : 'p-[2px]'}`}>
      <div className="w-16 h-16 rounded-full overflow-hidden bg-card p-[2px]">
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      {isFirst && (
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
          <Plus className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
    <span className="text-xs text-foreground truncate w-16 text-center">
      {isFirst ? 'Your story' : username.length > 10 ? username.slice(0, 10) + '...' : username}
    </span>
  </motion.div>
);

export default Stories;
