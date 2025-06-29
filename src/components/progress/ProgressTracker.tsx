import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Award, BookOpen, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Milestone {
  id: string;
  milestone_name: string;
  description: string;
  completion_percentage: number;
  status: string;
  target_date: string;
  completed_date?: string;
  subject: string;
}

interface ProgressData {
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  average_engagement: number;
  time_spent_minutes: number;
  active_participation_rate: number;
  learning_velocity: number;
  strengths: string[];
  areas_for_improvement: string[];
}

const ProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    try {
      // Load milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('learning_milestones')
        .select('*')
        .eq('student_id', user?.id)
        .order('target_date', { ascending: true });

      if (milestonesError) throw milestonesError;
      setMilestones(milestonesData || []);

      // Load progress tracking data
      const { data: progressTrackingData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('student_id', user?.id)
        .single();

      if (progressTrackingData) {
        setProgressData(progressTrackingData);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
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
      className="space-y-8"
    >
      {/* Progress Overview */}
      {progressData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-primary-500">
                {Math.round(progressData.completion_rate)}%
              </span>
            </div>
            <h3 className="text-white font-semibold">Completion Rate</h3>
            <p className="text-gray-400 text-sm">
              {progressData.completed_sessions} of {progressData.total_sessions} sessions
            </p>
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
              <span className="text-2xl font-bold text-accent-emerald">
                {Math.round(progressData.average_engagement)}%
              </span>
            </div>
            <h3 className="text-white font-semibold">Avg Engagement</h3>
            <p className="text-gray-400 text-sm">Across all sessions</p>
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
              <span className="text-2xl font-bold text-accent-amber">
                {Math.round(progressData.time_spent_minutes / 60)}h
              </span>
            </div>
            <h3 className="text-white font-semibold">Time Spent</h3>
            <p className="text-gray-400 text-sm">Total learning time</p>
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
              <span className="text-2xl font-bold text-purple-400">
                {Math.round(progressData.active_participation_rate)}%
              </span>
            </div>
            <h3 className="text-white font-semibold">Participation</h3>
            <p className="text-gray-400 text-sm">Active engagement rate</p>
          </motion.div>
        </div>
      )}

      {/* Learning Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Learning Milestones
          </h3>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    milestone.status === 'completed' ? 'bg-accent-emerald/20' :
                    milestone.status === 'in_progress' ? 'bg-accent-amber/20' :
                    'bg-gray-500/20'
                  }`}>
                    <BookOpen className={`h-4 w-4 ${
                      milestone.status === 'completed' ? 'text-accent-emerald' :
                      milestone.status === 'in_progress' ? 'text-accent-amber' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{milestone.milestone_name}</h4>
                    <p className="text-gray-400 text-sm">{milestone.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    milestone.status === 'completed' ? 'text-accent-emerald' :
                    milestone.status === 'in_progress' ? 'text-accent-amber' :
                    'text-gray-400'
                  }`}>
                    {milestone.completion_percentage}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {milestone.status === 'completed' && milestone.completed_date
                      ? `Completed ${new Date(milestone.completed_date).toLocaleDateString()}`
                      : `Due ${new Date(milestone.target_date).toLocaleDateString()}`
                    }
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    milestone.status === 'completed' ? 'bg-accent-emerald' :
                    milestone.status === 'in_progress' ? 'bg-accent-amber' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${milestone.completion_percentage}%` }}
                ></div>
              </div>

              {milestone.description && (
                <p className="text-gray-400 text-sm mt-2">{milestone.description}</p>
              )}
            </motion.div>
          ))}

          {milestones.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Milestones Yet</h3>
              <p className="text-gray-400">Your tutor will set learning milestones to track your progress.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Strengths and Areas for Improvement */}
      {progressData && (progressData.strengths.length > 0 || progressData.areas_for_improvement.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-accent-emerald" />
              Strengths
            </h3>
            <div className="space-y-2">
              {progressData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-emerald rounded-full"></div>
                  <span className="text-gray-300">{strength}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-accent-amber" />
              Areas for Improvement
            </h3>
            <div className="space-y-2">
              {progressData.areas_for_improvement.map((area, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-gray-300">{area}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;