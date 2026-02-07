import { useState } from 'react';
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
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {/* Add Story Button */}
          <StoryItem
            username="Your story"
            avatar={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
            hasNewStory={hasUserStory}
            isAddButton={!hasUserStory}
            onClick={handleCreateClick}
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
}

const StoryItem = ({ username, avatar, hasNewStory, isAddButton, onClick }: StoryItemProps) => (
  <div
    className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
    onClick={onClick}
  >
    <div className={`relative ${hasNewStory ? 'story-ring' : 'p-[2px]'}`}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-card p-[2px]">
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      </div>
      {isAddButton && (
        <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
        </div>
      )}
    </div>
    <span className="text-[10px] sm:text-xs text-foreground truncate w-14 sm:w-16 text-center">
      {username.length > 8 ? username.slice(0, 8) + '...' : username}
    </span>
  </div>
);

export default Stories;
