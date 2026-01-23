import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { notifyComment } from '@/lib/notifications';

export interface CommentWithProfile {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profile: profile || { username: 'unknown', avatar_url: null },
          } as CommentWithProfile;
        })
      );

      return commentsWithProfiles;
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user!.id,
        content,
      });
      if (error) throw error;
      return content;
    },
    onSuccess: async (content) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Notify post owner about the comment
      const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
      if (post && post.user_id !== user?.id) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', user!.id).single();
        if (profile) {
          notifyComment(profile.username, content);
        }
      }
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
  };
};
