import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import SessionRecorder from '../components/session/SessionRecorder';
import DownloadManager from '../components/downloads/DownloadManager';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, User, BookOpen, Video, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface SessionData {
  id: string;
  title: string;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string;
  tutor: { name: string };
  student: { name: string };
  recording_url?: string;
  engagement_score?: number;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          tutor:users!sessions_tutor_id_fkey(name),
          student:users!sessions_student_id_fkey(name)
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      setSession(data);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = (recordingUrl: string) => {
    setSession((prev: any) => ({
      ...prev,
      recording_url: recordingUrl,
      status: 'completed'
    }));
  };

  const saveNotes = async () => {
    if (!session) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;
      
      toast.success('Notes saved successfully');
      setSession(prev => prev ? { ...prev, notes } : null);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const goBack = () => {
    if (user?.role === 'tutor') {
      navigate('/tutor-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading Session..." role={user?.role || 'student'}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout title="Session Not Found" role={user?.role || 'student'}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Session Not Found</h2>
          <p className="text-gray-400 mb-6">The requested session could not be found.</p>
          <motion.button
            onClick={goBack}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back to Dashboard
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Session: ${session.title}`} role={user?.role || 'student'}>
      <div className="space-y-8">
        {/* Back Button */}
        <motion.button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          whileHover={{ x: -5 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500/10 to-accent-emerald/10 rounded-2xl p-6 border border-primary-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary-500" />
              <div>
                <div className="text-sm text-gray-400">Subject</div>
                <div className="text-white font-semibold">{session.subject}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-accent-emerald" />
              <div>
                <div className="text-sm text-gray-400">
                  {user?.role === 'tutor' ? 'Student' : 'Tutor'}
                </div>
                <div className="text-white font-semibold">
                  {user?.role === 'tutor' ? session.student?.name : session.tutor?.name}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-accent-amber" />
              <div>
                <div className="text-sm text-gray-400">Duration</div>
                <div className="text-white font-semibold">{session.duration_minutes} min</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className={`font-semibold capitalize ${
                  session.status === 'completed' ? 'text-accent-emerald' :
                  session.status === 'in_progress' ? 'text-accent-amber' :
                  'text-gray-400'
                }`}>
                  {session.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {session.engagement_score && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Engagement Score</span>
                <span className={`text-lg font-bold ${
                  session.engagement_score >= 80 ? 'text-accent-emerald' :
                  session.engagement_score >= 60 ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  {session.engagement_score}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    session.engagement_score >= 80 ? 'bg-accent-emerald' :
                    session.engagement_score >= 60 ? 'bg-accent-amber' : 'bg-red-400'
                  }`}
                  style={{ width: `${session.engagement_score}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Session Recorder */}
        {session.status !== 'completed' && (
          <SessionRecorder 
            sessionId={session.id} 
            onRecordingComplete={handleRecordingComplete}
          />
        )}

        {/* Download Manager - Show if session is completed and has recording */}
        {session.status === 'completed' && session.recording_url && (
          <DownloadManager 
            sessionId={session.id}
            sessionTitle={session.title}
          />
        )}

        {/* Session Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Session Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors duration-200 resize-none"
            placeholder="Add notes about this session..."
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {notes.length > 0 && `${notes.length} characters`}
            </div>
            <motion.button
              onClick={saveNotes}
              disabled={savingNotes || notes === session.notes}
              className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="h-4 w-4" />
              <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SessionPage;