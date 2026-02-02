import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  username: string;
}

interface FollowUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
}

const FollowersModal = ({ isOpen, onClose, userId, type, username }: FollowersModalProps) => {
  const { user } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: [type, userId],
    queryFn: async () => {
      if (type === 'followers') {
        // Get users who follow this profile
        const { data: follows, error } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId);

        if (error) throw error;

        const followerIds = follows.map(f => f.follower_id);
        if (followerIds.length === 0) return [];

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', followerIds);

        if (profilesError) throw profilesError;

        // Check if current user follows each of these users
        const usersWithFollowStatus = await Promise.all(
          profiles.map(async (profile) => {
            let isFollowing = false;
            if (user && user.id !== profile.id) {
              const { data } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', profile.id)
                .maybeSingle();
              isFollowing = !!data;
            }
            return { ...profile, is_following: isFollowing };
          })
        );

        return usersWithFollowStatus as FollowUser[];
      } else {
        // Get users this profile follows
        const { data: follows, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);

        if (error) throw error;

        const followingIds = follows.map(f => f.following_id);
        if (followingIds.length === 0) return [];

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', followingIds);

        if (profilesError) throw profilesError;

        // Check if current user follows each of these users
        const usersWithFollowStatus = await Promise.all(
          profiles.map(async (profile) => {
            let isFollowing = false;
            if (user && user.id !== profile.id) {
              const { data } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', profile.id)
                .maybeSingle();
              isFollowing = !!data;
            }
            return { ...profile, is_following: isFollowing };
          })
        );

        return usersWithFollowStatus as FollowUser[];
      }
    },
    enabled: isOpen,
  });

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    });
  };

  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card w-full max-w-md rounded-xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold capitalize text-foreground">{type}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="p-2">
                {users.map((followUser) => (
                  <div
                    key={followUser.id}
                    className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <Link
                      to={`/profile/${followUser.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1"
                    >
                      <img
                        src={followUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={followUser.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">{followUser.username}</p>
                        {followUser.full_name && (
                          <p className="text-sm text-muted-foreground truncate">{followUser.full_name}</p>
                        )}
                      </div>
                    </Link>
                    {user && user.id !== followUser.id && (
                      <Button
                        variant={followUser.is_following ? 'secondary' : 'default'}
                        size="sm"
                        className={`rounded-lg ${!followUser.is_following ? 'instagram-gradient text-white' : ''}`}
                        onClick={() => followUser.is_following ? handleUnfollow(followUser.id) : handleFollow(followUser.id)}
                      >
                        {followUser.is_following ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {type === 'followers' 
                  ? `${username} has no followers yet.`
                  : `${username} isn't following anyone yet.`
                }
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowersModal;
