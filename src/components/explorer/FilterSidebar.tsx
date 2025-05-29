
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterSidebarProps {
  selectedFilters: {
    topic: string;
    sortBy: string;
    priceRange: number[];
  };
  setSelectedFilters: (filters: any) => void;
}

const FilterSidebar = ({ selectedFilters, setSelectedFilters }: FilterSidebarProps) => {
  const topics = [
    { id: 'all', label: 'All Topics', count: 1247 },
    { id: 'ai', label: 'AI & Technology', count: 324 },
    { id: 'productivity', label: 'Productivity', count: 189 },
    { id: 'finance', label: 'Finance & Crypto', count: 156 },
    { id: 'relationships', label: 'Relationships', count: 143 },
    { id: 'health', label: 'Health & Wellness', count: 129 },
    { id: 'creative', label: 'Creative Writing', count: 98 },
    { id: 'business', label: 'Business Strategy', count: 87 },
    { id: 'education', label: 'Education', count: 76 },
    { id: 'lifestyle', label: 'Lifestyle', count: 45 }
  ];

  const sortOptions = [
    { id: 'popularity', label: 'Most Popular' },
    { id: 'newest', label: 'Newest First' },
    { id: 'remixes', label: 'Most Remixed' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' }
  ];

  const updateFilter = (key: string, value: any) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      className="glass-morphism rounded-2xl p-6 border border-cyber-blue/20 sticky top-24"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-white mb-6">Filters</h3>

      {/* Topics */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">Topics</h4>
        <div className="space-y-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => updateFilter('topic', topic.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                selectedFilters.topic === topic.id
                  ? 'bg-cyber-blue/20 border border-cyber-blue/50'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="text-sm text-white">{topic.label}</span>
              <Badge variant="secondary" className="text-xs">
                {topic.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">Sort By</h4>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateFilter('sortBy', option.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                selectedFilters.sortBy === option.id
                  ? 'bg-cyber-purple/20 border border-cyber-purple/50'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="text-sm text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">Price Range</h4>
        <div className="px-2">
          <Slider
            value={selectedFilters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value)}
            max={1000}
            min={0}
            step={10}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>${selectedFilters.priceRange[0]}</span>
            <span>${selectedFilters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => setSelectedFilters({ topic: 'all', sortBy: 'popularity', priceRange: [0, 1000] })}
        className="w-full border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/20"
      >
        Clear All Filters
      </Button>
    </motion.div>
  );
};

export default FilterSidebar;
