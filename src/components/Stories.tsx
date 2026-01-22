import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';
import { toast } from 'sonner';

const Stories = () => {
  const { user } = useAuth();
  const { currentUserProfile } = useProfile();
  const { stories, isLoading, hasUserStory, deleteStory } = useStories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleStoryClick = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleCreateClick = () => {
    if (!user) {
      toast.error('Please sign in to add a story');
      return;
    }
    setShowCreateModal(true);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory.mutateAsync(storyId);
      toast.success('Story deleted');
      setViewerOpen(false);
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {/* Add Story Button */}
          <StoryItem
            username="Your story"
            avatar={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
            hasNewStory={hasUserStory}
            isAddButton={!hasUserStory}
            onClick={handleCreateClick}
            index={0}
          />
          
          {/* Other users' stories */}
          {stories
            .filter((story) => story.user_id !== user?.id)
            .map((story, index) => (
              <StoryItem
                key={story.id}
                username={story.profile?.username || 'User'}
                avatar={story.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                hasNewStory={true}
                onClick={() => handleStoryClick(index)}
                index={index + 1}
              />
            ))}
        </div>
      </div>

      <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      
      <StoryViewer
        stories={stories.filter((s) => s.user_id !== user?.id)}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onDelete={handleDeleteStory}
      />
    </>
  );
};

interface StoryItemProps {
  username: string;
  avatar: string;
  hasNewStory: boolean;
  isAddButton?: boolean;
  onClick?: () => void;
  index: number;
}

const StoryItem = ({ username, avatar, hasNewStory, isAddButton, onClick, index }: StoryItemProps) => (
  <motion.div
    className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
  >
    <div className={`relative ${hasNewStory ? 'story-ring' : 'p-[2px]'}`}>
      <div className="w-16 h-16 rounded-full overflow-hidden bg-card p-[2px]">
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      {isAddButton && (
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
          <Plus className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
    <span className="text-xs text-foreground truncate w-16 text-center">
      {username.length > 10 ? username.slice(0, 10) + '...' : username}
    </span>
  </motion.div>
);

export default Stories;
