import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Video, Music, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface DownloadManagerProps {
  sessionId: string;
  sessionTitle: string;
}

interface DownloadableFile {
  type: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  available: boolean;
  url?: string;
  size?: string;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ sessionId, sessionTitle }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableFiles();
  }, [sessionId]);

  const loadAvailableFiles = async () => {
    try {
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('recording_url')
        .eq('id', sessionId)
        .single();

      // Get recording data
      const { data: recording, error: recordingError } = await supabase
        .from('session_recordings')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      // Get report data
      const { data: report, error: reportError } = await supabase
        .from('session_reports')
        .select('pdf_url')
        .eq('session_id', sessionId)
        .single();

      const availableFiles: DownloadableFile[] = [
        {
          type: 'recording',
          label: 'Video Recording',
          description: 'Full session video with screen capture',
          icon: Video,
          color: 'text-primary-500',
          available: !!(session?.recording_url),
          url: session?.recording_url,
          size: recording?.file_size ? formatFileSize(recording.file_size) : undefined
        },
        {
          type: 'audio',
          label: 'Audio Only',
          description: 'Audio track for offline listening',
          icon: Music,
          color: 'text-accent-emerald',
          available: !!(recording?.audio_url),
          url: recording?.audio_url
        },
        {
          type: 'transcript',
          label: 'Transcript',
          description: 'AI-generated text with speaker labels',
          icon: FileText,
          color: 'text-accent-amber',
          available: !!(recording?.transcript),
          url: null // Generated on demand
        },
        {
          type: 'report',
          label: 'PDF Report',
          description: 'Detailed analytics and insights',
          icon: FileText,
          color: 'text-purple-400',
          available: !!(report?.pdf_url),
          url: report?.pdf_url
        }
      ];

      setFiles(availableFiles);
    } catch (error) {
      console.error('Error loading available files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (url: string, filename: string, type: string) => {
    setDownloading(type);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`${type} downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${type.toLowerCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  const downloadRecording = async () => {
    const file = files.find(f => f.type === 'recording');
    if (!file?.url) {
      toast.error('Recording not available');
      return;
    }

    const filename = `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}_recording.webm`;
    await downloadFile(file.url, filename, 'Recording');
  };

  const downloadAudio = async () => {
    const file = files.find(f => f.type === 'audio');
    if (!file?.url) {
      toast.error('Audio not available');
      return;
    }

    const filename = `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}_audio.mp3`;
    await downloadFile(file.url, filename, 'Audio');
  };

  const downloadTranscript = async () => {
    try {
      const { data: recording, error } = await supabase
        .from('session_recordings')
        .select('transcript, speaker_labels')
        .eq('session_id', sessionId)
        .single();

      if (error || !recording?.transcript) {
        toast.error('Transcript not available');
        return;
      }

      // Format transcript with speaker labels
      let formattedTranscript = `Session Transcript: ${sessionTitle}\n`;
      formattedTranscript += `Generated on: ${new Date().toLocaleString()}\n\n`;
      formattedTranscript += '--- TRANSCRIPT ---\n\n';

      if (recording.speaker_labels && recording.speaker_labels.length > 0) {
        recording.speaker_labels.forEach((utterance: any) => {
          const speaker = utterance.speaker === 'A' ? 'Tutor' : 'Student';
          formattedTranscript += `[${speaker}]: ${utterance.text}\n\n`;
        });
      } else {
        formattedTranscript += recording.transcript;
      }

      const blob = new Blob([formattedTranscript], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const filename = `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success('Transcript downloaded successfully!');
    } catch (error) {
      console.error('Transcript download error:', error);
      toast.error('Failed to download transcript');
    }
  };

  const downloadReport = async () => {
    const file = files.find(f => f.type === 'report');
    if (!file?.url) {
      toast.error('Report not available');
      return;
    }

    const filename = `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}_report.pdf`;
    await downloadFile(file.url, filename, 'Report');
  };

  const downloadActions = {
    recording: downloadRecording,
    audio: downloadAudio,
    transcript: downloadTranscript,
    report: downloadReport
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const availableFiles = files.filter(file => file.available);

  if (availableFiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
      >
        <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Files Available</h3>
        <p className="text-gray-400">Session files are still being processed. Please check back later.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Download className="h-5 w-5 mr-2" />
        Download Session Files
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableFiles.map((file, index) => (
          <motion.button
            key={file.type}
            onClick={() => downloadActions[file.type as keyof typeof downloadActions]()}
            disabled={downloading === file.type}
            className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-3 rounded-lg bg-white/5 ${file.color}`}>
              {downloading === file.type ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <file.icon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-white font-medium">{file.label}</h4>
                <CheckCircle className="h-4 w-4 text-accent-emerald" />
              </div>
              <p className="text-gray-400 text-sm">{file.description}</p>
              {file.size && (
                <p className="text-gray-500 text-xs mt-1">{file.size}</p>
              )}
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
        <p className="text-sm text-primary-400 mb-2">💡 Pro Tip</p>
        <p className="text-sm text-gray-300">
          Download all files for offline access and comprehensive review. 
          Transcripts are great for note-taking, while recordings help with concept reinforcement.
        </p>
      </div>
    </motion.div>
  );
};

export default DownloadManager;