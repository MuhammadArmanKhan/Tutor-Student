import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-white/10 mb-8">
      <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;