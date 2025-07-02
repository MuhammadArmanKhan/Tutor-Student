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

      // Request microphone permission ONLY
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Use only the audio stream for recording
      this.stream = audioStream;

      this.recorder = new RecordRTC(audioStream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        sampleRate: 44100,
        numberOfAudioChannels: 1,
        timeSlice: 1000,
        ondataavailable: (blob: Blob) => {
          console.log('Recording chunk available:', blob.size);
        },
        onStateChanged: (state: string) => {
          console.log('Recording state changed:', state);
        }
      });

      this.recorder.startRecording();
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      this.recorder = null;
      this.sessionId = null;
      this.startTime = 0;
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recorder || !this.sessionId) {
      console.error('No active recording found');
      return null;
    }

    return new Promise((resolve) => {
      this.recorder!.stopRecording(async () => {
        try {
          const blob = this.recorder!.getBlob();
          const duration = Date.now() - this.startTime;
          if (blob.size === 0) {
            throw new Error('Recording is empty');
          }
          // Upload to Supabase Storage as .wav
          const fileName = `session-${this.sessionId}-${Date.now()}.wav`;
          const { data, error } = await supabase.storage
            .from('session-recordings')
            .upload(fileName, blob, {
              contentType: 'audio/wav',
              upsert: false
            });
          if (error) throw error;
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('session-recordings')
            .getPublicUrl(fileName);

          // Check if a recording already exists for this session
          const { data: existing } = await supabase
            .from('session_recordings')
            .select('id')
            .eq('session_id', this.sessionId)
            .single();

          let dbError;
          if (!existing) {
            // Insert new recording
            ({ error: dbError } = await supabase
              .from('session_recordings')
              .insert({
                session_id: this.sessionId,
                audio_url: urlData.publicUrl,
                file_size: blob.size,
                duration_seconds: Math.floor(duration / 1000),
                processing_status: 'pending',
                created_at: new Date().toISOString()
              }));
          } else {
            // Update existing recording
            ({ error: dbError } = await supabase
              .from('session_recordings')
              .update({
                audio_url: urlData.publicUrl,
                file_size: blob.size,
                duration_seconds: Math.floor(duration / 1000),
                processing_status: 'pending',
                created_at: new Date().toISOString()
              })
              .eq('id', existing.id));
          }
          if (dbError) throw dbError;

          // Stop all tracks
          this.stream?.getTracks().forEach(track => track.stop());
          // Reset state
          this.recorder = null;
          this.stream = null;
          this.sessionId = null;
          this.startTime = 0;
          resolve(urlData.publicUrl);
        } catch (error) {
          console.error('Failed to save recording:', error);
          toast.error(
            error?.message ||
            (typeof error === 'object' ? JSON.stringify(error) : String(error))
          );
          // Stop all tracks even on error
          this.stream?.getTracks().forEach(track => track.stop());
          // Reset state
          this.recorder = null;
          this.stream = null;
          this.sessionId = null;
          this.startTime = 0;
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