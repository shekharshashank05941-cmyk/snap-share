import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around h-14">
        <MobileNavIcon icon={<Home className="w-6 h-6" />} active />
        <MobileNavIcon icon={<Search className="w-6 h-6" />} />
        <MobileNavIcon icon={<PlusSquare className="w-6 h-6" />} />
        <MobileNavIcon icon={<Heart className="w-6 h-6" />} />
        <motion.button
          className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-transparent"
          whileTap={{ scale: 0.9 }}
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </motion.button>
      </div>
    </nav>
  );
};

interface MobileNavIconProps {
  icon: React.ReactNode;
  active?: boolean;
}

const MobileNavIcon = ({ icon, active }: MobileNavIconProps) => (
  <motion.button
    className={`p-2 ${active ? 'text-foreground' : 'text-muted-foreground'}`}
    whileTap={{ scale: 0.9 }}
  >
    {icon}
  </motion.button>
);

export default MobileNav;
