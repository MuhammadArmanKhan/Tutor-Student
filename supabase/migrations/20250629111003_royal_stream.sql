/*
  # Initial Database Schema for EduSync Platform

  1. New Tables
    - `users` - User authentication and basic info
    - `tutor_profiles` - Tutor professional information
    - `student_profiles` - Student learning information  
    - `sessions` - Learning session records
    - `session_recordings` - Recording files and transcripts
    - `session_reports` - Generated PDF reports
    - `tutor_students` - Association between tutors and students

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on user roles

  3. Storage
    - Create buckets for recordings and reports
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'tutor', 'parent')),
  profile_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tutor profiles
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  certifications text[] DEFAULT '{}',
  subjects text[] DEFAULT '{}',
  bio text DEFAULT '',
  hourly_rate decimal DEFAULT 0,
  experience_years integer DEFAULT 0,
  rating decimal DEFAULT 0,
  total_sessions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES users(id),
  grade_level text DEFAULT '',
  subjects_of_interest text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  recording_url text,
  transcript_url text,
  engagement_score integer,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Session recordings
CREATE TABLE IF NOT EXISTS session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  video_url text,
  audio_url text,
  transcript text DEFAULT '',
  speaker_labels jsonb DEFAULT '[]',
  ai_insights jsonb DEFAULT '{}',
  file_size bigint DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Session reports
CREATE TABLE IF NOT EXISTS session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  pdf_url text NOT NULL,
  email_sent boolean DEFAULT false,
  engagement_metrics jsonb DEFAULT '{}',
  ai_summary text DEFAULT '',
  recommendations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tutor-Student associations
CREATE TABLE IF NOT EXISTS tutor_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tutor_id, student_id, subject)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Tutor profiles
CREATE POLICY "Tutors can manage own profile" ON tutor_profiles
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can read tutor profiles" ON tutor_profiles
  FOR SELECT USING (true);

-- Student profiles
CREATE POLICY "Students and parents can manage profiles" ON student_profiles
  FOR ALL USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = parent_id::text
  );

-- Sessions
CREATE POLICY "Users can access their sessions" ON sessions
  FOR ALL USING (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text OR
    auth.uid()::text IN (
      SELECT parent_id::text FROM student_profiles WHERE user_id::text = student_id::text
    )
  );

-- Session recordings
CREATE POLICY "Users can access session recordings" ON session_recordings
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE 
        tutor_id::text = auth.uid()::text OR 
        student_id::text = auth.uid()::text OR
        student_id::text IN (
          SELECT user_id::text FROM student_profiles WHERE parent_id::text = auth.uid()::text
        )
    )
  );

-- Session reports
CREATE POLICY "Users can access session reports" ON session_reports
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE 
        tutor_id::text = auth.uid()::text OR 
        student_id::text = auth.uid()::text OR
        student_id::text IN (
          SELECT user_id::text FROM student_profiles WHERE parent_id::text = auth.uid()::text
        )
    )
  );

-- Tutor-Student associations
CREATE POLICY "Tutors can manage their students" ON tutor_students
  FOR ALL USING (auth.uid()::text = tutor_id::text);

CREATE POLICY "Students can view their tutors" ON tutor_students
  FOR SELECT USING (auth.uid()::text = student_id::text);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('session-recordings', 'session-recordings', true),
  ('session-reports', 'session-reports', true);

-- Storage policies
CREATE POLICY "Users can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-recordings');

CREATE POLICY "Users can view recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-recordings');

CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-reports');

CREATE POLICY "Users can view reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-reports');