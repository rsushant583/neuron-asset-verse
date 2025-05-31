
import React from 'react';
import { motion } from 'framer-motion';
import { useUserAIProducts } from '@/hooks/useAIProducts';
import { usePurchases } from '@/hooks/usePurchases';
import { useUserMintRequests } from '@/hooks/useNFTMinting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, DollarSign, Zap, TrendingUp } from 'lucide-react';

const CreatorDashboard = () => {
  const { data: products, isLoading: productsLoading, error: productsError } = useUserAIProducts();
  const { data: purchases, isLoading: purchasesLoading } = usePurchases();
  const { data: mintRequests, isLoading: mintsLoading } = useUserMintRequests();

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalRevenue = purchases?.reduce((sum, purchase) => sum + purchase.price, 0) || 0;
  const totalSales = purchases?.length || 0;
  const pendingMints = mintRequests?.filter(req => req.status === 'pending').length || 0;

  if (productsLoading || purchasesLoading || mintsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-cyber-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Package className="mr-2" size={16} />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalProducts}</div>
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
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
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
                <TrendingUp className="mr-2" size={16} />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalSales}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-morphism border-cyber-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Zap className="mr-2" size={16} />
                Pending Mints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingMints}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Products List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-morphism border-cyber-blue/20">
          <CardHeader>
            <CardTitle className="text-white">Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-cyber-blue/10"
                  >
                    <div className="flex items-center space-x-4">
                      {product.preview_image && (
                        <img
                          src={product.preview_image}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-white font-medium">{product.title}</h3>
                        <p className="text-gray-400 text-sm">${product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-white">No products yet</h3>
                <p className="mt-2 text-gray-400">Create your first AI product to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatorDashboard;
