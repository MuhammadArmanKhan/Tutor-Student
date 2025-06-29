import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Star } from 'lucide-react';

const StudentsList: React.FC = () => {
  const students = [
    {
      name: 'Alex Johnson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      subject: 'Mathematics',
      engagement: 87,
      sessions: 12,
      lastSession: '2 hours ago',
      progress: 85,
    },
    {
      name: 'Emma Chen',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      subject: 'Physics',
      engagement: 92,
      sessions: 8,
      lastSession: '1 day ago',
      progress: 78,
    },
    {
      name: 'Michael Rodriguez',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      subject: 'Chemistry',
      engagement: 78,
      sessions: 15,
      lastSession: '3 hours ago',
      progress: 92,
    },
    {
      name: 'Sophie Wilson',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      subject: 'Biology',
      engagement: 85,
      sessions: 10,
      lastSession: '5 hours ago',
      progress: 88,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">My Students</h3>
        <motion.button
          className="text-primary-500 hover:text-primary-400 text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary-500/10 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
        >
          View All
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {students.map((student, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 space-y-3 sm:space-y-0"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src={student.avatar} 
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">{student.name}</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
                  <span>{student.subject}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{student.lastSession}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-6">
              <div className="text-center">
                <div className={`flex items-center space-x-1 mb-1 ${
                  student.engagement >= 85 ? 'text-accent-emerald' :
                  student.engagement >= 70 ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{student.engagement}%</span>
                </div>
                <div className="text-xs text-gray-400">engagement</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-1 text-primary-500 mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-white font-medium">{student.progress}%</span>
                </div>
                <div className="text-xs text-gray-400">progress</div>
              </div>
              
              <div className="text-center">
                <div className="text-white font-medium">{student.sessions}</div>
                <div className="text-xs text-gray-400">sessions</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudentsList;