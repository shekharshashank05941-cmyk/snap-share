import { useState } from 'react';
import { Home, Search, PlusSquare, Heart, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import CreatePostModal from './CreatePostModal';
import SearchModal from './SearchModal';

const MobileNav = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuth();
  const { currentUserProfile } = useProfile();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          <Link to="/">
            <button className="p-2 text-foreground active:scale-90 transition-transform">
              <Home className="w-6 h-6" />
            </button>
          </Link>
          <button 
            className="p-2 text-muted-foreground active:scale-90 transition-transform"
            onClick={() => setShowSearch(true)}
          >
            <Search className="w-6 h-6" />
          </button>
          <Link to="/explore">
            <button className="p-2 text-muted-foreground active:scale-90 transition-transform">
              <Compass className="w-6 h-6" />
            </button>
          </Link>
          {user && (
            <button 
              className="p-2 text-muted-foreground active:scale-90 transition-transform"
              onClick={() => setShowCreatePost(true)}
            >
              <PlusSquare className="w-6 h-6" />
            </button>
          )}
          <Link to="/reels">
            <button className="p-2 text-muted-foreground active:scale-90 transition-transform">
              <Heart className="w-6 h-6" />
            </button>
          </Link>
          <Link to={user ? `/profile/${currentUserProfile?.username}` : '/auth'}>
            <button className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-transparent active:scale-90 transition-transform">
              <img
                src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                alt="Profile"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </Link>
        </div>
      </nav>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default MobileNav;
