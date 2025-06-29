import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../StatsCards';
import LiveSessionMonitor from '../../session/LiveSessionMonitor';
import { Calendar, Clock, TrendingUp, Users, DollarSign, Star, Plus } from 'lucide-react';

const TutorOverviewTab: React.FC = () => {
  const navigate = useNavigate();

  const todaySchedule = [
    {
      id: 1,
      student: 'Alex Johnson',
      subject: 'Advanced Mathematics',
      time: '10:00 AM',
      duration: '60 min',
      status: 'confirmed'
    },
    {
      id: 2,
      student: 'Emma Chen',
      subject: 'Physics',
      time: '2:00 PM',
      duration: '45 min',
      status: 'pending'
    },
    {
      id: 3,
      student: 'Michael Rodriguez',
      subject: 'Chemistry',
      time: '4:00 PM',
      duration: '60 min',
      status: 'confirmed'
    }
  ];

  const recentFeedback = [
    {
      id: 1,
      student: 'Sarah Wilson',
      rating: 5,
      comment: 'Excellent explanation of complex concepts. Very patient and helpful.',
      subject: 'Mathematics',
      date: '2 days ago'
    },
    {
      id: 2,
      student: 'David Chen',
      rating: 5,
      comment: 'Great teaching style and very knowledgeable. Highly recommend!',
      subject: 'Physics',
      date: '1 week ago'
    }
  ];

  const earnings = {
    today: 225,
    thisWeek: 1350,
    thisMonth: 5400,
    pending: 450
  };

  const startNewSession = () => {
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
        className="bg-gradient-to-r from-accent-emerald/10 to-primary-500/10 rounded-2xl p-6 border border-accent-emerald/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Professor Smith!</h2>
            <p className="text-gray-400">
              You have 3 sessions scheduled today. Your students are performing excellently!
            </p>
          </div>
          <motion.button
            onClick={startNewSession}
            className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-full md:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>Start New Session</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards role="tutor" />

      {/* Live Session Monitor */}
      <LiveSessionMonitor />

      {/* Today's Schedule & Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Schedule
          </h3>
          <div className="space-y-4">
            {todaySchedule.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{session.student}</h4>
                    <p className="text-gray-400 text-sm">{session.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-primary-500 font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {session.time}
                    </div>
                    <div className="text-gray-400 text-sm">{session.duration}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'confirmed' 
                      ? 'bg-accent-emerald/20 text-accent-emerald' 
                      : 'bg-accent-amber/20 text-accent-amber'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  <motion.button
                    onClick={startNewSession}
                    className="text-primary-500 hover:text-primary-400 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-500/10 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    Start Session
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Earnings Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Earnings Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-2xl font-bold text-accent-emerald">${earnings.today}</div>
              <div className="text-gray-400 text-sm">Today</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-2xl font-bold text-primary-500">${earnings.thisWeek}</div>
              <div className="text-gray-400 text-sm">This Week</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-2xl font-bold text-accent-amber">${earnings.thisMonth}</div>
              <div className="text-gray-400 text-sm">This Month</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">${earnings.pending}</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Recent Feedback
        </h3>
        <div className="space-y-4">
          {recentFeedback.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium">{feedback.student}</h4>
                  <p className="text-gray-400 text-sm">{feedback.subject} • {feedback.date}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(feedback.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm italic">"{feedback.comment}"</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TutorOverviewTab;