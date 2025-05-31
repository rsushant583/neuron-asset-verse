
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Explorer', href: '/explorer' },
    { label: 'Market', href: '/market' },
    { label: 'Create', href: '/create' },
    { label: 'Tokenomics', href: '#tokenomics' },
    { label: 'Community', href: '/community' }
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out"
      });
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-morphism border-b border-cyber-blue/20' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple neural-glow" />
            <span className="text-xl font-bold text-white">MetaMind</span>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className="text-gray-300 hover:text-cyber-blue transition-colors duration-200 font-medium cursor-pointer"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex glass-morphism border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/20"
                  onClick={() => navigate('/dashboard')}
                >
                  <User className="mr-2" size={18} />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="glass-morphism border-red-500/50 text-red-400 hover:bg-red-500/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2" size={18} />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex glass-morphism border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/20"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white"
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
