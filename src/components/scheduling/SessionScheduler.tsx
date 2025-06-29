import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, User, BookOpen, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ScheduledSession {
  id: string;
  title: string;
  subject: string;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  student_name?: string;
  tutor_name?: string;
}

const SessionScheduler: React.FC = () => {
  const { user } = useAuth();
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    student_id: '',
    title: '',
    subject: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadScheduledSessions();
      if (user.role === 'tutor') {
        loadStudents();
      }
    }
  }, [user]);

  const loadScheduledSessions = async () => {
    try {
      const query = supabase
        .from('session_schedule')
        .select(`
          *,
          student:users!session_schedule_student_id_fkey(name),
          tutor:users!session_schedule_tutor_id_fkey(name)
        `)
        .order('scheduled_date', { ascending: true });

      if (user?.role === 'tutor') {
        query.eq('tutor_id', user.id);
      } else {
        query.eq('student_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedSessions = data.map(session => ({
        id: session.id,
        title: session.title,
        subject: session.subject,
        scheduled_date: session.scheduled_date,
        duration_minutes: session.duration_minutes,
        status: session.status,
        student_name: session.student?.name,
        tutor_name: session.tutor?.name
      }));

      setScheduledSessions(transformedSessions);
    } catch (error) {
      console.error('Error loading scheduled sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_students')
        .select(`
          student_id,
          student:users!tutor_students_student_id_fkey(id, name, email)
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      setStudents(data.map(item => item.student));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const scheduleSession = async () => {
    if (!newSession.student_id || !newSession.title || !newSession.scheduled_date || !newSession.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${newSession.scheduled_date}T${newSession.scheduled_time}`);

      const { error } = await supabase
        .from('session_schedule')
        .insert({
          tutor_id: user?.id,
          student_id: newSession.student_id,
          title: newSession.title,
          subject: newSession.subject,
          scheduled_date: scheduledDateTime.toISOString(),
          duration_minutes: newSession.duration_minutes,
          notes: newSession.notes,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success('Session scheduled successfully!');
      setShowScheduleModal(false);
      setNewSession({
        student_id: '',
        title: '',
        subject: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        notes: ''
      });
      loadScheduledSessions();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule session');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-accent-amber';
      case 'confirmed': return 'text-accent-emerald';
      case 'cancelled': return 'text-red-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Session Schedule
        </h3>
        {user?.role === 'tutor' && (
          <motion.button
            onClick={() => setShowScheduleModal(true)}
            className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Session</span>
          </motion.button>
        )}
      </div>

      {/* Scheduled Sessions */}
      <div className="space-y-4">
        {scheduledSessions.map((session, index) => {
          const { date, time } = formatDateTime(session.scheduled_date);
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="p-3 bg-primary-500/10 rounded-lg flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-semibold text-sm lg:text-base truncate">{session.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs lg:text-sm text-gray-400 mt-1">
                      <span className="truncate">{session.subject}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{user?.role === 'tutor' ? session.student_name : session.tutor_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                  <div className="text-left lg:text-right">
                    <div className="flex items-center space-x-2 text-white font-medium text-sm lg:text-base">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 text-xs lg:text-sm mt-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{time} ({session.duration_minutes}m)</span>
                    </div>
                    <div className={`text-xs lg:text-sm font-medium mt-1 capitalize ${getStatusColor(session.status)}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {scheduledSessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Scheduled Sessions</h3>
            <p className="text-gray-400 text-center">
              {user?.role === 'tutor' 
                ? 'Schedule your first session to get started.' 
                : 'No upcoming sessions scheduled.'}
            </p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Schedule New Session</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student *
                </label>
                <div className="relative">
                  <select
                    value={newSession.student_id}
                    onChange={(e) => setNewSession(prev => ({ ...prev, student_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors duration-200 appearance-none"
                  >
                    <option value="" className="bg-dark-800 text-white">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id} className="bg-dark-800 text-white">{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  placeholder="e.g., Algebra Review Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newSession.subject}
                  onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newSession.scheduled_date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newSession.scheduled_time}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={newSession.duration_minutes}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors duration-200 appearance-none"
                >
                  <option value={30} className="bg-dark-800 text-white">30 minutes</option>
                  <option value={45} className="bg-dark-800 text-white">45 minutes</option>
                  <option value={60} className="bg-dark-800 text-white">60 minutes</option>
                  <option value={90} className="bg-dark-800 text-white">90 minutes</option>
                  <option value={120} className="bg-dark-800 text-white">120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200 resize-none"
                  placeholder="Add any notes or preparation instructions..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <motion.button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={scheduleSession}
                className="flex-1 bg-gradient-to-r from-primary-500 to-accent-emerald text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Schedule Session
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SessionScheduler;