import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../StatsCards';
import EngagementChart from '../EngagementChart';
import TutorPerformance from '../TutorPerformance';
import { Calendar, Clock, TrendingUp, Award, Video } from 'lucide-react';

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();

  const upcomingSessions = [
    {
      id: 1,
      title: 'Advanced Calculus',
      tutor: 'Dr. Sarah Wilson',
      date: 'Today',
      time: '3:00 PM',
      duration: '60 min',
      subject: 'Mathematics'
    },
    {
      id: 2,
      title: 'Quantum Physics',
      tutor: 'Prof. Michael Chen',
      date: 'Tomorrow',
      time: '10:00 AM',
      duration: '45 min',
      subject: 'Physics'
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Perfect Attendance',
      description: 'Attended all sessions this month',
      icon: Award,
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10'
    },
    {
      id: 2,
      title: 'High Engagement',
      description: '95% average engagement score',
      icon: TrendingUp,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10'
    }
  ];

  const joinDemoSession = () => {
    // Create a mock session for demonstration
    const mockSessionId = 'demo-session-' + Date.now();
    navigate(`/session/${mockSessionId}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500/10 to-accent-emerald/10 rounded-2xl p-6 border border-primary-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Alex!</h2>
            <p className="text-gray-400">
              You have 2 upcoming sessions today. Keep up the great work!
            </p>
          </div>
          <motion.button
            onClick={joinDemoSession}
            className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-full md:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Video className="h-5 w-5" />
            <span>Join Demo Session</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Sessions
          </h3>
          <div className="space-y-4">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{session.title}</h4>
                    <p className="text-gray-400 text-sm">{session.tutor}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-primary-500 font-medium">{session.date}</div>
                    <div className="text-gray-400 text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.time} • {session.duration}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {session.subject}
                  </span>
                  <motion.button
                    onClick={joinDemoSession}
                    className="text-primary-500 hover:text-primary-400 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-500/10 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    Join Session
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button
            className="w-full mt-4 bg-primary-500/20 text-primary-400 py-3 px-4 rounded-xl hover:bg-primary-500/30 transition-colors duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Sessions
          </motion.button>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Recent Achievements
          </h3>
          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className={`p-3 rounded-xl ${achievement.bgColor}`}>
                  <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                </div>
                <div>
                  <h4 className="text-white font-medium">{achievement.title}</h4>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Demo Session Button */}
          <motion.button
            onClick={joinDemoSession}
            className="w-full mt-6 bg-gradient-to-r from-accent-emerald/20 to-primary-500/20 text-white py-3 px-4 rounded-xl hover:from-accent-emerald/30 hover:to-primary-500/30 transition-all duration-200 font-medium border border-accent-emerald/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎯 Try Demo Session Recording
          </motion.button>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart />
        <TutorPerformance />
      </div>
    </div>
  );
};

export default OverviewTab;