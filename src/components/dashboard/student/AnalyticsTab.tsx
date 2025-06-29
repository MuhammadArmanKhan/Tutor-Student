import React from 'react';
import { motion } from 'framer-motion';
import EngagementChart from '../EngagementChart';
import ProgressTracker from '../../progress/ProgressTracker';
import { TrendingUp, Target, Clock, Award, BarChart3, Calendar } from 'lucide-react';

const AnalyticsTab: React.FC = () => {
  const performanceMetrics = [
    {
      title: 'Learning Velocity',
      value: '85%',
      change: '+12%',
      trend: 'up',
      description: 'Rate of concept mastery',
      icon: TrendingUp,
      color: 'text-accent-emerald'
    },
    {
      title: 'Goal Completion',
      value: '7/10',
      change: '+2',
      trend: 'up',
      description: 'Monthly learning goals',
      icon: Target,
      color: 'text-primary-500'
    },
    {
      title: 'Study Consistency',
      value: '92%',
      change: '+5%',
      trend: 'up',
      description: 'Regular session attendance',
      icon: Calendar,
      color: 'text-accent-amber'
    },
    {
      title: 'Skill Mastery',
      value: '78%',
      change: '+8%',
      trend: 'up',
      description: 'Overall competency level',
      icon: Award,
      color: 'text-purple-400'
    }
  ];

  const subjectProgress = [
    { subject: 'Mathematics', progress: 85, sessions: 12, lastScore: 92 },
    { subject: 'Physics', progress: 78, sessions: 8, lastScore: 88 },
    { subject: 'Chemistry', progress: 92, sessions: 15, lastScore: 95 },
    { subject: 'Biology', progress: 71, sessions: 6, lastScore: 82 }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 2.5, sessions: 1 },
    { day: 'Tue', hours: 1.5, sessions: 1 },
    { day: 'Wed', hours: 3.0, sessions: 2 },
    { day: 'Thu', hours: 2.0, sessions: 1 },
    { day: 'Fri', hours: 2.5, sessions: 1 },
    { day: 'Sat', hours: 4.0, sessions: 2 },
    { day: 'Sun', hours: 1.0, sessions: 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className={`text-sm font-medium ${metric.color}`}>
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-gray-400 text-sm font-medium mb-1">{metric.title}</div>
            <div className="text-gray-500 text-xs">{metric.description}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart />
        
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Weekly Activity
          </h3>
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 text-gray-400 text-sm">{day.day}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2 w-32">
                    <motion.div
                      className="bg-gradient-to-r from-primary-500 to-accent-emerald h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.hours / 4) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{day.hours}h</div>
                  <div className="text-gray-400 text-xs">{day.sessions} sessions</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subject Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Subject Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjectProgress.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{subject.subject}</h4>
                <span className="text-primary-500 font-semibold">{subject.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-accent-emerald h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.progress}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{subject.sessions} sessions</span>
                <span>Last score: {subject.lastScore}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress Tracker */}
      <ProgressTracker />
    </div>
  );
};

export default AnalyticsTab;