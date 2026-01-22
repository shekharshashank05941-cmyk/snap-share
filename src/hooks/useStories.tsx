import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  created_at: string;
  expires_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export const useStories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      // Fetch active stories
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(storiesData.map((s) => s.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);

      // Group stories by user
      const groupedStories = new Map<string, Story[]>();
      
      storiesData.forEach((story) => {
        const profile = profilesMap.get(story.user_id);
        const storyWithProfile = {
          ...story,
          profile: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
          } : undefined,
        };
        
        if (!groupedStories.has(story.user_id)) {
          groupedStories.set(story.user_id, []);
        }
        groupedStories.get(story.user_id)!.push(storyWithProfile);
      });

      // Return latest story per user (for display) but keep all stories
      const latestPerUser: Story[] = [];
      groupedStories.forEach((userStories) => {
        if (userStories.length > 0) {
          latestPerUser.push(userStories[0]);
        }
      });

      return latestPerUser;
    },
  });

  const createStory = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Must be logged in');

      // Upload media
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Create story record
      const { error } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: publicUrl,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  const hasUserStory = stories.some((s) => s.user_id === user?.id);

  return {
    stories,
    isLoading,
    createStory,
    deleteStory,
    hasUserStory,
  };
};

