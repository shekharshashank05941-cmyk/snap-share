import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      } else {
        if (!username.trim()) {
          toast.error('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username, fullName);
        if (error) throw error;
        toast.success('Account created! You can now sign in.');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Picgram
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'Sign in to see photos and videos from your friends.' : 'Sign up to see photos and videos from your friends.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-secondary"
                />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-secondary"
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary"
            />
            <Button
              type="submit"
              className="w-full instagram-gradient text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </div>

        {/* Toggle */}
        <div className="bg-card border border-border rounded-lg p-4 mt-4 text-center">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Have an account? '}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:opacity-80"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
