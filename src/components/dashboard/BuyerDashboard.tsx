
import React from 'react';
import { motion } from 'framer-motion';
import { useUserPurchases } from '@/hooks/usePurchases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, DollarSign, Download, History } from 'lucide-react';

const BuyerDashboard = () => {
  const { data: purchases, isLoading, error } = useUserPurchases();

  // Calculate stats
  const totalPurchases = purchases?.length || 0;
  const totalSpent = purchases?.reduce((sum, purchase) => sum + purchase.price, 0) || 0;
  const recentPurchases = purchases?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load purchase data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-cyber-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <ShoppingBag className="mr-2" size={16} />
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPurchases}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-cyber-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <DollarSign className="mr-2" size={16} />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morphism border-cyber-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Download className="mr-2" size={16} />
                Available Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPurchases}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Purchases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-morphism border-cyber-blue/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <History className="mr-2" size={20} />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPurchases.length > 0 ? (
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-cyber-blue/10"
                  >
                    <div className="flex items-center space-x-4">
                      {purchase.ai_products?.preview_image && (
                        <img
                          src={purchase.ai_products.preview_image}
                          alt={purchase.ai_products.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-white font-medium">{purchase.ai_products?.title}</h3>
                        <p className="text-gray-400 text-sm">
                          by {purchase.ai_products?.users?.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${purchase.price}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-white">No purchases yet</h3>
                <p className="mt-2 text-gray-400">Explore the marketplace to find AI products</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BuyerDashboard;
