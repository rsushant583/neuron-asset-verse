
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import NFTGrid from '@/components/explorer/NFTGrid';
import FilterSidebar from '@/components/explorer/FilterSidebar';
import SearchBar from '@/components/explorer/SearchBar';
import FeaturedNFTs from '@/components/explorer/FeaturedNFTs';
import Footer from '@/components/Footer';

const Explorer = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    topic: 'all',
    sortBy: 'popularity',
    priceRange: [0, 1000]
  });
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
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
