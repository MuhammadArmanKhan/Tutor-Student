import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nialsdvolkfczgiooxem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYWxzZHZvbGtmY3pnaW9veGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTQ3OTQsImV4cCI6MjA2Njc3MDc5NH0.mQbE3Oi3oEFAn8XsVWtvb-9TbmVY4eFnVUUGNsFX7BA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database Types - Updated to match actual schema
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'parent';
  profile_complete: boolean;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  certifications: string[];
  subjects: string[];
  bio: string;
  hourly_rate: number;
  experience_years: number;
  rating: number;
  total_sessions: number;
  availability?: any;
  timezone?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  parent_id?: string;
  grade_level: string;
  subjects_of_interest: string[];
  learning_goals: string[];
  age?: number;
  school?: string;
  emergency_contact?: any;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  subject: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recording_url?: string;
  transcript_url?: string;
  engagement_score?: number;
  notes?: string;
  meeting_url?: string;
  session_type?: 'regular' | 'trial' | 'makeup' | 'assessment';
  materials_shared?: any[];
  homework_assigned?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionRecording {
  id: string;
  session_id: string;
  video_url?: string;
  audio_url?: string;
  transcript: string;
  speaker_labels: any[];
  ai_insights: any;
  file_size: number;
  duration_seconds: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail_url?: string;
  chapters?: any[];
  created_at: string;
}

export interface SessionReport {
  id: string;
  session_id: string;
  pdf_url: string;
  email_sent: boolean;
  engagement_metrics: any;
  ai_summary: string;
  recommendations: string[];
  created_at: string;
}

export interface TutorStudent {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
}

export interface LearningMilestone {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  milestone_name: string;
  description: string;
  target_date?: string;
  completed_date?: string;
  completion_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface SessionSchedule {
  id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  subject: string;
  scheduled_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  meeting_link?: string;
  notes: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressTracking {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  average_engagement: number;
  time_spent_minutes: number;
  active_participation_rate: number;
  learning_velocity: number;
  strengths: string[];
  areas_for_improvement: string[];
  last_updated: string;
  created_at: string;
}

// Helper functions for database operations
export const dbHelpers = {
  // Get user with profile data
  async getUserWithProfile(userId: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) return null;

      let profileData = null;
      if (user.role === 'tutor') {
        const { data } = await supabase
          .from('tutor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = data;
      } else if (user.role === 'student') {
        const { data } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = data;
      }

      return { user, profile: profileData };
    } catch (error) {
      console.error('Error getting user with profile:', error);
      return null;
    }
  },

  // Get sessions with related data
  async getSessionsWithDetails(userId: string, role: string) {
    try {
      const query = supabase
        .from('sessions')
        .select(`
          *,
          tutor:users!sessions_tutor_id_fkey(id, name, email),
          student:users!sessions_student_id_fkey(id, name, email),
          recording:session_recordings(*)
        `)
        .order('scheduled_at', { ascending: false });

      if (role === 'tutor') {
        query.eq('tutor_id', userId);
      } else {
        query.eq('student_id', userId);
      }

      return await query;
    } catch (error) {
      console.error('Error getting sessions with details:', error);
      return { data: null, error };
    }
  },

  // Get progress data for student
  async getStudentProgress(studentId: string) {
    try {
      const [milestones, progress] = await Promise.all([
        supabase
          .from('learning_milestones')
          .select('*')
          .eq('student_id', studentId)
          .order('target_date', { ascending: true }),
        
        supabase
          .from('progress_tracking')
          .select('*')
          .eq('student_id', studentId)
      ]);

      return {
        milestones: milestones.data || [],
        progress: progress.data || []
      };
    } catch (error) {
      console.error('Error getting student progress:', error);
      return { milestones: [], progress: [] };
    }
  }
};