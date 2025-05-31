
import React, { useState } from 'react';
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';
import BuyerLayout from '@/components/layouts/BuyerLayout';
import BuyerDashboard from '@/components/dashboard/BuyerDashboard';
import { motion } from 'framer-motion';
import { useAIProducts } from '@/hooks/useAIProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, User } from 'lucide-react';

const DashboardBuyer = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  useRoleBasedRedirect();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BuyerDashboard />;
      case 'purchases':
        return <BuyerDashboard />; // Will show purchase history
      case 'recommended':
        return <RecommendedProducts />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <BuyerLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </BuyerLayout>
  );
};

// Quick recommended products component
const RecommendedProducts = () => {
  const { data: products, isLoading } = useAIProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  const recommendedProducts = products?.slice(0, 6) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-morphism border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Star className="mr-2" size={20} />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-white/5 rounded-lg border border-cyber-blue/10 hover:border-cyber-blue/30 transition-colors"
              >
                {product.preview_image && (
                  <img
                    src={product.preview_image}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="text-white font-medium mb-2">{product.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue font-semibold">${product.price}</span>
                  <span className="text-gray-400 text-xs">
                    by {product.users?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Quick profile settings component
const ProfileSettings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-morphism border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="mr-2" size={20} />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-cyber-blue mb-2">Account Information</h3>
              <p className="text-gray-400">Update your personal information and preferences</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-cyber-blue mb-2">Purchase History</h3>
              <p className="text-gray-400">View and manage your purchase history</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-cyber-blue mb-2">Notifications</h3>
              <p className="text-gray-400">Configure your notification preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardBuyer;
