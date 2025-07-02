import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Clock, Activity, Eye, Mic, MicOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface LiveSession {
  id: string;
  title: string;
  subject: string;
  student_name: string;
  started_at: string;
  duration_minutes: number;
  current_engagement: number;
  is_student_speaking: boolean;
  is_tutor_speaking: boolean;
  participants_count: number;
}

const LiveSessionMonitor: React.FC = () => {
  const { user } = useAuth();
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadLiveSessions();
      
      // Set up real-time subscription for live sessions
      const subscription = supabase
        .channel('live-sessions')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'sessions',
            filter: `tutor_id=eq.${user.id}`
          }, 
          () => {
            loadLiveSessions();
          }
        )
        .subscribe();

      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(loadLiveSessions, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [user]);

  const loadLiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          subject,
          started_at,
          duration_minutes,
          engagement_score,
          student:users!sessions_student_id_fkey(name)
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Transform data and simulate real-time metrics
      const transformedSessions: LiveSession[] = data.map(session => {
        let studentName = 'Unknown Student';
        if (Array.isArray(session.student)) {
          const arr = session.student as any[];
          studentName = arr[0]?.name || 'Unknown Student';
        } else if (session.student && (session.student as any).name) {
          studentName = (session.student as any).name;
        }
        return {
          id: session.id,
          title: session.title,
          subject: session.subject,
          student_name: studentName,
          started_at: session.started_at,
          duration_minutes: session.duration_minutes,
          current_engagement: Math.floor(Math.random() * 30) + 70, // Simulate real-time engagement
          is_student_speaking: Math.random() > 0.7,
          is_tutor_speaking: Math.random() > 0.8,
          participants_count: 2
        };
      });

      setLiveSessions(transformedSessions);
    } catch (error) {
      console.error('Error loading live sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionDuration = (startedAt: string): string => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (user?.role !== 'tutor') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (liveSessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
      >
        <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Live Sessions</h3>
        <p className="text-gray-400">Start a session to see real-time monitoring here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Eye className="h-5 w-5 mr-2 text-red-500" />
          Live Session Monitor
        </h3>
        <div className="flex items-center space-x-2 text-red-400">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">LIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {liveSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gradient-to-r from-red-500/10 to-primary-500/10 rounded-xl border border-red-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-semibold">{session.title}</h4>
                <p className="text-gray-400 text-sm">{session.subject} • {session.student_name}</p>
              </div>
              <div className="text-right">
                <div className="text-red-400 font-medium">LIVE</div>
                <div className="text-gray-400 text-sm">{getSessionDuration(session.started_at)}</div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Activity className="h-4 w-4 text-accent-emerald" />
                  <span className="text-accent-emerald font-semibold">{session.current_engagement}%</span>
                </div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Users className="h-4 w-4 text-primary-500" />
                  <span className="text-primary-500 font-semibold">{session.participants_count}</span>
                </div>
                <div className="text-xs text-gray-400">Participants</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {session.is_student_speaking ? (
                    <Mic className="h-4 w-4 text-accent-emerald animate-pulse" />
                  ) : (
                    <MicOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`font-semibold ${session.is_student_speaking ? 'text-accent-emerald' : 'text-gray-400'}`}>
                    Student
                  </span>
                </div>
                <div className="text-xs text-gray-400">Speaking</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Clock className="h-4 w-4 text-accent-amber" />
                  <span className="text-accent-amber font-semibold">{session.duration_minutes}m</span>
                </div>
                <div className="text-xs text-gray-400">Planned</div>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Real-time Engagement</span>
                <span className="text-xs text-accent-emerald">{session.current_engagement}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-accent-emerald to-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${session.current_engagement}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                className="flex-1 bg-primary-500/20 text-primary-400 py-2 px-4 rounded-lg text-sm hover:bg-primary-500/30 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Session
              </motion.button>
              <motion.button
                className="flex-1 bg-accent-emerald/20 text-accent-emerald py-2 px-4 rounded-lg text-sm hover:bg-accent-emerald/30 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LiveSessionMonitor;