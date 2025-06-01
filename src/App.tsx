
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardCreator from "./pages/DashboardCreator";
import DashboardBuyer from "./pages/DashboardBuyer";
import Explorer from "./pages/Explorer";
import Market from "./pages/Market";
import Create from "./pages/Create";
import Community from "./pages/Community";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import MobileNavigation from "./components/mobile/MobileNavigation";
import PWAInstallPrompt from "./components/mobile/PWAInstallPrompt";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  useRealtimeSubscription();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/creator" element={
          <ProtectedRoute>
            <DashboardCreator />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/buyer" element={
          <ProtectedRoute>
            <DashboardBuyer />
          </ProtectedRoute>
        } />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/market" element={<Market />} />
        <Route path="/create" element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        } />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {isMobile && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
