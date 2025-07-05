import { supabase } from '../lib/supabase';

const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
console.log('[AssemblyAI] Loaded API Key:', ASSEMBLYAI_API_KEY);
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

export interface TranscriptionResult {
  id: string;
  text: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: string;
  }>;
  utterances: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker: string;
  }>;
  sentiment_analysis_results?: Array<{
    text: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    confidence: number;
    start: number;
    end: number;
  }>;
  auto_highlights_result?: Array<{
    text: string;
    count: number;
    rank: number;
    timestamps: Array<{ start: number; end: number }>;
  }>;
}

export class TranscriptionService {
  private async uploadAudio(audioUrl: string): Promise<string> {
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error('AssemblyAI API key not configured');
    }

    // If audioUrl is a public URL, this works. If not, fetch the file server-side or use a signed URL from Supabase Storage.
    const audioBlob = await fetch(audioUrl).then(r => r.blob());

    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        // 'Content-Type' is NOT needed for fetch with blob
      },
      body: audioBlob
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Upload failed: ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.upload_url;
  }

  async transcribeSession(sessionId: string, recordingUrl: string): Promise<TranscriptionResult | null> {
    console.log('[AssemblyAI] Using API Key:', ASSEMBLYAI_API_KEY);
    console.log('[AssemblyAI] Recording URL:', recordingUrl);
    try {
      if (!ASSEMBLYAI_API_KEY) {
        console.warn('AssemblyAI API key not configured, using mock transcription');
        return this.getMockTranscription();
      }

      // Upload audio file
      const uploadUrl = await this.uploadAudio(recordingUrl);

      // Start transcription with speaker diarization and sentiment analysis
      const transcriptResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: uploadUrl,
          speaker_labels: true,
          speakers_expected: 2,
          sentiment_analysis: true,
          auto_highlights: true,
          entity_detection: true,
          iab_categories: true,
          language_detection: true
        })
      });

      if (!transcriptResponse.ok) {
        const errorBody = await transcriptResponse.text();
        throw new Error(`Transcription request failed: ${transcriptResponse.statusText} - ${errorBody}`);
      }

      const transcript = await transcriptResponse.json();
      const transcriptId = transcript.id;

      // Poll for completion
      let result;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      do {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
          headers: {
            'Authorization': ASSEMBLYAI_API_KEY
          }
        });
        
        if (!statusResponse.ok) {
          const errorBody = await statusResponse.text();
          throw new Error(`Status check failed: ${statusResponse.statusText} - ${errorBody}`);
        }
        
        result = await statusResponse.json();
        attempts++;
      } while ((result.status === 'processing' || result.status === 'queued') && attempts < maxAttempts);

      if (result.status === 'completed') {
        // Save transcription to database
        await supabase
          .from('session_recordings')
          .update({
            transcript: result.text,
            speaker_labels: result.utterances || [],
            ai_insights: {
              sentiment_analysis: result.sentiment_analysis_results || [],
              auto_highlights: result.auto_highlights_result || [],
              entities: result.entities || [],
              iab_categories: result.iab_categories_result || {},
              confidence: result.confidence || 0
            },
            processing_status: 'completed'
          })
          .eq('session_id', sessionId);

        return result;
      } else {
        throw new Error(`Transcription failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Update processing status to failed
      await supabase
        .from('session_recordings')
        .update({ processing_status: 'failed' })
        .eq('session_id', sessionId);

      // Return mock transcription as fallback
      return this.getMockTranscription();
    }
  }

  private getMockTranscription(): TranscriptionResult {
    return {
      id: 'mock-transcription',
      text: 'This is a mock transcription for demonstration purposes. The tutor explained the concept clearly and the student asked thoughtful questions.',
      words: [],
      utterances: [
        {
          text: 'Welcome to today\'s session. Let\'s start with reviewing the homework.',
          start: 0,
          end: 3000,
          confidence: 0.95,
          speaker: 'A'
        },
        {
          text: 'I had some trouble with problem number 5. Could you help me understand it?',
          start: 3500,
          end: 7000,
          confidence: 0.92,
          speaker: 'B'
        },
        {
          text: 'Of course! Let me walk you through the solution step by step.',
          start: 7500,
          end: 10000,
          confidence: 0.94,
          speaker: 'A'
        }
      ],
      sentiment_analysis_results: [
        {
          text: 'Welcome to today\'s session',
          sentiment: 'POSITIVE',
          confidence: 0.8,
          start: 0,
          end: 3000
        }
      ],
      auto_highlights_result: [
        {
          text: 'homework review',
          count: 3,
          rank: 1,
          timestamps: [{ start: 0, end: 3000 }]
        }
      ]
    };
  }

  generateEngagementScore(transcriptionResult: TranscriptionResult): number {
    if (!transcriptionResult.utterances || transcriptionResult.utterances.length === 0) {
      return 75; // Default score for mock data
    }

    const totalUtterances = transcriptionResult.utterances.length;
    const studentUtterances = transcriptionResult.utterances.filter(u => u.speaker === 'B').length;
    const tutorUtterances = transcriptionResult.utterances.filter(u => u.speaker === 'A').length;

    // Calculate engagement based on student participation ratio
    const participationRatio = totalUtterances > 0 ? studentUtterances / totalUtterances : 0;
    
    // Calculate sentiment score
    const sentimentScore = transcriptionResult.sentiment_analysis_results?.reduce((acc, sentiment) => {
      const weight = sentiment.sentiment === 'POSITIVE' ? 1 : sentiment.sentiment === 'NEGATIVE' ? -1 : 0;
      return acc + (weight * sentiment.confidence);
    }, 0) || 0;

    // Calculate confidence score
    const avgConfidence = transcriptionResult.utterances.reduce((acc, utterance) => 
      acc + utterance.confidence, 0) / totalUtterances;

    // Combine metrics (0-100 scale)
    const baseScore = Math.min(participationRatio * 100, 80); // Cap participation at 80%
    const sentimentBonus = Math.max(sentimentScore * 15, -15); // Sentiment can add/subtract up to 15 points
    const confidenceBonus = avgConfidence * 10; // Confidence adds up to 10 points
    
    const finalScore = Math.max(0, Math.min(100, baseScore + sentimentBonus + confidenceBonus));
    
    return Math.round(finalScore);
  }

  async analyzeEngagement(sessionId: string): Promise<any> {
    try {
      const { data: recording, error } = await supabase
        .from('session_recordings')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !recording) {
        return null;
      }

      const engagementScore = this.generateEngagementScore({
        id: recording.id,
        text: recording.transcript,
        words: [],
        utterances: recording.speaker_labels || [],
        sentiment_analysis_results: recording.ai_insights?.sentiment_analysis || []
      });

      // Update session with engagement score
      await supabase
        .from('sessions')
        .update({ engagement_score: engagementScore })
        .eq('id', sessionId);

      return {
        engagement_score: engagementScore,
        insights: recording.ai_insights,
        transcript_length: recording.transcript?.length || 0,
        speaker_count: recording.speaker_labels?.length || 0
      };
    } catch (error) {
      console.error('Engagement analysis error:', error);
      return null;
    }
  }
}