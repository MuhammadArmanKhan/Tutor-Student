import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  Users, 
  Target,
  Calendar,
  Award,
  ChevronDown,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/supabase';

interface SessionAnalytics {
  session_id: string;
  session_title: string;
  student_name: string;
  date: string;
  duration: number;
  speaking_ratios: {
    tutor: number;
    student: number;
  };
  total_interactions: number;
  average_attention: number;
  question_count: number;
  topics_covered: string[];
  engagement_score: number;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SessionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadAnalytics();
      loadStudents();
    }
  }, [user, selectedTimeframe, selectedStudent]);

  const loadAnalytics = async () => {
    try {
      if (!user) return;
      setLoading(true);
      // Fetch analytics for all sessions of this tutor
      const { data: sessions, error: sessionsError } = await dbHelpers.getSessionsWithDetails(user.id, 'tutor');
      if (sessionsError || !sessions) throw sessionsError;
      const sessionIds = sessions.map((s: any) => s.id);
      if (sessionIds.length === 0) {
        setAnalytics([]);
        setLoading(false);
        return;
      }
      // Fetch analytics for these sessions
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('session_analytics')
        .select('*')
        .in('session_id', sessionIds);
      if (analyticsError) throw analyticsError;
      // Map analytics to dashboard structure
      const analytics = analyticsData.map((a: any) => {
        const session = sessions.find((s: any) => s.id === a.session_id);
        return {
          session_id: a.session_id,
          session_title: session?.title || '-',
          student_name: session?.student?.name || '-',
          date: session?.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : '-',
          duration: session?.duration_minutes || 0,
          speaking_ratios: a.speaking_ratios || { tutor: 0, student: 0 },
          total_interactions: a.total_interactions || 0,
          average_attention: a.average_attention || 0,
          question_count: a.question_count || 0,
          topics_covered: a.topics_covered || [],
          engagement_score: session?.engagement_score || 0
        };
      });
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      if (!user) return;
      // Fetch students for this tutor
      const { data, error } = await supabase
        .from('tutor_students')
        .select('student:users!tutor_students_student_id_fkey(id, name)')
        .eq('tutor_id', user.id)
        .eq('status', 'active');
      if (error) throw error;
      setStudents(data.map((item: any) => item.student));
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  const calculateOverallMetrics = () => {
    if (analytics.length === 0) return null;

    const totalSessions = analytics.length;
    const avgEngagement = analytics.reduce((sum, session) => sum + session.engagement_score, 0) / totalSessions;
    const avgDuration = analytics.reduce((sum, session) => sum + session.duration, 0) / totalSessions;
    const totalInteractions = analytics.reduce((sum, session) => sum + session.total_interactions, 0);
    const avgSpeakingRatio = analytics.reduce((sum, session) => sum + session.speaking_ratios.student, 0) / totalSessions;

    return {
      totalSessions,
      avgEngagement: Math.round(avgEngagement),
      avgDuration: Math.round(avgDuration),
      totalInteractions,
      avgSpeakingRatio: Math.round(avgSpeakingRatio)
    };
  };

  const getEngagementTrendData = () => {
    return analytics.map(session => ({
      date: session.date,
      engagement: session.engagement_score,
      interactions: session.total_interactions,
      questions: session.question_count
    }));
  };

  const getSpeakingRatioData = () => {
    return analytics.map(session => ({
      session: session.session_title.substring(0, 15) + '...',
      tutor: session.speaking_ratios.tutor,
      student: session.speaking_ratios.student
    }));
  };

  const getTopTopics = () => {
    const topicCount: { [key: string]: number } = {};
    analytics.forEach(session => {
      session.topics_covered.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    return Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
  };

  const metrics = calculateOverallMetrics();
  const engagementData = getEngagementTrendData();
  const speakingData = getSpeakingRatioData();
  const topTopics = getTopTopics();

  const COLORS = ['#00D4FF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
          <p className="text-gray-400">Comprehensive insights into your teaching performance</p>
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
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-dark-800">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id} className="bg-dark-800">{student.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-primary-500">{metrics.totalSessions}</span>
            </div>
            <h3 className="text-white font-semibold">Total Sessions</h3>
            <p className="text-gray-400 text-sm">Completed sessions</p>
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
            <p className="text-gray-400 text-sm">Student engagement</p>
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
              <span className="text-2xl font-bold text-accent-amber">{metrics.avgDuration}m</span>
            </div>
            <h3 className="text-white font-semibold">Avg Duration</h3>
            <p className="text-gray-400 text-sm">Session length</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <MessageCircle className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">{metrics.totalInteractions}</span>
            </div>
            <h3 className="text-white font-semibold">Interactions</h3>
            <p className="text-gray-400 text-sm">Total exchanges</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500/10 rounded-xl">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <span className="text-2xl font-bold text-pink-400">{metrics.avgSpeakingRatio}%</span>
            </div>
            <h3 className="text-white font-semibold">Student Talk</h3>
            <p className="text-gray-400 text-sm">Speaking ratio</p>
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
          <h3 className="text-xl font-semibold text-white mb-6">Engagement Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#00D4FF" 
                  strokeWidth={3}
                  dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Speaking Ratios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Speaking Time Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speakingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="session" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Bar dataKey="tutor" stackId="a" fill="#00D4FF" />
                <Bar dataKey="student" stackId="a" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Tutor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-emerald rounded-full"></div>
              <span className="text-sm text-gray-400">Student</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Most Covered Topics</h3>
          <div className="space-y-4">
            {topTopics.map((topic, index) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-emerald rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-white">{topic.topic}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-accent-emerald h-2 rounded-full"
                      style={{ width: `${(topic.count / Math.max(...topTopics.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-8">{topic.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Session Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Recent Session Performance</h3>
          <div className="space-y-4">
            {analytics.slice(0, 5).map((session, index) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{session.session_title}</h4>
                  <span className={`text-sm font-medium ${
                    session.engagement_score >= 85 ? 'text-accent-emerald' :
                    session.engagement_score >= 70 ? 'text-accent-amber' : 'text-red-400'
                  }`}>
                    {session.engagement_score}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{session.student_name}</span>
                  <span>{session.date}</span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{session.duration}min</span>
                  <span>{session.total_interactions} interactions</span>
                  <span>{session.question_count} questions</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;