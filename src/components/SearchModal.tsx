import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Sparkles, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'subbhu_recent_searches';

const trendingTopics = [
  { id: 1, name: 'photography', icon: '📸' },
  { id: 2, name: 'travel', icon: '✈️' },
  { id: 3, name: 'fitness', icon: '💪' },
  { id: 4, name: 'food', icon: '🍕' },
  { id: 5, name: 'music', icon: '🎵' },
];

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const { searchQuery, setSearchQuery, results, isLoading } = useSearch();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save to recent searches when navigating to a profile
  const saveRecentSearch = useCallback((username: string) => {
    const updated = [username, ...recentSearches.filter(s => s !== username)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const removeRecentSearch = (username: string) => {
    const updated = recentSearches.filter(s => s !== username);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Search Container */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
          {/* Main Search Card */}
          <motion.div
            className="relative bg-card/95 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20 opacity-50 pointer-events-none" />

            {/* Search Input Area */}
            <div className="relative p-4 sm:p-6">
              <div className="flex items-center gap-4">
                {/* Animated Search Icon */}
                <motion.div
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    isFocused 
                      ? 'bg-gradient-to-br from-primary to-pink-500 shadow-lg shadow-primary/30' 
                      : 'bg-secondary/50'
                  }`}
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                >
                  {isLoading ? (
                    <Loader2 className={`w-5 h-5 ${isFocused ? 'text-white' : 'text-muted-foreground'}`} />
                  ) : (
                    <Search className={`w-5 h-5 ${isFocused ? 'text-white' : 'text-muted-foreground'}`} />
                  )}
                </motion.div>

                {/* Input Field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search amazing people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent text-xl sm:text-2xl font-medium text-foreground placeholder:text-muted-foreground/50 outline-none"
                    autoFocus
                  />
                  {/* Typing indicator line */}
                  <motion.div
                    className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isFocused ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Clear / Close Button */}
                <motion.button
                  onClick={searchQuery ? () => setSearchQuery('') : handleClose}
                  className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Keyboard hint */}
              <motion.div 
                className="hidden sm:flex items-center gap-2 mt-4 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <kbd className="px-2 py-1 bg-secondary rounded-md font-mono">esc</kbd>
                <span>to close</span>
              </motion.div>
            </div>

            {/* Results / Suggestions Area */}
            <div className="border-t border-border/30">
              <div className="max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Search Results */}
                  {searchQuery && results.length > 0 && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4"
                    >
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Results</span>
                      </div>
                      <div className="space-y-1">
                        {results.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={`/profile/${user.username}`}
                              onClick={() => {
                                saveRecentSearch(user.username);
                                handleClose();
                              }}
                              className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-all duration-200"
                            >
                              {/* Avatar with gradient ring */}
                              <div className="relative">
                                <motion.div 
                                  className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-75 blur-sm transition-opacity"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-secondary ring-2 ring-background">
                                  <img
                                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {/* Online indicator */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full ring-2 ring-card" />
                              </div>

                              {/* User Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                    {user.username}
                                  </p>
                                  <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                {user.full_name && (
                                  <p className="text-sm text-muted-foreground truncate">{user.full_name}</p>
                                )}
                              </div>

                              {/* Arrow */}
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                initial={{ x: -5 }}
                                whileHover={{ x: 0 }}
                              >
                                <ArrowRight className="w-5 h-5 text-primary" />
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Results */}
                  {searchQuery && results.length === 0 && !isLoading && (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-1">No one found</p>
                      <p className="text-sm text-muted-foreground">Try a different username</p>
                    </motion.div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-sm text-muted-foreground">Searching the universe...</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Empty State - Show Recent & Trending */}
                  {!searchQuery && !isLoading && (
                    <motion.div
                      key="suggestions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 space-y-6"
                    >
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3 px-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Recent</span>
                            </div>
                            <button
                              onClick={clearRecentSearches}
                              className="text-xs text-primary hover:underline"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                              <motion.div
                                key={search}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-full bg-secondary/70 flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <button
                                  onClick={() => handleQuickSearch(search)}
                                  className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors"
                                >
                                  {search}
                                </button>
                                <button
                                  onClick={() => removeRecentSearch(search)}
                                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-secondary rounded-full transition-all"
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Topics */}
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-muted-foreground">Trending</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trendingTopics.map((topic, index) => (
                            <motion.button
                              key={topic.id}
                              onClick={() => handleQuickSearch(topic.name)}
                              className="group flex items-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-pink-500/20 rounded-full transition-all duration-300"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="text-lg">{topic.icon}</span>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {topic.name}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Discover Prompt */}
                      <motion.div
                        className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-pink-500/10 to-purple-500/10 border border-primary/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span className="font-bold text-foreground">Discover People</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Find creators, friends, and interesting people to follow
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
