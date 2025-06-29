import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Pause, Download, FileText, Clock, Video, Mic, MicOff } from 'lucide-react';
import { RecordingService } from '../../services/recordingService';
import { TranscriptionService } from '../../services/transcriptionService';
import { ReportService } from '../../services/reportService';
import toast from 'react-hot-toast';

interface SessionRecorderProps {
  sessionId: string;
  onRecordingComplete?: (recordingUrl: string) => void;
}

const SessionRecorder: React.FC<SessionRecorderProps> = ({ sessionId, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingService] = useState(new RecordingService());
  const [transcriptionService] = useState(new TranscriptionService());
  const [reportService] = useState(new ReportService());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(recordingService.getRecordingTime());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, recordingService]);

  const startRecording = async () => {
    try {
      // Check for required permissions first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast.error('Screen recording is not supported in this browser');
        return;
      }

      const success = await recordingService.startRecording(sessionId);
      if (success) {
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        toast.success('Recording started successfully!');
      } else {
        toast.error('Failed to start recording. Please check your permissions.');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check your permissions.');
    }
  };

  const pauseRecording = () => {
    try {
      recordingService.pauseRecording();
      setIsPaused(true);
      toast.success('Recording paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
      toast.error('Failed to pause recording');
    }
  };

  const resumeRecording = () => {
    try {
      recordingService.resumeRecording();
      setIsPaused(false);
      toast.success('Recording resumed');
    } catch (error) {
      console.error('Failed to resume recording:', error);
      toast.error('Failed to resume recording');
    }
  };

  const stopRecording = async () => {
    setIsProcessing(true);
    
    try {
      const recordingUrl = await recordingService.stopRecording();
      
      if (recordingUrl) {
        setIsRecording(false);
        setIsPaused(false);
        
        // Start transcription process
        const loadingToast = toast.loading('Processing recording and generating insights...', { duration: 30000 });
        
        try {
          const transcriptionResult = await transcriptionService.transcribeSession(sessionId, recordingUrl);
          
          if (transcriptionResult) {
            // Generate engagement score
            const engagementScore = transcriptionService.generateEngagementScore(transcriptionResult);
            
            // Analyze engagement
            await transcriptionService.analyzeEngagement(sessionId);
            
            // Generate PDF report
            const reportUrl = await reportService.generateSessionReport(sessionId);
            
            toast.dismiss(loadingToast);
            
            if (reportUrl) {
              toast.success('Session completed! Report generated successfully.');
              onRecordingComplete?.(recordingUrl);
            } else {
              toast.success('Session completed! Transcription ready.');
              onRecordingComplete?.(recordingUrl);
            }
          } else {
            toast.dismiss(loadingToast);
            toast.success('Session completed! Recording saved.');
            onRecordingComplete?.(recordingUrl);
          }
        } catch (processingError) {
          toast.dismiss(loadingToast);
          console.error('Post-processing error:', processingError);
          toast.success('Session completed! Recording saved. Processing will continue in background.');
          onRecordingComplete?.(recordingUrl);
        }
      } else {
        toast.error('Failed to save recording');
      }
    } catch (error) {
      console.error('Recording processing error:', error);
      toast.error('Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Session Recording</h3>
        {isRecording && (
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isPaused ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isPaused ? 'text-yellow-400' : 'text-red-400'}`}>
              {isPaused ? 'PAUSED' : 'LIVE'}
            </span>
          </div>
        )}
      </div>

      <div className="text-center space-y-6">
        {/* Recording Timer */}
        <div className="flex items-center justify-center space-x-2 text-3xl font-mono text-primary-500">
          <Clock className="h-8 w-8" />
          <span>{formatTime(recordingTime)}</span>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !isProcessing && (
            <motion.button
              onClick={startRecording}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="h-6 w-6" />
              <span>Start Recording</span>
            </motion.button>
          )}

          {isRecording && !isPaused && (
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={pauseRecording}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </motion.button>
              
              <motion.button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </motion.button>
            </div>
          )}

          {isRecording && isPaused && (
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={resumeRecording}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="h-5 w-5" />
                <span>Resume</span>
              </motion.button>
              
              <motion.button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </motion.button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center space-x-2 text-primary-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span className="font-medium">Processing...</span>
            </div>
          )}
        </div>

        {/* Recording Instructions */}
        <div className="text-sm text-gray-400 max-w-md mx-auto">
          {!isRecording && !isProcessing && (
            <p>
              Click "Start Recording" to begin capturing your session. 
              Make sure to allow screen sharing and microphone permissions when prompted.
            </p>
          )}
          {isRecording && !isPaused && (
            <p>
              Recording in progress. Your screen and audio are being captured. 
              You can pause or stop the recording at any time.
            </p>
          )}
          {isRecording && isPaused && (
            <p>
              Recording is paused. Click "Resume" to continue or "Stop" to end the session.
            </p>
          )}
          {isProcessing && (
            <p>
              Processing your recording with AI transcription and generating insights. 
              This may take a few minutes depending on the session length.
            </p>
          )}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <Video className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">HD Recording</h4>
            <p className="text-xs text-gray-400">High-quality video and audio capture with screen sharing</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <FileText className="h-8 w-8 text-accent-emerald mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">AI Transcription</h4>
            <p className="text-xs text-gray-400">Automatic speech-to-text with speaker identification</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <Download className="h-8 w-8 text-accent-amber mx-auto mb-2" />
            <h4 className="font-medium text-white mb-1">Auto Reports</h4>
            <p className="text-xs text-gray-400">PDF reports with insights sent automatically</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionRecorder;