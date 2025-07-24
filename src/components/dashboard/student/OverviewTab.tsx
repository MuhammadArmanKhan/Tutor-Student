import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../StatsCards';
import EngagementChart from '../EngagementChart';
import TutorPerformance from '../TutorPerformance';
import { Calendar, Clock, TrendingUp, Award, Video } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creatingDemo, setCreatingDemo] = React.useState(false);
  const [upcomingSessions, setUpcomingSessions] = React.useState<any[]>([]);
  const [recentAchievements, setRecentAchievements] = React.useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState(true);
  const [loadingAchievements, setLoadingAchievements] = React.useState(true);
  const [errorSessions, setErrorSessions] = React.useState<string | null>(null);
  const [errorAchievements, setErrorAchievements] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user) return;
      setLoadingSessions(true);
      setErrorSessions(null);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, title, subject, scheduled_at, duration_minutes, tutor:users!sessions_tutor_id_fkey(name)')
          .eq('student_id', user.id)
          .in('status', ['scheduled', 'in_progress'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(3);
        if (error) throw error;
        setUpcomingSessions(data || []);
      } catch (err) {
        setErrorSessions('Failed to load upcoming sessions');
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchUpcomingSessions();
  }, [user]);

  React.useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      setLoadingAchievements(true);
      setErrorAchievements(null);
      try {
        const { data, error } = await supabase
          .from('learning_milestones')
          .select('id, milestone_name, description, status, completion_percentage, subject')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (error) throw error;
        setRecentAchievements(data || []);
      } catch (err) {
        setErrorAchievements('Failed to load achievements');
      } finally {
        setLoadingAchievements(false);
      }
    };
    fetchAchievements();
  }, [user]);

  // Helper to create a session in Supabase (shared with tutor logic)
  const createSession = async (tutorId: string, studentId: string, subject: string, duration: number = 30) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          tutor_id: tutorId,
          student_id: studentId,
          title: subject + ' Demo Session',
          subject: subject,
          scheduled_at: new Date().toISOString(),
          duration_minutes: duration,
          status: 'in_progress',
          notes: 'This is a demo session.'
        },
      ])
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  };

  const joinDemoSession = async () => {
    if (!user) {
      toast.error('You must be logged in as a student to start a demo session.');
      return;
    }
    setCreatingDemo(true);
    try {
      // Find a demo tutor (or use a fixed demo tutor ID)
      const { data: tutorData, error: tutorError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'tutor')
        .single();
      if (tutorError || !tutorData) {
        toast.error('No demo tutor found.');
        return;
      }
      // Create the session using shared logic
      const sessionId = await createSession(tutorData.id, user.id, 'Mathematics', 30);
      navigate(`/session/${sessionId}`);
    } catch (err) {
      toast.error('Could not start demo session.');
    } finally {
      setCreatingDemo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500/10 to-accent-emerald/10 rounded-2xl p-6 border border-primary-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Alex!</h2>
            <p className="text-gray-400">
              You have 2 upcoming sessions today. Keep up the great work!
            </p>
          </div>
          <motion.button
            onClick={joinDemoSession}
            disabled={creatingDemo}
            className="bg-gradient-to-r from-primary-500 to-accent-emerald text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 w-full md:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {creatingDemo ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Video className="h-5 w-5" />
            )}
            <span>{creatingDemo ? 'Creating Demo...' : 'Join Demo Session'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Sessions
          </h3>
          {loadingSessions ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading upcoming sessions...</p>
            </div>
          ) : errorSessions ? (
            <div className="text-center py-8 text-red-400">
              {errorSessions}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{session.title}</h4>
                      <p className="text-gray-400 text-sm">{session.tutor.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-500 font-medium">{new Date(session.scheduled_at).toDateString()}</div>
                      <div className="text-gray-400 text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(session.scheduled_at).toLocaleTimeString()} • {session.duration_minutes} min
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                      {session.subject}
                    </span>
                    <motion.button
                      onClick={joinDemoSession}
                      disabled={creatingDemo}
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium px-3 py-1 rounded-lg hover:bg-primary-500/10 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      {creatingDemo ? (
                        <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Join Session'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <motion.button
            className="w-full mt-4 bg-primary-500/20 text-primary-400 py-3 px-4 rounded-xl hover:bg-primary-500/30 transition-colors duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Sessions
          </motion.button>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Recent Achievements
          </h3>
          {loadingAchievements ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading achievements...</p>
            </div>
          ) : errorAchievements ? (
            <div className="text-center py-8 text-red-400">
              {errorAchievements}
            </div>
          ) : (
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className={`p-3 rounded-xl ${achievement.status === 'completed' ? 'bg-accent-emerald/10' : 'bg-primary-500/10'}`}>
                    <Award className={`h-6 w-6 ${achievement.status === 'completed' ? 'text-accent-emerald' : 'text-primary-500'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{achievement.milestone_name}</h4>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Demo Session Button */}
          <motion.button
            onClick={joinDemoSession}
            disabled={creatingDemo}
            className="w-full mt-6 bg-gradient-to-r from-accent-emerald/20 to-primary-500/20 text-white py-3 px-4 rounded-xl hover:from-accent-emerald/30 hover:to-primary-500/30 transition-all duration-200 font-medium border border-accent-emerald/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {creatingDemo ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              '🎯 Try Demo Session Recording'
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart />
        <TutorPerformance />
      </div>
    </div>
  );
};

export default OverviewTab;