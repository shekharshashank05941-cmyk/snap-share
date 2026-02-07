import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create or update profile when user signs in with Google
      if (session?.user && _event === 'SIGNED_IN') {
        const { user } = session;
        const metadata = user.user_metadata;
        
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();

            if (!existingProfile) {
              const username = metadata.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
              await supabase.from('profiles').insert({
                id: user.id,
                username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                full_name: metadata.full_name || metadata.name || '',
                avatar_url: metadata.avatar_url || metadata.picture || '',
              });
            }
          } catch (err) {
            console.error('Profile creation error:', err);
          }
        }, 0);
      }
    });

    // Check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Session retrieval error:', error);
          // Clear corrupted session
          supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Session check failed:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
