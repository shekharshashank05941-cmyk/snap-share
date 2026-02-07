import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { user } = useAuth();
  const { currentUserProfile } = useProfile();

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(user.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .limit(5);

      return profiles || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <aside className="hidden lg:block w-80 pl-8">
        <div className="sticky top-20">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">Sign in to see posts and connect with friends</p>
            <Link to="/auth" className="text-primary font-semibold hover:opacity-80">
              Log In
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-80 pl-8">
      <div className="sticky top-20">
        {/* Current User */}
        <Link to={`/profile/${currentUserProfile?.username}`} className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <img
              src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
              alt={currentUserProfile?.username}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">{currentUserProfile?.username}</h3>
            <p className="text-sm text-muted-foreground">{currentUserProfile?.full_name || 'Your Name'}</p>
          </div>
        </Link>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">
                Suggested for you
              </span>
              <button className="text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors">
                See All
              </button>
            </div>

            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3"
                >
                  <Link to={`/profile/${suggestion.username}`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img
                        src={suggestion.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                        alt={suggestion.username}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${suggestion.username}`}>
                      <h4 className="text-sm font-semibold text-foreground truncate hover:underline">
                        {suggestion.username}
                      </h4>
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      Suggested for you
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

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
          <p>© 2024 SubbhuBhai Verse</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
