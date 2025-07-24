import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../StatsCards';
import LiveSessionMonitor from '../../session/LiveSessionMonitor';
import { Calendar, Clock, TrendingUp, Users, DollarSign, Star, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

const TutorOverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentFeedback, setRecentFeedback] = React.useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = React.useState(true);
  const [errorFeedback, setErrorFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFeedback = async () => {
      if (!user) return;
      setLoadingFeedback(true);
      setErrorFeedback(null);
      try {
        const { data, error } = await supabase
          .from('session_reports')
          .select('id, session_id, rating, comment, subject, created_at, student:student_id(name)')
          .eq('tutor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        setRecentFeedback(data || []);
      } catch (err) {
        setErrorFeedback('Failed to load feedback');
      } finally {
        setLoadingFeedback(false);
      }
    };
    fetchFeedback();
  }, [user]);

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

  const earnings = {
    today: 225,
    thisWeek: 1350,
    thisMonth: 5400,
    pending: 450
  };

  // Helper to create a session in Supabase
  const createSessionFromSchedule = async (scheduledSession: any) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          tutor_id: user?.id,
          student_id: '550e8400-e29b-41d4-a716-446655440002',
          title: scheduledSession.subject + ' Session',
          subject: scheduledSession.subject,
          scheduled_at: new Date().toISOString(),
          duration_minutes: parseInt(scheduledSession.duration) || 60,
          status: 'in_progress',
          notes: '',
        },
      ])
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  };

  // Updated startNewSession to create a real session
  const startNewSession = async (scheduledSession?: any) => {
    try {
      // Use the first confirmed session as a demo; in real app, pass the session object
      const sessionToStart = scheduledSession || todaySchedule.find(s => s.status === 'confirmed');
      if (!sessionToStart) {
        toast.error('No confirmed session to start.');
        return;
      }
      const sessionId = await createSessionFromSchedule(sessionToStart);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      toast.error('Failed to start session');
    }
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
            onClick={() => startNewSession()}
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
        {loadingFeedback && <p className="text-gray-400 text-center py-4">Loading feedback...</p>}
        {errorFeedback && <p className="text-red-400 text-center py-4">{errorFeedback}</p>}
        {!loadingFeedback && !errorFeedback && recentFeedback.length === 0 && (
          <p className="text-gray-400 text-center py-4">No recent feedback available.</p>
        )}
        {!loadingFeedback && !errorFeedback && recentFeedback.length > 0 && (
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
                    <h4 className="text-white font-medium">{feedback.name}</h4>
                    <p className="text-gray-400 text-sm">{feedback.subject} • {new Date(feedback.created_at).toLocaleDateString()}</p>
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
        )}
      </motion.div>
    </div>
  );
};

export default TutorOverviewTab;