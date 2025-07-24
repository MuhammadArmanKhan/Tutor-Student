import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, FileText, Clock, User, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/supabase';

const RecentSessions: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await dbHelpers.getSessionsWithDetails(user.id, 'tutor');
      if (!error && data) {
        setSessions(data.slice(0, 5)); // Show only recent 5 sessions
      }
      setLoading(false);
    };
    fetchSessions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
        {sessions.length === 0 && (
          <div className="text-gray-400 text-center py-8">No recent sessions found.</div>
        )}
        {sessions.map((session, index) => {
          const studentName = session.student?.name || 'Unknown';
          const duration = session.duration_minutes ? `${session.duration_minutes} mins` : '-';
          const date = session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : '-';
          const engagement = session.engagement_score ?? '-';
          const status = session.status;
          return (
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
                    status === 'in_progress' ? 'bg-accent-emerald/10' : 'bg-primary-500/10'
                  }`}>
                    {status === 'in_progress' ? (
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
                        <span className="truncate">{studentName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                  <div className="text-left lg:text-right">
                    <div className="text-xs lg:text-sm text-gray-400">{date}</div>
                    <div className={`text-xs lg:text-sm font-medium ${
                      status === 'in_progress' ? 'text-accent-emerald' :
                      engagement >= 85 ? 'text-accent-emerald' :
                      engagement >= 70 ? 'text-accent-amber' : 'text-red-400'
                    }`}>
                      {status === 'in_progress' ? 'Live Now' : `${engagement}% engagement`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'completed' && session.recording && (
                      <>
                        <motion.button
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Download Recording"
                          onClick={() => window.open(session.recording[0]?.video_url, '_blank')}
                          disabled={!session.recording[0]?.video_url}
                        >
                          <Download className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-gray-400 hover:text-accent-emerald hover:bg-accent-emerald/10 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="View Transcript"
                          onClick={() => window.open(session.recording[0]?.transcript_url, '_blank')}
                          disabled={!session.recording[0]?.transcript_url}
                        >
                          <FileText className="h-4 w-4" />
                        </motion.button>
                      </>
                    )}
                    {status === 'in_progress' && (
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
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentSessions;