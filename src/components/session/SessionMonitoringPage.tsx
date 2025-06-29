import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Users, 
  Clock, 
  Activity, 
  MessageCircle,
  ExternalLink,
  Square,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { AudioMonitoringService } from '../../services/audioMonitoringService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SessionMonitoringPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    currentVolume: 0,
    isSpeaking: false,
    currentSpeaker: 'none',
    sessionDuration: 0,
    totalInteractions: 0
  });
  const [sessionData, setSessionData] = useState<any>(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [topicsCovered, setTopicsCovered] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  const audioService = useRef(new AudioMonitoringService());
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }

    return () => {
      if (metricsInterval.current) {
        clearInterval(metricsInterval.current);
      }
      audioService.current.stopMonitoring();
    };
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      // For demo purposes, create mock session data
      const mockSession = {
        id: sessionId,
        title: 'Advanced Mathematics Session',
        subject: 'Mathematics',
        student_name: 'Alex Johnson',
        tutor_name: 'Dr. Sarah Wilson',
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        meeting_url: 'https://zoom.us/j/123456789'
      };
      
      setSessionData(mockSession);
      setMeetingUrl(mockSession.meeting_url);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session data');
    }
  };

  const startMonitoring = async () => {
    if (!sessionId) return;

    const success = await audioService.current.startMonitoring(sessionId);
    if (success) {
      setIsMonitoring(true);
      toast.success('Audio monitoring started');
      
      // Start metrics updates
      metricsInterval.current = setInterval(() => {
        const metrics = audioService.current.getCurrentMetrics();
        setCurrentMetrics(metrics);
      }, 500);

      // Update session status
      await supabase
        .from('sessions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } else {
      toast.error('Failed to start monitoring. Please allow microphone access.');
    }
  };

  const stopMonitoring = async () => {
    const analytics = await audioService.current.stopMonitoring();
    setIsMonitoring(false);
    
    if (metricsInterval.current) {
      clearInterval(metricsInterval.current);
      metricsInterval.current = null;
    }

    if (analytics && sessionId) {
      // Save analytics to database
      try {
        await supabase
          .from('session_analytics')
          .insert({
            session_id: sessionId,
            audio_metrics: analytics.audioMetrics,
            engagement_metrics: analytics.engagementMetrics,
            speaking_ratios: analytics.speakingRatios,
            total_interactions: analytics.totalInteractions,
            average_attention: analytics.averageAttention,
            question_count: analytics.questionCount,
            topics_covered: topicsCovered,
            notes: quickNotes,
            created_at: new Date().toISOString()
          });

        // Update session status
        await supabase
          .from('sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            engagement_score: Math.round(analytics.averageAttention),
            notes: quickNotes
          })
          .eq('id', sessionId);

        toast.success('Session completed and analytics saved');
        navigate('/tutor-dashboard');
      } catch (error) {
        console.error('Error saving analytics:', error);
        toast.error('Failed to save session analytics');
      }
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !topicsCovered.includes(newTopic.trim())) {
      setTopicsCovered([...topicsCovered, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setTopicsCovered(topicsCovered.filter(t => t !== topic));
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500/10 to-accent-emerald/10 rounded-2xl p-6 border border-primary-500/20"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{sessionData.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                <span>Student: {sessionData.student_name}</span>
                <span>•</span>
                <span>Subject: {sessionData.subject}</span>
                <span>•</span>
                <span>Duration: {sessionData.duration_minutes} min</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isMonitoring ? (
                <motion.button
                  onClick={startMonitoring}
                  className="bg-gradient-to-r from-accent-emerald to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-5 w-5" />
                  <span>Start Monitoring</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={stopMonitoring}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="h-5 w-5" />
                  <span>End Session</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-primary-500" />
              </div>
              <span className="text-2xl font-bold text-primary-500">
                {formatDuration(currentMetrics.sessionDuration)}
              </span>
            </div>
            <h3 className="text-white font-semibold">Session Duration</h3>
            <p className="text-gray-400 text-sm">
              {isMonitoring ? 'Live monitoring active' : 'Not monitoring'}
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
                {currentMetrics.isSpeaking ? (
                  <Mic className="h-6 w-6 text-accent-emerald" />
                ) : (
                  <MicOff className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-emerald">
                  {Math.round(currentMetrics.currentVolume)}
                </div>
                <div className="text-xs text-gray-400">Volume</div>
              </div>
            </div>
            <h3 className="text-white font-semibold">Audio Level</h3>
            <p className="text-gray-400 text-sm">
              {currentMetrics.isSpeaking ? 'Speaking detected' : 'Silence'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-amber/10 rounded-xl">
                <Users className="h-6 w-6 text-accent-amber" />
              </div>
              <span className="text-2xl font-bold text-accent-amber">
                {currentMetrics.totalInteractions}
              </span>
            </div>
            <h3 className="text-white font-semibold">Interactions</h3>
            <p className="text-gray-400 text-sm">
              Current speaker: {currentMetrics.currentSpeaker}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">
                {isMonitoring ? 'LIVE' : 'IDLE'}
              </span>
            </div>
            <h3 className="text-white font-semibold">Status</h3>
            <p className="text-gray-400 text-sm">
              {isMonitoring ? 'Monitoring active' : 'Ready to start'}
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meeting Link & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Meeting & Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    placeholder="https://zoom.us/j/..."
                  />
                  <motion.a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick Notes
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Add quick notes during the session..."
                />
              </div>
            </div>
          </motion.div>

          {/* Topics Covered */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Topics Covered</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  placeholder="Add topic..."
                />
                <motion.button
                  onClick={addTopic}
                  className="px-4 py-3 bg-accent-emerald text-white rounded-xl hover:bg-accent-emerald/80 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add
                </motion.button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {topicsCovered.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <span className="text-white text-sm">{topic}</span>
                    <button
                      onClick={() => removeTopic(topic)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
                {topicsCovered.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No topics added yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Audio Visualization */}
        {isMonitoring && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Audio Visualization</h3>
            
            <div className="flex items-center justify-center space-x-2 h-32">
              {Array.from({ length: 20 }, (_, i) => (
                <motion.div
                  key={i}
                  className="bg-gradient-to-t from-primary-500 to-accent-emerald rounded-full w-4"
                  animate={{
                    height: currentMetrics.isSpeaking 
                      ? Math.random() * 80 + 20 
                      : Math.random() * 20 + 5
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-gray-400">
                {currentMetrics.isSpeaking ? 'Audio detected' : 'Listening...'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionMonitoringPage;