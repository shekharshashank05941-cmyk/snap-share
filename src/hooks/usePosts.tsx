import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

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
  const { notifyLike } = useNotifications();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes and comments counts for each post
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          const [profileResult, likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from('profiles').select('username, avatar_url').eq('id', post.user_id).single(),
            supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
            supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
            user
              ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          return {
            ...post,
            profile: profileResult.data || { username: 'unknown', avatar_url: null },
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: !!userLikeResult.data,
            is_saved: false,
          } as PostWithDetails;
        })
      );

      return postsWithDetails;
    },
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

  return {
    posts,
    isLoading,
    createPost,
    likePost,
    unlikePost,
    deletePost,
  };
};
