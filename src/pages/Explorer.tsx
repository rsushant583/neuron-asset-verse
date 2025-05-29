
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import NFTGrid from '@/components/explorer/NFTGrid';
import FilterSidebar from '@/components/explorer/FilterSidebar';
import SearchBar from '@/components/explorer/SearchBar';
import FeaturedNFTs from '@/components/explorer/FeaturedNFTs';
import Footer from '@/components/Footer';
import MobileNFTCard from '@/components/mobile/MobileNFTCard';
import NFTModal from '@/components/explorer/NFTModal';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Explorer = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    topic: 'all',
    sortBy: 'popularity',
    priceRange: [0, 1000]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock NFT data for mobile
  const mockNFTs = [
    {
      id: 1,
      title: "Advanced Meditation Techniques for Busy Professionals",
      creator: "Sarah Wilson",
      preview: "Discover powerful 5-minute meditation practices...",
      price: 25,
      remixes: 432,
      rating: 4.6,
      views: 1250,
      image: "/placeholder.svg",
      tags: ["Health", "Mindfulness"],
      format: "Audio Course"
    },
    {
      id: 2,
      title: "NFT Art Creation with AI Tools",
      creator: "Marcus Rodriguez",
      preview: "Learn to create stunning NFT artwork...",
      price: 78,
      remixes: 289,
      rating: 4.8,
      views: 987,
      image: "/placeholder.svg",
      tags: ["AI", "Art"],
      format: "Video Tutorial"
    },
    {
      id: 3,
      title: "The Psychology of Persuasive Writing",
      creator: "Dr. Emma Chen",
      preview: "Master psychological principles...",
      price: 56,
      remixes: 567,
      rating: 4.9,
      views: 1876,
      image: "/placeholder.svg",
      tags: ["Writing", "Psychology"],
      format: "eBook"
    }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black pb-24">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Explore</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyber-blue/50">
                    <Filter size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-black/95 border-l border-white/10">
                  <FilterSidebar 
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
            
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </div>

        {/* Mobile NFT Grid */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockNFTs.map((nft) => (
              <MobileNFTCard
                key={nft.id}
                nft={nft}
                onSelect={setSelectedNFT}
              />
            ))}
          </div>
        </div>

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <NFTModal 
            nft={selectedNFT} 
            onClose={() => setSelectedNFT(null)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black">
      <Navigation />
      
      <main className="pt-20">
        {/* Desktop Hero Section */}
        <motion.section
          className="py-16 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                Knowledge NFT Explorer
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover, explore, and remix AI-generated knowledge products from creators worldwide
            </p>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </motion.section>

        {/* Featured NFTs */}
        <FeaturedNFTs />

        {/* Main Explorer Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Filter Sidebar */}
              <div className="w-80 flex-shrink-0">
                <FilterSidebar 
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                />
              </div>

              {/* NFT Grid */}
              <div className="flex-1">
                <NFTGrid 
                  filters={selectedFilters}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Explorer;
