import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Github, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn, signInWithGoogle, signInWithGithub, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const getErrorMessage = (error: any) => {
    if (!error) return 'An unexpected error occurred';
    
    const message = error.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (message.includes('User not found')) {
      return 'No account found with this email address. Please sign up first.';
    }
    
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (message.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        if (!username.trim()) {
          toast({
            title: "Validation Error",
            description: "Username is required for sign up",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        result = await signUp(email, password, username);
      }

      if (result.error) {
        const errorMessage = getErrorMessage(result.error);
        toast({
          title: isLogin ? "Sign In Failed" : "Sign Up Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        // If it's an invalid credentials error during login, suggest signing up
        if (isLogin && result.error.message?.includes('Invalid login credentials')) {
          setTimeout(() => {
            toast({
              title: "New to MetaMind?",
              description: "If you don't have an account yet, try signing up instead.",
              variant: "default"
            });
          }, 2000);
        }
      } else {
        if (!isLogin) {
          toast({
            title: "Account Created Successfully",
            description: "Please check your email to confirm your account before signing in."
          });
          // Switch to login mode after successful signup
          setIsLogin(true);
          setPassword('');
        } else {
          toast({
            title: "Welcome Back",
            description: "You have been signed in successfully."
          });
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const result = provider === 'google' 
        ? await signInWithGoogle() 
        : await signInWithGithub();
        
      if (result.error) {
        toast({
          title: "Social Login Failed",
          description: getErrorMessage(result.error),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-morphism border-cyber-blue/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {isLogin ? 'Welcome Back' : 'Join MetaMind'}
            </CardTitle>
            {isLogin && (
              <p className="text-sm text-gray-400 mt-2">
                Sign in to your account to continue
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-cyber-blue/20 text-white"
                    required
                  />
                </div>
              )}
              
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-cyber-blue/20 text-white"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-cyber-blue/20 text-white"
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs text-gray-400 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-cyber-blue/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleSocialLogin('google')}
                variant="outline"
                className="w-full border-cyber-blue/20 text-white hover:bg-cyber-blue/20"
              >
                <Mail className="mr-2" size={18} />
                Continue with Google
              </Button>
              
              <Button
                onClick={() => handleSocialLogin('github')}
                variant="outline"
                className="w-full border-cyber-blue/20 text-white hover:bg-cyber-blue/20"
              >
                <Github className="mr-2" size={18} />
                Continue with GitHub
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword('');
                  setUsername('');
                }}
                className="text-cyber-blue hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  <AlertCircle className="inline w-3 h-3 mr-1" />
                  Make sure you've confirmed your email address
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;