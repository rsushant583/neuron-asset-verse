
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <motion.div
      className="max-w-2xl mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search knowledge NFTs, creators, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-16 py-4 bg-white/5 border border-cyber-blue/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyber-blue/60 focus:bg-white/10 transition-all duration-300"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 rounded-xl transition-colors">
          <Filter size={16} className="text-cyber-blue" />
        </button>
      </div>
    </motion.div>
  );
};

export default SearchBar;
