import { useState } from 'react';
import { Home, Search, PlusSquare, Heart, MessageCircle, Compass, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import CreatePostModal from './CreatePostModal';
import SearchModal from './SearchModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, signOut } = useAuth();
  const { currentUserProfile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Picgram
            </motion.h1>
          </Link>

          {/* Search Bar - Desktop (clickable to open modal) */}
          <div 
            className="hidden md:flex items-center bg-secondary rounded-lg px-4 py-2 w-64 cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => setShowSearch(true)}
          >
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Search</span>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-5">
            <Link to="/">
              <NavIcon icon={<Home className="w-6 h-6" />} active />
            </Link>
            <NavIcon 
              icon={<Search className="w-6 h-6" />} 
              className="md:hidden"
              onClick={() => setShowSearch(true)}
            />
            <Link to="/explore">
              <NavIcon icon={<Compass className="w-6 h-6" />} className="hidden sm:flex" />
            </Link>
            <NavIcon icon={<MessageCircle className="w-6 h-6" />} />
            {user && (
              <NavIcon 
                icon={<PlusSquare className="w-6 h-6" />} 
                onClick={() => setShowCreatePost(true)}
              />
            )}
            <NavIcon icon={<Heart className="w-6 h-6" />} />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <img
                      src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${currentUserProfile?.username}`}>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <motion.button
                  className="text-sm font-semibold text-primary hover:opacity-80"
                  whileHover={{ scale: 1.05 }}
                >
                  Log In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

interface NavIconProps {
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

const NavIcon = ({ icon, active, className, onClick }: NavIconProps) => (
  <motion.button
    className={`relative p-1 hover:opacity-70 transition-opacity ${active ? 'text-foreground' : 'text-muted-foreground'} ${className}`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
  >
    {icon}
  </motion.button>
);

export default Navbar;
