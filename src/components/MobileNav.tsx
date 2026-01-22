import { useState } from 'react';
import { Home, Search, PlusSquare, Heart, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around h-14">
          <Link to="/">
            <MobileNavIcon icon={<Home className="w-6 h-6" />} active />
          </Link>
          <MobileNavIcon 
            icon={<Search className="w-6 h-6" />} 
            onClick={() => setShowSearch(true)}
          />
          <Link to="/explore">
            <MobileNavIcon icon={<Compass className="w-6 h-6" />} />
          </Link>
          {user && (
            <MobileNavIcon 
              icon={<PlusSquare className="w-6 h-6" />} 
              onClick={() => setShowCreatePost(true)}
            />
          )}
          <Link to="/reels">
            <MobileNavIcon icon={<Heart className="w-6 h-6" />} />
          </Link>
          <Link to={user ? `/profile/${currentUserProfile?.username}` : '/auth'}>
            <motion.button
              className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-transparent"
              whileTap={{ scale: 0.9 }}
            >
              <img
                src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.button>
          </Link>
        </div>
      </nav>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

interface MobileNavIconProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const MobileNavIcon = ({ icon, active, onClick }: MobileNavIconProps) => (
  <motion.button
    className={`p-2 ${active ? 'text-foreground' : 'text-muted-foreground'}`}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
  >
    {icon}
  </motion.button>
);

export default MobileNav;
