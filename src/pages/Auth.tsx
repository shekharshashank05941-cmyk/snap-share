import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft, User, Shield, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'signup-verify' | 'otp-request' | 'otp-verify';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      // Send OTP to email for verification
      const { error } = await signInWithOtp(email);
      if (error) throw error;
      toast.success('Verification code sent to your email!');
      setMode('signup-verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);

    try {
      // Verify OTP first
      const { error: verifyError } = await verifyOtp(email, otpCode);
      if (verifyError) throw verifyError;

      // Then create the account with password
      const { error: signupError } = await signUp(email, password, username, fullName);
      if (signupError) throw signupError;

      toast.success('Account verified and created! Welcome to Picgram!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
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

  const resetState = () => {
    setOtpCode('');
    setPassword('');
  };

  const goToLogin = () => {
    resetState();
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Picgram
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === 'otp-request' && 'Enter your email to receive a verification code'}
            {mode === 'otp-verify' && 'Enter the code sent to your email'}
            {mode === 'signup-verify' && 'Verify your email to complete signup'}
            {mode === 'login' && 'Sign in to see photos and videos from your friends.'}
            {mode === 'signup' && 'Sign up to see photos and videos from your friends.'}
          </p>
        </div>

        {/* Signup Verification */}
        {mode === 'signup-verify' && (
          <motion.div 
            className="bg-card border border-border rounded-xl p-6 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setMode('signup')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-semibold text-lg mb-1">Verify Your Email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to<br />
                <span className="font-semibold text-foreground">{email}</span>
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
              onClick={handleVerifyAndSignup}
              className="w-full instagram-gradient text-white font-semibold"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? 'Verifying...' : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Create Account
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleSignupStep1}
                className="text-primary font-semibold hover:opacity-80"
                disabled={loading}
              >
                Resend
              </button>
            </p>
          </motion.div>
        )}

        {/* OTP Verify Form (for login) */}
        {mode === 'otp-verify' && (
          <motion.div 
            className="bg-card border border-border rounded-xl p-6 space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setMode('otp-request')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-semibold text-lg mb-1">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">
                Enter the code sent to<br />
                <span className="font-semibold text-foreground">{email}</span>
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
          </motion.div>
        )}

        {/* OTP Request Form */}
        {mode === 'otp-request' && (
          <motion.div 
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Passwordless Login</h2>
                <p className="text-sm text-muted-foreground">
                  We'll send a secure code to your email
                </p>
              </div>
              
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary h-12"
              />
              
              <Button
                type="submit"
                className="w-full instagram-gradient text-white font-semibold h-12"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Password Login Form */}
        {mode === 'login' && (
          <motion.div 
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary h-12"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary h-12"
              />
              <Button
                type="submit"
                className="w-full instagram-gradient text-white font-semibold h-12"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setMode('otp-request')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Login with Email Code
            </Button>
          </motion.div>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <motion.div 
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Sign up to see photos and videos from friends.
              </p>
            </div>

            <form onSubmit={handleSignupStep1} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  className="bg-secondary h-12 pl-10"
                />
              </div>
              <Input
                type="text"
                placeholder="Full Name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-secondary h-12"
              />
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary h-12 pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary h-12 pl-10"
                />
              </div>
              
              <p className="text-xs text-muted-foreground text-center px-4">
                By signing up, you'll receive a verification code to confirm your email.
              </p>
              
              <Button
                type="submit"
                className="w-full instagram-gradient text-white font-semibold h-12"
                disabled={loading}
              >
                {loading ? 'Sending code...' : 'Continue with Email Verification'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Toggle between login/signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="bg-card border border-border rounded-xl p-4 mt-4 text-center">
            <span className="text-muted-foreground text-sm">
              {mode === 'login' ? "Don't have an account? " : 'Have an account? '}
            </span>
            <button
              onClick={() => {
                resetState();
                setMode(mode === 'login' ? 'signup' : 'login');
              }}
              className="text-primary font-semibold hover:opacity-80"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        )}

        {/* Back to login */}
        {mode === 'otp-request' && (
          <div className="bg-card border border-border rounded-xl p-4 mt-4 text-center">
            <button
              onClick={goToLogin}
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