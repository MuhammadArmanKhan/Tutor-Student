import RecordRTC from 'recordrtc';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export class RecordingService {
  private recorder: RecordRTC | null = null;
  private stream: MediaStream | null = null;
  private sessionId: string | null = null;
  private startTime: number = 0;

  async startRecording(sessionId: string): Promise<boolean> {
    try {
      this.sessionId = sessionId;
      this.startTime = Date.now();
      
      // Request screen + audio permissions
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      // Request microphone permission
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Combine streams
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      this.stream = combinedStream;

      // Initialize RecordRTC
      this.recorder = new RecordRTC(combinedStream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9,opus',
        recorderType: RecordRTC.MediaStreamRecorder,
        video: {
          width: 1920,
          height: 1080
        },
        audio: {
          sampleRate: 44100,
          channelCount: 2
        },
        timeSlice: 1000,
        ondataavailable: (blob: Blob) => {
          // Handle real-time data if needed
          console.log('Recording chunk available:', blob.size);
        }
      });

      this.recorder.startRecording();
      
      // Update session status
      await supabase
        .from('sessions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      toast.success('Recording started successfully!');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check permissions.');
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recorder || !this.sessionId) {
      toast.error('No active recording found');
      return null;
    }

    return new Promise((resolve) => {
      this.recorder!.stopRecording(async () => {
        try {
          const blob = this.recorder!.getBlob();
          const duration = Date.now() - this.startTime;
          
          // Upload to Supabase Storage
          const fileName = `session-${this.sessionId}-${Date.now()}.webm`;
          const { data, error } = await supabase.storage
            .from('session-recordings')
            .upload(fileName, blob, {
              contentType: 'video/webm',
              upsert: false
            });

          if (error) throw error;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('session-recordings')
            .getPublicUrl(fileName);

          // Save recording metadata
          const { error: dbError } = await supabase
            .from('session_recordings')
            .insert({
              session_id: this.sessionId,
              video_url: urlData.publicUrl,
              file_size: blob.size,
              duration_seconds: Math.floor(duration / 1000),
              processing_status: 'pending',
              created_at: new Date().toISOString()
            });

          if (dbError) throw dbError;

          // Update session status
          await supabase
            .from('sessions')
            .update({ 
              status: 'completed',
              recording_url: urlData.publicUrl,
              completed_at: new Date().toISOString()
            })
            .eq('id', this.sessionId);

          // Stop all tracks
          this.stream?.getTracks().forEach(track => track.stop());
          
          // Reset state
          this.recorder = null;
          this.stream = null;
          this.sessionId = null;
          this.startTime = 0;
          
          toast.success('Recording saved successfully!');
          resolve(urlData.publicUrl);
        } catch (error) {
          console.error('Failed to save recording:', error);
          toast.error('Failed to save recording');
          resolve(null);
        }
      });
    });
  }

  pauseRecording(): void {
    if (this.recorder && this.recorder.getState() === 'recording') {
      this.recorder.pauseRecording();
    }
  }

  resumeRecording(): void {
    if (this.recorder && this.recorder.getState() === 'paused') {
      this.recorder.resumeRecording();
    }
  }

  isRecording(): boolean {
    return this.recorder?.getState() === 'recording';
  }

  isPaused(): boolean {
    return this.recorder?.getState() === 'paused';
  }

  getRecordingTime(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  getRecordingState(): string {
    return this.recorder?.getState() || 'inactive';
  }
}