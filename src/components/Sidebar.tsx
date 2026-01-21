import { motion } from 'framer-motion';
import { currentUser, suggestions } from '@/data/mockData';

const Sidebar = () => {
  return (
    <aside className="hidden lg:block w-80 pl-8">
      <div className="sticky top-20">
        {/* Current User */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-14 h-14 rounded-full overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">{currentUser.username}</h3>
            <p className="text-sm text-muted-foreground">{currentUser.name}</p>
          </div>
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Switch
          </button>
        </div>

        {/* Suggestions Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-muted-foreground">
            Suggested for you
          </span>
          <button className="text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors">
            See All
          </button>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <img
                  src={suggestion.avatar}
                  alt={suggestion.username}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {suggestion.username}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {suggestion.subtitle}
                </p>
              </div>
              <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                Follow
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-muted-foreground/60 space-y-4">
          <div className="flex flex-wrap gap-x-1">
            <a href="#" className="hover:underline">About</a> ·
            <a href="#" className="hover:underline">Help</a> ·
            <a href="#" className="hover:underline">Press</a> ·
            <a href="#" className="hover:underline">API</a> ·
            <a href="#" className="hover:underline">Jobs</a> ·
            <a href="#" className="hover:underline">Privacy</a> ·
            <a href="#" className="hover:underline">Terms</a>
          </div>
          <p>© 2024 PICGRAM</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
