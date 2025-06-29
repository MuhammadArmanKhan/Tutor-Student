import React from 'react';
import { motion } from 'framer-motion';
import { Video, Download, FileText, Clock, User, Play } from 'lucide-react';

const RecentSessions: React.FC = () => {
  const sessions = [
    {
      id: 1,
      student: 'Alex Johnson',
      subject: 'Advanced Mathematics',
      date: '2025-01-08',
      duration: '45 mins',
      engagement: 87,
      status: 'completed',
      recording: true,
    },
    {
      id: 2,
      student: 'Emma Chen',
      subject: 'Physics - Quantum Mechanics',
      date: '2025-01-08',
      duration: '60 mins',
      engagement: 92,
      status: 'in_progress',
      recording: true,
    },
    {
      id: 3,
      student: 'Michael Rodriguez',
      subject: 'Chemistry - Organic Compounds',
      date: '2025-01-07',
      duration: '50 mins',
      engagement: 78,
      status: 'completed',
      recording: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Sessions</h3>
        <motion.button
          className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start New Session
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-4 min-w-0 flex-1">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  session.status === 'in_progress' ? 'bg-accent-emerald/10' : 'bg-primary-500/10'
                }`}>
                  {session.status === 'in_progress' ? (
                    <Play className="h-5 w-5 text-accent-emerald" />
                  ) : (
                    <Video className="h-5 w-5 text-primary-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-medium text-sm lg:text-base truncate">{session.subject}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs lg:text-sm text-gray-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{session.student}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{session.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                <div className="text-left lg:text-right">
                  <div className="text-xs lg:text-sm text-gray-400">{session.date}</div>
                  <div className={`text-xs lg:text-sm font-medium ${
                    session.status === 'in_progress' ? 'text-accent-emerald' :
                    session.engagement >= 85 ? 'text-accent-emerald' :
                    session.engagement >= 70 ? 'text-accent-amber' : 'text-red-400'
                  }`}>
                    {session.status === 'in_progress' ? 'Live Now' : `${session.engagement}% engagement`}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {session.status === 'completed' && (
                    <>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Download Recording"
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-accent-emerald hover:bg-accent-emerald/10 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="View Transcript"
                      >
                        <FileText className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                  {session.status === 'in_progress' && (
                    <motion.button
                      className="px-3 py-1 bg-accent-emerald/20 text-accent-emerald rounded-lg text-xs font-medium"
                      whileHover={{ scale: 1.05 }}
                    >
                      Join Session
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentSessions;