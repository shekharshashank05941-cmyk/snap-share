import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { notifyLike } from '@/lib/notifications';

export interface PostWithDetails {
  id: string;
  user_id: string;
  media_url: string;
  caption: string | null;
  is_reel: boolean;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

export const usePosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!postsData.length) return [];

      // Batch fetch all related data in parallel
      const postIds = postsData.map(p => p.id);
      const userIds = [...new Set(postsData.map(p => p.user_id))];

      const [profilesResult, likesResult, commentsResult, userLikesResult] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').in('id', userIds),
        supabase.from('likes').select('post_id'),
        supabase.from('comments').select('post_id'),
        user
          ? supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
          : Promise.resolve({ data: [] }),
      ]);

      // Create lookup maps for O(1) access
      const profilesMap = new Map(
        (profilesResult.data || []).map(p => [p.id, { username: p.username, avatar_url: p.avatar_url }])
      );
      
      const likesCountMap = new Map<string, number>();
      (likesResult.data || []).forEach(like => {
        likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1);
      });
      
      const commentsCountMap = new Map<string, number>();
      (commentsResult.data || []).forEach(comment => {
        commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1);
      });
      
      const userLikedPosts = new Set((userLikesResult.data || []).map(l => l.post_id));

      return postsData.map(post => ({
        ...post,
        profile: profilesMap.get(post.user_id) || { username: 'unknown', avatar_url: null },
        likes_count: likesCountMap.get(post.id) || 0,
        comments_count: commentsCountMap.get(post.id) || 0,
        is_liked: userLikedPosts.has(post.id),
        is_saved: false,
      })) as PostWithDetails[];
    },
    staleTime: 30000, // Cache for 30 seconds to prevent unnecessary refetches
  });

  const createPost = useMutation({
    mutationFn: async ({ mediaUrl, caption, isReel }: { mediaUrl: string; caption: string; isReel: boolean }) => {
      const { error } = await supabase.from('posts').insert({
        user_id: user!.id,
        media_url: mediaUrl,
        caption,
        is_reel: isReel,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('likes').insert({
        post_id: postId,
        user_id: user!.id,
      });
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Get post owner info and notify (only if not liking own post)
      const post = posts?.find(p => p.id === postId);
      if (post && post.user_id !== user?.id) {
        // Get current user's profile for notification
        supabase.from('profiles').select('username').eq('id', user!.id).single()
          .then(({ data: profile }) => {
            if (profile) {
              notifyLike(profile.username, post.caption || undefined);
            }
          });
      }
    },
  });

  const unlikePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const { refetch } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => posts,
    enabled: false,
  });

  return {
    posts,
    isLoading,
    createPost,
    likePost,
    unlikePost,
    deletePost,
    refetch: queryClient.invalidateQueries.bind(queryClient, { queryKey: ['posts'] }),
  };
};
