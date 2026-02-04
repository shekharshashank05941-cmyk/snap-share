import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PostWithDetails } from './usePosts';

// Bot names for simulating engagement
const BOT_NAMES = [
  'alex_photo', 'maya_arts', 'travel_jen', 'foodie_sam', 'fitness_pro',
  'music_lover', 'tech_guru', 'nature_cam', 'style_queen', 'gaming_ace',
  'chef_mike', 'yoga_life', 'pet_paradise', 'book_worm', 'movie_buff'
];

export const useBotLikes = (posts: PostWithDetails[] | undefined) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLikeTime = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // Add random bot likes every 3-8 seconds
    const addBotLike = () => {
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const now = Date.now();
      const lastLike = lastLikeTime.current.get(randomPost.id) || 0;
      
      // Don't like the same post too frequently
      if (now - lastLike < 10000) return;
      
      lastLikeTime.current.set(randomPost.id, now);
      
      // Optimistically update the post's like count
      queryClient.setQueryData(['posts', null], (oldPosts: PostWithDetails[] | undefined) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map(post => 
          post.id === randomPost.id 
            ? { ...post, likes_count: post.likes_count + Math.floor(Math.random() * 3) + 1 }
            : post
        );
      });

      // Also update for authenticated users
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts: PostWithDetails[] | undefined) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map(post => 
          post.id === randomPost.id 
            ? { ...post, likes_count: post.likes_count + Math.floor(Math.random() * 2) + 1 }
            : post
        );
      });
    };

    // Start the interval
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance to trigger
        addBotLike();
      }
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [posts, queryClient]);

  return { botNames: BOT_NAMES };
};
