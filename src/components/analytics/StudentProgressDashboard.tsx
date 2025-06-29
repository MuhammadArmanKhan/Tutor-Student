import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BookOpen,
  BarChart3,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

interface StudentProgress {
  subject: string;
  sessions_completed: number;
  total_time_minutes: number;
  average_engagement: number;
  improvement_rate: number;
  current_level: string;
  next_milestone: string;
  strengths: string[];
  areas_for_improvement: string[];
}

const StudentProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [selectedSubject, selectedTimeframe]);

  const loadProgressData = async () => {
    try {
      // Mock data for demonstration
      const mockProgress: StudentProgress[] = [
        {
          subject: 'Mathematics',
          sessions_completed: 12,
          total_time_minutes: 720,
          average_engagement: 87,
          improvement_rate: 15,
          current_level: 'Advanced',
          next_milestone: 'Calculus Mastery',
          strengths: ['Problem Solving', 'Logical Thinking', 'Pattern Recognition'],
          areas_for_improvement: ['Speed', 'Complex Word Problems']
        },
        {
          subject: 'Physics',
          sessions_completed: 8,
          total_time_minutes: 480,
          average_engagement: 92,
          improvement_rate: 22,
          current_level: 'Intermediate',
          next_milestone: 'Quantum Mechanics Basics',
          strengths: ['Conceptual Understanding', 'Mathematical Application'],
          areas_for_improvement: ['Laboratory Skills', 'Graph Interpretation']
        },
        {
          subject: 'Chemistry',
          sessions_completed: 10,
          total_time_minutes: 600,
          average_engagement: 78,
          improvement_rate: 8,
          current_level: 'Intermediate',
          next_milestone: 'Organic Chemistry',
          strengths: ['Memorization', 'Formula Application'],
          areas_for_improvement: ['Reaction Mechanisms', 'Balancing Equations']
        }
      ];

      setProgressData(mockProgress);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementTrendData = () => {
    // Mock trend data
    return [
      { week: 'Week 1', engagement: 75, sessions: 2 },
      { week: 'Week 2', engagement: 82, sessions: 3 },
      { week: 'Week 3', engagement: 78, sessions: 2 },
      { week: 'Week 4', engagement: 87, sessions: 3 },
      { week: 'Week 5', engagement: 92, sessions: 2 }
    ];
  };

  const getSubjectRadarData = () => {
    return progressData.map(subject => ({
      subject: subject.subject,
      engagement: subject.average_engagement,
      improvement: subject.improvement_rate * 4, // Scale to 0-100
      sessions: (subject.sessions_completed / 15) * 100, // Scale to 0-100
      time: (subject.total_time_minutes / 1000) * 100 // Scale to 0-100
    }));
  };

  const calculateOverallMetrics = () => {
    if (progressData.length === 0) return null;

    const totalSessions = progressData.reduce((sum, subject) => sum + subject.sessions_completed, 0);
    const totalTime = progressData.reduce((sum, subject) => sum + subject.total_time_minutes, 0);
    const avgEngagement = progressData.reduce((sum, subject) => sum + subject.average_engagement, 0) / progressData.length;
    const avgImprovement = progressData.reduce((sum, subject) => sum + subject.improvement_rate, 0) / progressData.length;

    return {
      totalSessions,
      totalTime: Math.round(totalTime / 60), // Convert to hours
      avgEngagement: Math.round(avgEngagement),
      avgImprovement: Math.round(avgImprovement)
    };
  };

  const metrics = calculateOverallMetrics();
  const engagementTrend = getEngagementTrendData();
  const radarData = getSubjectRadarData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Learning Progress</h2>
          <p className="text-gray-400">Track your academic journey and achievements</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
            >
              <option value="week" className="bg-dark-800">This Week</option>
              <option value="month" className="bg-dark-800">This Month</option>
              <option value="quarter" className="bg-dark-800">This Quarter</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-dark-800">All Subjects</option>
              {progressData.map(subject => (
                <option key={subject.subject} value={subject.subject} className="bg-dark-800">{subject.subject}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-primary-500">{metrics.totalSessions}</span>
            </div>
            <h3 className="text-white font-semibold">Sessions Completed</h3>
            <p className="text-gray-400 text-sm">Total learning sessions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-emerald/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-accent-emerald" />
              </div>
              <span className="text-2xl font-bold text-accent-emerald">{metrics.avgEngagement}%</span>
            </div>
            <h3 className="text-white font-semibold">Avg Engagement</h3>
            <p className="text-gray-400 text-sm">Learning engagement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-amber/10 rounded-xl">
                <Clock className="h-6 w-6 text-accent-amber" />
              </div>
              <span className="text-2xl font-bold text-accent-amber">{metrics.totalTime}h</span>
            </div>
            <h3 className="text-white font-semibold">Study Time</h3>
            <p className="text-gray-400 text-sm">Total hours studied</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">+{metrics.avgImprovement}%</span>
            </div>
            <h3 className="text-white font-semibold">Improvement</h3>
            <p className="text-gray-400 text-sm">Average growth rate</p>
          </motion.div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Engagement Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#00D4FF" 
                  strokeWidth={3}
                  dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Subject Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3a3a3a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar
                  name="Engagement"
                  dataKey="engagement"
                  stroke="#00D4FF"
                  fill="#00D4FF"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Improvement"
                  dataKey="improvement"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Subject Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {progressData.map((subject, index) => (
          <motion.div
            key={subject.subject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{subject.subject}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                subject.average_engagement >= 85 ? 'bg-accent-emerald/20 text-accent-emerald' :
                subject.average_engagement >= 70 ? 'bg-accent-amber/20 text-accent-amber' :
                'bg-red-400/20 text-red-400'
              }`}>
                {subject.current_level}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Engagement</span>
                <span className="text-accent-emerald font-semibold">{subject.average_engagement}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sessions</span>
                <span className="text-white">{subject.sessions_completed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Study Time</span>
                <span className="text-white">{Math.round(subject.total_time_minutes / 60)}h</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Improvement</span>
                <span className="text-primary-500 font-semibold">+{subject.improvement_rate}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="mb-2">
                <span className="text-sm text-gray-400">Next Milestone:</span>
                <p className="text-white font-medium">{subject.next_milestone}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2">
                <span className="text-sm text-gray-400">Strengths:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subject.strengths.slice(0, 2).map((strength, idx) => (
                    <span key={idx} className="px-2 py-1 bg-accent-emerald/20 text-accent-emerald rounded text-xs">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Areas to improve:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subject.areas_for_improvement.slice(0, 2).map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-accent-amber/20 text-accent-amber rounded text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentProgressDashboard;