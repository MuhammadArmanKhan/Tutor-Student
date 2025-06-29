import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const EngagementChart: React.FC = () => {
  const data = [
    { day: 'Mon', engagement: 75 },
    { day: 'Tue', engagement: 82 },
    { day: 'Wed', engagement: 78 },
    { day: 'Thu', engagement: 85 },
    { day: 'Fri', engagement: 92 },
    { day: 'Sat', engagement: 88 },
    { day: 'Sun', engagement: 79 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Weekly Engagement</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
            <XAxis 
              dataKey="day" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
            />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#00D4FF" 
              strokeWidth={3}
              dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#00D4FF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EngagementChart;