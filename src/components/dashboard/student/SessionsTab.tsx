import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, FileText, Clock, User, Play, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { dbHelpers } from '../../../lib/supabase';

const SessionsTab: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await dbHelpers.getSessionsWithDetails(user.id, 'student');
      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    };
    fetchSessions();
  }, [user]);

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch =
      (session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-accent-emerald';
      case 'scheduled': return 'text-accent-amber';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent-emerald/10';
      case 'scheduled': return 'bg-accent-amber/10';
      case 'cancelled': return 'bg-red-400/10';
      default: return 'bg-gray-400/10';
    }
  };

  // Helper to create a session in Supabase
  const createSessionFromSchedule = async (scheduledSession: any) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          tutor_id: scheduledSession.tutor_id || 'mock-tutor-id',
          student_id: scheduledSession.student_id || 'mock-student-id',
          title: scheduledSession.title,
          subject: scheduledSession.subject,
          scheduled_at: new Date().toISOString(),
          duration_minutes: scheduledSession.duration || 60,
          status: 'in_progress',
          notes: '',
        },
      ])
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  };

  // Handler for joining a session
  const joinSession = async (scheduledSession: any) => {
    try {
      const sessionId = await createSessionFromSchedule(scheduledSession);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {['all', 'completed', 'scheduled', 'cancelled'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Sessions Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'No sessions match your search criteria.' : 'No sessions available for the selected filter.'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session, index) => {
            const tutorName = session.tutor?.name || 'Unknown';
            const dateObj = session.scheduled_at ? new Date(session.scheduled_at) : null;
            const date = dateObj ? dateObj.toLocaleDateString() : '-';
            const time = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            const engagement = session.engagement_score ?? null;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-primary-500/10 rounded-xl flex-shrink-0">
                      <Video className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{session.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{tutorName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{date} at {time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration_minutes} min</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Subject: </span>
                        <span className="text-sm text-primary-400">{session.subject}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* Status */}
                    <div className="flex flex-col items-start lg:items-end">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(session.status)} ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </div>
                      {engagement && (
                        <div className="text-sm text-gray-400 mt-1">
                          Engagement: <span className="text-accent-emerald">{engagement}%</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {session.status === 'completed' && (
                        <>
                          {session.recording && (
                            <motion.button
                              className="p-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Download Recording"
                            >
                              <Download className="h-4 w-4" />
                            </motion.button>
                          )}
                          {session.transcript && (
                            <motion.button
                              className="p-2 bg-accent-emerald/20 text-accent-emerald rounded-lg hover:bg-accent-emerald/30 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="View Transcript"
                            >
                              <FileText className="h-4 w-4" />
                            </motion.button>
                          )}
                          {session.report && (
                            <motion.button
                              className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Download Report"
                            >
                              <FileText className="h-4 w-4" />
                            </motion.button>
                          )}
                        </>
                      )}
                      {session.status === 'scheduled' && (
                        <motion.button
                          onClick={() => joinSession(session)}
                          className="px-4 py-2 bg-accent-emerald text-white rounded-lg hover:bg-accent-emerald/80 transition-colors duration-200 text-sm font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Join Session
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionsTab;