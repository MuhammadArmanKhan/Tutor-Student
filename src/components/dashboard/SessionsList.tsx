import React from 'react';
import { motion } from 'framer-motion';
import { Video, Download, FileText, Clock, User } from 'lucide-react';

const SessionsList: React.FC = () => {
  const sessions = [
    {
      id: 1,
      subject: 'Advanced Mathematics',
      tutor: 'Dr. Sarah Wilson',
      date: '2025-01-08',
      duration: '45 mins',
      engagement: 87,
      status: 'completed',
    },
    {
      id: 2,
      subject: 'Physics - Quantum Mechanics',
      tutor: 'Prof. Michael Chen',
      date: '2025-01-07',
      duration: '60 mins',
      engagement: 92,
      status: 'completed',
    },
    {
      id: 3,
      subject: 'Chemistry - Organic Compounds',
      tutor: 'Dr. Emily Rodriguez',
      date: '2025-01-06',
      duration: '50 mins',
      engagement: 78,
      status: 'completed',
    },
    {
      id: 4,
      subject: 'Biology - Cell Structure',
      tutor: 'Dr. James Thompson',
      date: '2025-01-05',
      duration: '40 mins',
      engagement: 85,
      status: 'completed',
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
          className="text-primary-500 hover:text-primary-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary-500/10 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
        >
          View All
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 space-y-3 sm:space-y-0"
          >
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="p-2 bg-primary-500/10 rounded-lg flex-shrink-0">
                <Video className="h-5 w-5 text-primary-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">{session.subject}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.tutor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{session.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">{session.date}</div>
                <div className={`text-sm font-medium ${
                  session.engagement >= 85 ? 'text-accent-emerald' :
                  session.engagement >= 70 ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  {session.engagement}% engagement
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SessionsList;