import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Film, Bookmark, Settings, BadgeCheck, MapPin, Link as LinkIcon, Calendar, Heart, MessageCircle, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, PostWithDetails } from '@/hooks/usePosts';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import CommentsModal from '@/components/CommentsModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { profile, isLoading, followUser, unfollowUser } = useProfile(username);
  const { posts, likePost, unlikePost } = usePosts();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const userPosts = posts?.filter((post) => post.profile.username === username) || [];
  const userReels = userPosts.filter((post) => post.is_reel);
  const regularPosts = userPosts.filter((post) => !post.is_reel);
  const isOwnProfile = user && profile && user.id === profile.id;

  const handleFollowToggle = () => {
    if (!profile) return;
    if (profile.is_following) {
      unfollowUser.mutate(profile.id);
    } else {
      followUser.mutate(profile.id);
    }
  };

  const handlePostClick = (post: PostWithDetails) => {
    setSelectedPost(post);
  };

  const handleLike = (post: PostWithDetails) => {
    if (!user) return;
    if (post.is_liked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const displayPosts = activeTab === 'reels' ? userReels : regularPosts;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <main className="pt-20 pb-24 md:pb-8 max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-8">
            <Skeleton className="w-24 h-24 md:w-36 md:h-36 rounded-full" />
            <div className="flex-1 space-y-4 w-full">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <div className="flex justify-center md:justify-start gap-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full max-w-md mx-auto md:mx-0" />
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
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = format(new Date(profile.created_at), 'MMMM yyyy');

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <main className="pt-20 pb-24 md:pb-8 max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-8">
          {/* Avatar */}
          <motion.div
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="story-ring p-1">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden bg-card">
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop'}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left w-full">
            {/* Username & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-light">{profile.username}</h1>
                <BadgeCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="secondary" size="sm" className="rounded-lg">
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-lg">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      variant={profile.is_following ? 'secondary' : 'default'}
                      size="sm"
                      className={`rounded-lg ${!profile.is_following ? 'instagram-gradient text-white' : ''}`}
                    >
                      {profile.is_following ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-lg">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats - Cards Style */}
            <div className="flex justify-center md:justify-start gap-4 md:gap-8 mb-4">
              <motion.div 
                className="bg-card border border-border rounded-xl p-3 md:p-4 min-w-[80px] text-center"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg md:text-xl font-bold">{profile.posts_count}</p>
                <p className="text-xs text-muted-foreground">posts</p>
              </motion.div>
              <motion.div 
                className="bg-card border border-border rounded-xl p-3 md:p-4 min-w-[80px] text-center cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg md:text-xl font-bold">{profile.followers_count}</p>
                <p className="text-xs text-muted-foreground">followers</p>
              </motion.div>
              <motion.div 
                className="bg-card border border-border rounded-xl p-3 md:p-4 min-w-[80px] text-center cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg md:text-xl font-bold">{profile.following_count}</p>
                <p className="text-xs text-muted-foreground">following</p>
              </motion.div>
            </div>

            {/* Bio Section */}
            <div className="space-y-1">
              {profile.full_name && (
                <p className="font-semibold">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-muted-foreground mt-2">
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex justify-center gap-8 md:gap-16">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-3 md:py-4 border-t-2 -mt-px transition-colors ${
                activeTab === 'posts' 
                  ? 'border-foreground text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider hidden sm:inline">Posts</span>
            </button>
            <button 
              onClick={() => setActiveTab('reels')}
              className={`flex items-center gap-2 py-3 md:py-4 border-t-2 -mt-px transition-colors ${
                activeTab === 'reels' 
                  ? 'border-foreground text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider hidden sm:inline">Reels</span>
            </button>
            {isOwnProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 py-3 md:py-4 border-t-2 -mt-px transition-colors ${
                  activeTab === 'saved' 
                    ? 'border-foreground text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider hidden sm:inline">Saved</span>
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-0.5 md:gap-1 mt-1">
          {displayPosts.map((post) => (
            <motion.div
              key={post.id}
              className="aspect-square relative cursor-pointer group"
              whileHover={{ opacity: 0.9 }}
              onClick={() => handlePostClick(post)}
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
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-6 text-white">
                <span className="flex items-center gap-1 text-sm md:text-base">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1 text-sm md:text-base">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                  {post.comments_count}
                </span>
              </div>
              {post.is_reel && (
                <div className="absolute top-2 right-2">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {displayPosts.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              {activeTab === 'reels' ? (
                <Film className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">No {activeTab} yet</h3>
            <p className="text-muted-foreground text-sm">
              {isOwnProfile 
                ? `Start sharing ${activeTab === 'reels' ? 'videos' : 'photos'} to see them here.`
                : `${profile.username} hasn't shared any ${activeTab} yet.`
              }
            </p>
          </div>
        )}
      </main>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-card rounded-xl z-50 overflow-hidden flex flex-col md:flex-row"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Media */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[200px] md:min-h-0">
                {selectedPost.is_reel ? (
                  <video
                    src={selectedPost.media_url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedPost.media_url}
                    alt="Post"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Details */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col border-l border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
                  <Link to={`/profile/${selectedPost.profile.username}`} className="flex items-center gap-3">
                    <img
                      src={selectedPost.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                      alt={selectedPost.profile.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold text-sm">{selectedPost.profile.username}</span>
                    <BadgeCheck className="w-4 h-4 text-primary" />
                  </Link>
                  <button onClick={() => setSelectedPost(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption & Comments Preview */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                  {selectedPost.caption && (
                    <div className="flex gap-3 mb-4">
                      <img
                        src={selectedPost.profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={selectedPost.profile.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-sm mr-2">{selectedPost.profile.username}</span>
                        <span className="text-sm">{selectedPost.caption}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(selectedPost.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPost.comments_count > 0 && (
                    <button 
                      onClick={() => handleOpenComments(selectedPost.id)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      View all {selectedPost.comments_count} comments
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 md:p-4 border-t border-border">
                  <div className="flex items-center gap-4 mb-3">
                    <motion.button
                      onClick={() => handleLike(selectedPost)}
                      whileTap={{ scale: 0.8 }}
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors ${
                          selectedPost.is_liked ? 'text-primary fill-primary' : 'text-foreground hover:text-muted-foreground'
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      onClick={() => handleOpenComments(selectedPost.id)}
                      whileTap={{ scale: 0.8 }}
                    >
                      <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground" />
                    </motion.button>
                  </div>
                  <p className="font-semibold text-sm">{selectedPost.likes_count} likes</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
          }}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default Profile;