import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, User, BarChart3, Search, ChevronDown, BookOpen } from 'lucide-react';

interface FilterOptions {
  dateRange: string;
  tutor: string;
  subject: string;
  engagementMin: number;
  searchTerm: string;
}

interface SessionFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  tutors: Array<{ id: string; name: string }>;
  subjects: string[];
}

const SessionFilters: React.FC<SessionFiltersProps> = ({ onFiltersChange, tutors, subjects }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    tutor: 'all',
    subject: 'all',
    engagementMin: 0,
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Session Filters
        </h3>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-primary-500 hover:text-primary-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-primary-500/10"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-sm font-medium">{isExpanded ? 'Hide Filters' : 'Show Filters'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
          placeholder="Search sessions..."
        />
      </div>

      {/* Expandable Filters */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0, 
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 24 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date Range
            </label>
            <div className="relative">
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilters({ dateRange: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-dark-800 text-white">All Time</option>
                <option value="today" className="bg-dark-800 text-white">Today</option>
                <option value="week" className="bg-dark-800 text-white">This Week</option>
                <option value="month" className="bg-dark-800 text-white">This Month</option>
                <option value="quarter" className="bg-dark-800 text-white">This Quarter</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tutor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <User className="h-4 w-4 inline mr-2" />
              Tutor
            </label>
            <div className="relative">
              <select
                value={filters.tutor}
                onChange={(e) => updateFilters({ tutor: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-dark-800 text-white">All Tutors</option>
                {tutors.map(tutor => (
                  <option key={tutor.id} value={tutor.id} className="bg-dark-800 text-white">{tutor.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <BookOpen className="h-4 w-4 inline mr-2" />
              Subject
            </label>
            <div className="relative">
              <select
                value={filters.subject}
                onChange={(e) => updateFilters({ subject: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-dark-800 text-white">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-dark-800 text-white">{subject}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Engagement Score */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Min. Engagement
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.engagementMin}
                onChange={(e) => updateFilters({ engagementMin: Number(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #00D4FF 0%, #00D4FF ${filters.engagementMin}%, rgba(255,255,255,0.1) ${filters.engagementMin}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span className="text-primary-400 font-medium">{filters.engagementMin}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
          <motion.button
            onClick={() => {
              const resetFilters = {
                dateRange: 'all',
                tutor: 'all',
                subject: 'all',
                engagementMin: 0,
                searchTerm: ''
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
          >
            Clear All Filters
          </motion.button>
          
          <div className="text-sm text-gray-400">
            {Object.values(filters).filter(v => v !== 'all' && v !== 0 && v !== '').length} filters active
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionFilters;