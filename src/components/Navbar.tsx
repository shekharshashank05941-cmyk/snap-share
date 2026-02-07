import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight cursor-pointer whitespace-nowrap">
            <span className="bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Subbhu Bhai
            </span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground ml-1.5 tracking-wider uppercase">
              verse
            </span>
          </h1>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
