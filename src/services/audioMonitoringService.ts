export interface AudioMetrics {
  timestamp: number;
  volume: number;
  isSpeaking: boolean;
  speaker: 'tutor' | 'student';
  frequency?: number;
}

export interface EngagementMetrics {
  timestamp: number;
  attentionLevel: number;
  interactionType: 'question' | 'response' | 'silence' | 'discussion';
  duration: number;
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  audioMetrics: AudioMetrics[];
  engagementMetrics: EngagementMetrics[];
  speakingRatios: {
    tutor: number;
    student: number;
  };
  totalInteractions: number;
  averageAttention: number;
  questionCount: number;
}

export class AudioMonitoringService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isMonitoring = false;
  private sessionAnalytics: SessionAnalytics | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private volumeThreshold = 30;
  private silenceTimeout = 2000; // 2 seconds
  private lastSpeakingTime = 0;
  private currentSpeaker: 'tutor' | 'student' | null = null;

  async startMonitoring(sessionId: string): Promise<boolean> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);

      // Configure analyser
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Connect nodes
      this.microphone.connect(this.analyser);

      // Initialize session analytics
      this.sessionAnalytics = {
        sessionId,
        startTime: Date.now(),
        audioMetrics: [],
        engagementMetrics: [],
        speakingRatios: { tutor: 0, student: 0 },
        totalInteractions: 0,
        averageAttention: 0,
        questionCount: 0
      };

      this.isMonitoring = true;
      this.startAnalysis();

      return true;
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
      return false;
    }
  }

  private startAnalysis(): void {
    if (!this.isMonitoring || !this.analyser || !this.dataArray) return;

    this.monitoringInterval = setInterval(() => {
      this.analyseAudio();
    }, 100); // Analyze every 100ms
  }

  private analyseAudio(): void {
    if (!this.analyser || !this.dataArray || !this.sessionAnalytics) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate volume level
    const volume = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    const isSpeaking = volume > this.volumeThreshold;
    const timestamp = Date.now();

    // Detect speaker changes and speaking patterns
    if (isSpeaking) {
      if (timestamp - this.lastSpeakingTime > this.silenceTimeout) {
        // New speaking session started
        this.sessionAnalytics.totalInteractions++;
        
        // Simple heuristic: alternate between tutor and student
        // In a real implementation, you'd use voice recognition
        this.currentSpeaker = this.currentSpeaker === 'tutor' ? 'student' : 'tutor';
      }
      this.lastSpeakingTime = timestamp;
    }

    // Store audio metrics
    const audioMetric: AudioMetrics = {
      timestamp,
      volume,
      isSpeaking,
      speaker: this.currentSpeaker || 'tutor',
      frequency: this.calculateDominantFrequency()
    };

    this.sessionAnalytics.audioMetrics.push(audioMetric);

    // Generate engagement metrics
    const engagementMetric: EngagementMetrics = {
      timestamp,
      attentionLevel: this.calculateAttentionLevel(volume, isSpeaking),
      interactionType: this.determineInteractionType(volume, isSpeaking),
      duration: 100 // 100ms interval
    };

    this.sessionAnalytics.engagementMetrics.push(engagementMetric);

    // Update speaking ratios
    if (isSpeaking && this.currentSpeaker) {
      this.sessionAnalytics.speakingRatios[this.currentSpeaker] += 0.1; // 100ms = 0.1 seconds
    }

    // Keep only last 10 minutes of data to prevent memory issues
    const tenMinutesAgo = timestamp - (10 * 60 * 1000);
    this.sessionAnalytics.audioMetrics = this.sessionAnalytics.audioMetrics.filter(
      metric => metric.timestamp > tenMinutesAgo
    );
    this.sessionAnalytics.engagementMetrics = this.sessionAnalytics.engagementMetrics.filter(
      metric => metric.timestamp > tenMinutesAgo
    );
  }

  private calculateDominantFrequency(): number {
    if (!this.dataArray) return 0;
    
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    return (maxIndex / this.dataArray.length) * nyquist;
  }

  private calculateAttentionLevel(volume: number, isSpeaking: boolean): number {
    // Simple attention calculation based on audio activity
    let attention = 50; // Base attention level
    
    if (isSpeaking) {
      attention += Math.min(volume / 2, 30); // Speaking increases attention
    } else {
      attention -= 10; // Silence decreases attention
    }
    
    return Math.max(0, Math.min(100, attention));
  }

  private determineInteractionType(volume: number, isSpeaking: boolean): 'question' | 'response' | 'silence' | 'discussion' {
    if (!isSpeaking) return 'silence';
    
    // Simple heuristics - in real implementation, use NLP
    if (volume > 80) return 'question'; // Louder speech might indicate questions
    if (volume > 50) return 'discussion';
    return 'response';
  }

  getCurrentMetrics(): {
    currentVolume: number;
    isSpeaking: boolean;
    currentSpeaker: string;
    sessionDuration: number;
    totalInteractions: number;
  } {
    if (!this.sessionAnalytics) {
      return {
        currentVolume: 0,
        isSpeaking: false,
        currentSpeaker: 'none',
        sessionDuration: 0,
        totalInteractions: 0
      };
    }

    const latestMetric = this.sessionAnalytics.audioMetrics[this.sessionAnalytics.audioMetrics.length - 1];
    const sessionDuration = Date.now() - this.sessionAnalytics.startTime;

    return {
      currentVolume: latestMetric?.volume || 0,
      isSpeaking: latestMetric?.isSpeaking || false,
      currentSpeaker: this.currentSpeaker || 'none',
      sessionDuration,
      totalInteractions: this.sessionAnalytics.totalInteractions
    };
  }

  getSessionAnalytics(): SessionAnalytics | null {
    return this.sessionAnalytics;
  }

  async stopMonitoring(): Promise<SessionAnalytics | null> {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    if (this.sessionAnalytics) {
      this.sessionAnalytics.endTime = Date.now();
      
      // Calculate final metrics
      const totalSpeakingTime = this.sessionAnalytics.speakingRatios.tutor + this.sessionAnalytics.speakingRatios.student;
      if (totalSpeakingTime > 0) {
        this.sessionAnalytics.speakingRatios.tutor = (this.sessionAnalytics.speakingRatios.tutor / totalSpeakingTime) * 100;
        this.sessionAnalytics.speakingRatios.student = (this.sessionAnalytics.speakingRatios.student / totalSpeakingTime) * 100;
      }

      // Calculate average attention
      if (this.sessionAnalytics.engagementMetrics.length > 0) {
        this.sessionAnalytics.averageAttention = this.sessionAnalytics.engagementMetrics.reduce(
          (sum, metric) => sum + metric.attentionLevel, 0
        ) / this.sessionAnalytics.engagementMetrics.length;
      }

      // Count questions (simplified)
      this.sessionAnalytics.questionCount = this.sessionAnalytics.engagementMetrics.filter(
        metric => metric.interactionType === 'question'
      ).length;
    }

    return this.sessionAnalytics;
  }
}