export interface Story {
  id: string;
  username: string;
  avatar: string;
  hasNewStory: boolean;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Suggestion {
  id: string;
  username: string;
  avatar: string;
  subtitle: string;
}

export const stories: Story[] = [
  { id: '1', username: 'your_story', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop', hasNewStory: false },
  { id: '2', username: 'sarah_design', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '3', username: 'travel_mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '4', username: 'foodie_anna', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '5', username: 'tech_guru', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '6', username: 'nature_lover', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '7', username: 'fitness_pro', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', hasNewStory: true },
  { id: '8', username: 'art_lover', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', hasNewStory: true },
];

export const posts: Post[] = [
  {
    id: '1',
    username: 'sarah_design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    caption: 'Amazing sunset views from the mountains 🏔️ #travel #adventure #nature',
    likes: 1234,
    comments: 56,
    timeAgo: '2 hours ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    username: 'travel_mike',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=600&fit=crop',
    caption: 'Found this hidden gem in Bali 🌴 Paradise exists!',
    likes: 2567,
    comments: 89,
    timeAgo: '5 hours ago',
    isLiked: true,
    isSaved: false,
  },
  {
    id: '3',
    username: 'foodie_anna',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
    caption: 'Sunday brunch done right 🍳☕ #foodie #brunch #weekend',
    likes: 892,
    comments: 34,
    timeAgo: '8 hours ago',
    isLiked: false,
    isSaved: true,
  },
  {
    id: '4',
    username: 'nature_lover',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop',
    caption: 'Morning mist in the valley 🌿 Nature is healing',
    likes: 3421,
    comments: 127,
    timeAgo: '1 day ago',
    isLiked: false,
    isSaved: false,
  },
];

export const suggestions: Suggestion[] = [
  { id: '1', username: 'photography_pro', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop', subtitle: 'Followed by travel_mike' },
  { id: '2', username: 'urban_explorer', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop', subtitle: 'Suggested for you' },
  { id: '3', username: 'coffee_addict', avatar: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=150&h=150&fit=crop', subtitle: 'Followed by foodie_anna' },
  { id: '4', username: 'sunset_chaser', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop', subtitle: 'New to Instagram' },
];

export const currentUser = {
  username: 'john_doe',
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
};
