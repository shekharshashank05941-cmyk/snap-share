import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export const useProfile = (username?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { notifyFollow } = useNotifications();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username!)
        .single();

      if (error) throw error;

      const [postsResult, followersResult, followingResult, isFollowingResult] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', profileData.id),
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', profileData.id),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', profileData.id),
        user
          ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profileData.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...profileData,
        posts_count: postsResult.count || 0,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0,
        is_following: !!isFollowingResult.data,
      } as Profile;
    },
    enabled: !!username,
  });

  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
    },
  });

  const followUser = useMutation({
    mutationFn: async (followingId: string) => {
      const { error } = await supabase.from('follows').insert({
        follower_id: user!.id,
        following_id: followingId,
      });
      if (error) throw error;
      return followingId;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Notify the person being followed
      const { data: followerProfile } = await supabase.from('profiles').select('username').eq('id', user!.id).single();
      if (followerProfile) {
        notifyFollow(followerProfile.username);
      }
    },
  });

  const unfollowUser = useMutation({
    mutationFn: async (followingId: string) => {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user!.id)
        .eq('following_id', followingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    currentUserProfile,
    isLoading,
    updateProfile,
    followUser,
    unfollowUser,
  };
};
