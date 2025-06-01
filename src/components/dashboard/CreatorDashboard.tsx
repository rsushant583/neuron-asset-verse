
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserAIProducts } from '@/hooks/useAIProducts';
import { useUserPurchases } from '@/hooks/usePurchases';
import { useUserMintRequests } from '@/hooks/useNFTMinting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, Zap, TrendingUp, Plus, BookOpen } from 'lucide-react';
import CreatorWizard from '../CreatorWizard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CreatorDashboard = () => {
  const { data: products, isLoading: productsLoading, error: productsError } = useUserAIProducts();
  const { data: purchases, isLoading: purchasesLoading } = useUserPurchases();
  const { data: mintRequests, isLoading: mintsLoading } = useUserMintRequests();
  const [showWizard, setShowWizard] = useState(false);

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalRevenue = purchases?.reduce((sum, purchase) => sum + purchase.price, 0) || 0;
  const totalSales = purchases?.length || 0;
  const pendingMints = mintRequests?.filter(req => req.status === 'pending').length || 0;

  // Chart data for earnings (last 6 months)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: [0, 250, 180, 320, 450, 280],
        borderColor: '#4B8BBE',
        backgroundColor: 'rgba(75, 139, 190, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
          font: { size: 16 },
        },
      },
      title: {
        display: true,
        text: 'Earnings Over Time',
        color: '#ffffff',
        font: { size: 20 },
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { size: 16 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#ffffff', font: { size: 16 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        beginAtZero: true,
        max: 500,
      },
    },
  };

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

  if (showWizard) {
    return (
      <CreatorWizard 
        onComplete={(productData) => {
          console.log('Product created:', productData);
          setShowWizard(false);
          // Refresh data
          window.location.reload();
        }}
        onClose={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-white text-hero mb-4">Welcome to Your Creator Dashboard</h1>
        <p className="text-gray-400 text-body mb-6">
          Share your wisdom and life experiences with the world. Turn your knowledge into digital products that inspire others.
        </p>
        
        <Button
          onClick={() => setShowWizard(true)}
          className="btn-primary text-xl px-8 py-4 bg-gradient-to-r from-cyber-blue to-cyber-purple"
          aria-label="Start creating a new product"
        >
          <Plus size={24} className="mr-2" />
          Create Your First Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-body font-medium text-gray-400 flex items-center">
                <Package className="mr-2" size={20} />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-hero font-bold text-white high-contrast-text">{totalProducts}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-body font-medium text-gray-400 flex items-center">
                <DollarSign className="mr-2" size={20} />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-hero font-bold text-white high-contrast-text">₹{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-body font-medium text-gray-400 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-hero font-bold text-white high-contrast-text">{totalSales}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
            <CardHeader className="pb-3">
              <CardTitle className="text-body font-medium text-gray-400 flex items-center">
                <Zap className="mr-2" size={20} />
                Pending Mints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-hero font-bold text-white high-contrast-text">{pendingMints}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
          <CardHeader>
            <CardTitle className="text-white text-heading">Earnings Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-morphism border-cyber-blue/20 high-contrast-bg">
          <CardHeader>
            <CardTitle className="text-white text-heading">Your Products</CardTitle>
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
                      {product.preview_image ? (
                        <img
                          src={product.preview_image}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 flex items-center justify-center">
                          <BookOpen size={24} className="text-cyber-blue" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-medium text-body">{product.title}</h3>
                        <p className="text-gray-400 text-body">₹{product.price}</p>
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
                <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-heading font-medium text-white">No products yet</h3>
                <p className="mt-2 text-gray-400 text-body mb-4">Share your life experiences and wisdom with the world</p>
                <Button
                  onClick={() => setShowWizard(true)}
                  className="btn-primary"
                  aria-label="Create your first product"
                >
                  <Plus size={20} className="mr-2" />
                  Create Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreatorDashboard;
