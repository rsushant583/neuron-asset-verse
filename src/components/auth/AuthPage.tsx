
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Github, Mail } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, username);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        if (!isLogin) {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-cyber-blue/20 text-white"
                  required
                />
              )}
              
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-cyber-blue/20 text-white"
                required
              />
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-cyber-blue/20 text-white"
                required
              />
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

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
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyber-blue hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
