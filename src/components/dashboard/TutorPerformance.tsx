import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';

const TutorPerformance: React.FC = () => {
  const tutors = [
    {
      name: 'Dr. Sarah Wilson',
      subject: 'Mathematics',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      sessions: 24,
      engagement: 87,
    },
    {
      name: 'Prof. Michael Chen',
      subject: 'Physics',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      sessions: 18,
      engagement: 92,
    },
    {
      name: 'Dr. Emily Rodriguez',
      subject: 'Chemistry',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      sessions: 22,
      engagement: 78,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Tutor Performance</h3>
      
      <div className="space-y-4">
        {tutors.map((tutor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <img 
                src={tutor.avatar} 
                alt={tutor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-white font-medium">{tutor.name}</h4>
                <p className="text-gray-400 text-sm">{tutor.subject}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-1 text-yellow-400 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-white font-medium">{tutor.rating}</span>
                </div>
                <div className="text-xs text-gray-400">{tutor.sessions} sessions</div>
              </div>
              
              <div className="text-center">
                <div className={`flex items-center space-x-1 mb-1 ${
                  tutor.engagement >= 85 ? 'text-accent-emerald' :
                  tutor.engagement >= 70 ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{tutor.engagement}%</span>
                </div>
                <div className="text-xs text-gray-400">engagement</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TutorPerformance;