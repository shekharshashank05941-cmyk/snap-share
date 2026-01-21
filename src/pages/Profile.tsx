import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid3X3, Film, Bookmark, Settings } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { profile, isLoading, followUser, unfollowUser } = useProfile(username);
  const { posts } = usePosts();

  const userPosts = posts?.filter((post) => post.profile.username === username) || [];
  const userReels = userPosts.filter((post) => post.is_reel);
  const isOwnProfile = user && profile && user.id === profile.id;

  const handleFollowToggle = () => {
    if (!profile) return;
    if (profile.is_following) {
      unfollowUser.mutate(profile.id);
    } else {
      followUser.mutate(profile.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <main className="pt-20 pb-20 max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <main className="pt-20 pb-20 max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
          <motion.div
            className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-xl font-light">{profile.username}</h1>
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Edit Profile</Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleFollowToggle}
                  variant={profile.is_following ? 'secondary' : 'default'}
                  size="sm"
                  className={!profile.is_following ? 'instagram-gradient text-white' : ''}
                >
                  {profile.is_following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-4">
              <span><strong>{profile.posts_count}</strong> posts</span>
              <span><strong>{profile.followers_count}</strong> followers</span>
              <span><strong>{profile.following_count}</strong> following</span>
            </div>

            {profile.full_name && (
              <p className="font-semibold">{profile.full_name}</p>
            )}
            {profile.bio && (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                {profile.website}
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex justify-center gap-12">
            <button className="flex items-center gap-2 py-4 border-t border-foreground -mt-px">
              <Grid3X3 className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Posts</span>
            </button>
            <button className="flex items-center gap-2 py-4 text-muted-foreground">
              <Film className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Reels</span>
            </button>
            {isOwnProfile && (
              <button className="flex items-center gap-2 py-4 text-muted-foreground">
                <Bookmark className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Saved</span>
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {userPosts.map((post) => (
            <motion.div
              key={post.id}
              className="aspect-square relative cursor-pointer group"
              whileHover={{ scale: 0.98 }}
            >
              {post.is_reel ? (
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={post.media_url}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                <span className="flex items-center gap-1">
                  ❤️ {post.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  💬 {post.comments_count}
                </span>
              </div>
              {post.is_reel && (
                <div className="absolute top-2 right-2">
                  <Film className="w-5 h-5 text-white drop-shadow" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {userPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
};

export default Profile;
