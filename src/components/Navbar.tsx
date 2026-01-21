import { Home, Search, PlusSquare, Heart, MessageCircle, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Picgram
        </motion.h1>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center bg-secondary rounded-lg px-4 py-2 w-64">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-5">
          <NavIcon icon={<Home className="w-6 h-6" />} active />
          <NavIcon icon={<Compass className="w-6 h-6" />} className="hidden sm:flex" />
          <NavIcon icon={<MessageCircle className="w-6 h-6" />} />
          <NavIcon icon={<PlusSquare className="w-6 h-6" />} />
          <NavIcon icon={<Heart className="w-6 h-6" />} />
          <motion.div
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

interface NavIconProps {
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
}

const NavIcon = ({ icon, active, className }: NavIconProps) => (
  <motion.button
    className={`relative p-1 hover:opacity-70 transition-opacity ${active ? 'text-foreground' : 'text-muted-foreground'} ${className}`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.button>
);

export default Navbar;
