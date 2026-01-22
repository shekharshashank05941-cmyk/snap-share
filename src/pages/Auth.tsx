import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'otp-request' | 'otp-verify';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      } else if (mode === 'signup') {
        if (!username.trim()) {
          toast.error('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username, fullName);
        if (error) throw error;
        toast.success('Account created! You can now sign in.');
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);

    try {
      const { error } = await signInWithOtp(email);
      if (error) throw error;
      toast.success('Verification code sent to your email!');
      setMode('otp-verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);

    try {
      const { error } = await verifyOtp(email, otpCode);
      if (error) throw error;
      toast.success('Verified! Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setMode('login');
    setOtpCode('');
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
            {mode === 'otp-request' && 'Enter your email to receive a verification code'}
            {mode === 'otp-verify' && 'Enter the code sent to your email'}
            {mode === 'login' && 'Sign in to see photos and videos from your friends.'}
            {mode === 'signup' && 'Sign up to see photos and videos from your friends.'}
          </p>
        </div>

        {/* OTP Verify Form */}
        {mode === 'otp-verify' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <button
              onClick={() => setMode('otp-request')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                We sent a code to <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              className="w-full instagram-gradient text-white font-semibold"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleRequestOtp}
                className="text-primary font-semibold hover:opacity-80"
                disabled={loading}
              >
                Resend
              </button>
            </p>
          </div>
        )}

        {/* OTP Request Form */}
        {mode === 'otp-request' && (
          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-center mb-4">
                <Lock className="w-12 h-12 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Secure login with email verification
                </p>
              </div>
              
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary"
              />
              
              <Button
                type="submit"
                className="w-full instagram-gradient text-white font-semibold"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          </div>
        )}

        {/* Password Login/Signup Form */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {mode === 'signup' && (
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
                {loading ? 'Loading...' : mode === 'login' ? 'Log In' : 'Sign Up'}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode('otp-request')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Login with Email OTP
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Toggle between modes */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="bg-card border border-border rounded-lg p-4 mt-4 text-center">
            <span className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Have an account? '}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary font-semibold hover:opacity-80"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        )}

        {/* Back to login from OTP */}
        {mode === 'otp-request' && (
          <div className="bg-card border border-border rounded-lg p-4 mt-4 text-center">
            <button
              onClick={resetToLogin}
              className="text-primary font-semibold hover:opacity-80"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
