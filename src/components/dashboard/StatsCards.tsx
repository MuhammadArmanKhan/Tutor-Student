import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Clock, Star, Video } from 'lucide-react';

interface StatsCardsProps {
  role?: 'student' | 'tutor';
}

const StatsCards: React.FC<StatsCardsProps> = ({ role = 'student' }) => {
  const studentStats = [
    {
      title: 'Engagement Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      title: 'Sessions This Month',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: Video,
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10',
    },
    {
      title: 'Study Hours',
      value: '24.5h',
      change: '+2.5h',
      trend: 'up',
      icon: Clock,
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber/10',
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  const tutorStats = [
    {
      title: 'Active Students',
      value: '28',
      change: '+4',
      trend: 'up',
      icon: Users,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      title: 'Sessions This Week',
      value: '18',
      change: '+2',
      trend: 'up',
      icon: Video,
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10',
    },
    {
      title: 'Teaching Hours',
      value: '36h',
      change: '+4h',
      trend: 'up',
      icon: Clock,
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber/10',
    },
    {
      title: 'Student Rating',
      value: '4.9',
      change: '+0.1',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  const stats = role === 'tutor' ? tutorStats : studentStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              stat.trend === 'up' ? 'text-accent-emerald' : 'text-red-400'
            }`}>
              {stat.trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{stat.change}</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm font-medium">{stat.title}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;