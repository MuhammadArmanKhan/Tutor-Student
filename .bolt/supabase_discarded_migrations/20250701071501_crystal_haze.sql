/*
  # Fix Authentication and Database Schema

  1. Clean Database Setup
    - Drop and recreate tables with proper structure
    - Fix all constraints and relationships
    - Ensure proper RLS policies

  2. Authentication Flow
    - Proper user creation
    - Role-based access
    - Profile automation

  3. Demo Data
    - Safe demo user creation
    - Proper profile setup
*/

-- Drop existing tables to start fresh (in correct order to avoid FK conflicts)
DROP TABLE IF EXISTS session_analytics CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS session_schedule CASCADE;
DROP TABLE IF EXISTS learning_milestones CASCADE;
DROP TABLE IF EXISTS session_reports CASCADE;
DROP TABLE IF EXISTS session_recordings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tutor_students CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS tutor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all required columns
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'tutor', 'parent')),
  profile_complete boolean DEFAULT false,
  avatar_url text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tutor_profiles table
CREATE TABLE tutor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  certifications text[] DEFAULT '{}',
  subjects text[] DEFAULT '{}',
  bio text DEFAULT '',
  hourly_rate numeric DEFAULT 0,
  experience_years integer DEFAULT 0,
  rating numeric DEFAULT 0,
  total_sessions integer DEFAULT 0,
  availability jsonb DEFAULT '{}',
  timezone text DEFAULT 'UTC',
  profile_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_profiles table
CREATE TABLE student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES users(id),
  grade_level text DEFAULT '',
  subjects_of_interest text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  age integer,
  school text DEFAULT '',
  emergency_contact jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tutor_students table
CREATE TABLE tutor_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tutor_id, student_id, subject)
);

-- Create sessions table
CREATE TABLE sessions (
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
  meeting_url text,
  session_type text DEFAULT 'regular' CHECK (session_type IN ('regular', 'trial', 'makeup', 'assessment')),
  materials_shared jsonb DEFAULT '[]',
  homework_assigned text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_recordings table
CREATE TABLE session_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  video_url text,
  audio_url text,
  transcript text DEFAULT '',
  speaker_labels jsonb DEFAULT '[]',
  ai_insights jsonb DEFAULT '{}',
  file_size bigint DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  thumbnail_url text,
  chapters jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create session_reports table
CREATE TABLE session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  pdf_url text NOT NULL,
  email_sent boolean DEFAULT false,
  engagement_metrics jsonb DEFAULT '{}',
  ai_summary text DEFAULT '',
  recommendations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create learning_milestones table
CREATE TABLE learning_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  milestone_name text NOT NULL,
  description text DEFAULT '',
  target_date date,
  completed_date date,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status text DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_schedule table
CREATE TABLE session_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  meeting_link text,
  notes text DEFAULT '',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create progress_tracking table
CREATE TABLE progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tutor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  total_sessions integer DEFAULT 0,
  completed_sessions integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  average_engagement numeric DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  active_participation_rate numeric DEFAULT 0,
  learning_velocity numeric DEFAULT 0,
  strengths text[] DEFAULT '{}',
  areas_for_improvement text[] DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create session_analytics table
CREATE TABLE session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  audio_metrics jsonb DEFAULT '[]',
  engagement_metrics jsonb DEFAULT '[]',
  speaking_ratios jsonb DEFAULT '{}',
  total_interactions integer DEFAULT 0,
  average_attention numeric DEFAULT 0,
  question_count integer DEFAULT 0,
  topics_covered text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tutor_profiles_user_id ON tutor_profiles(user_id);
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_parent_id ON student_profiles(parent_id);
CREATE INDEX idx_sessions_tutor_student ON sessions(tutor_id, student_id);
CREATE INDEX idx_sessions_status_date ON sessions(status, scheduled_at);
CREATE INDEX idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX idx_tutor_students_active ON tutor_students(tutor_id, status) WHERE status = 'active';
CREATE INDEX idx_learning_milestones_student_id ON learning_milestones(student_id);
CREATE INDEX idx_learning_milestones_tutor_id ON learning_milestones(tutor_id);
CREATE INDEX idx_session_schedule_date ON session_schedule(scheduled_date);
CREATE INDEX idx_progress_tracking_student_subject ON progress_tracking(student_id, subject);
CREATE INDEX idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX idx_session_analytics_created_at ON session_analytics(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_profiles_updated_at 
    BEFORE UPDATE ON tutor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at 
    BEFORE UPDATE ON student_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_milestones_updated_at 
    BEFORE UPDATE ON learning_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_schedule_updated_at 
    BEFORE UPDATE ON session_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_analytics_updated_at 
    BEFORE UPDATE ON session_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tutor profiles policies
CREATE POLICY "Anyone can read tutor profiles"
  ON tutor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tutors can manage own profile"
  ON tutor_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Student profiles policies
CREATE POLICY "Students and parents can manage profiles"
  ON student_profiles FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = parent_id
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = parent_id
  );

-- Tutor students policies
CREATE POLICY "Tutors can manage their students"
  ON tutor_students FOR ALL
  TO authenticated
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Students can view their tutors"
  ON tutor_students FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Parents can view their children tutors"
  ON tutor_students FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT user_id FROM student_profiles 
      WHERE parent_id = auth.uid()
    )
  );

-- Sessions policies
CREATE POLICY "Users can access their sessions"
  ON sessions FOR ALL
  TO authenticated
  USING (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT parent_id FROM student_profiles 
      WHERE user_id = sessions.student_id
    )
  )
  WITH CHECK (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id
  );

-- Session recordings policies
CREATE POLICY "Users can access session recordings"
  ON session_recordings FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE tutor_id = auth.uid() OR 
            student_id = auth.uid() OR
            student_id IN (
              SELECT user_id FROM student_profiles 
              WHERE parent_id = auth.uid()
            )
    )
  );

-- Session reports policies
CREATE POLICY "Users can access session reports"
  ON session_reports FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE tutor_id = auth.uid() OR 
            student_id = auth.uid() OR
            student_id IN (
              SELECT user_id FROM student_profiles 
              WHERE parent_id = auth.uid()
            )
    )
  );

-- Learning milestones policies
CREATE POLICY "Students and tutors can manage milestones"
  ON learning_milestones FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id OR 
    auth.uid() = tutor_id OR
    auth.uid() IN (
      SELECT parent_id FROM student_profiles 
      WHERE user_id = learning_milestones.student_id
    )
  )
  WITH CHECK (
    auth.uid() = student_id OR 
    auth.uid() = tutor_id
  );

-- Session schedule policies
CREATE POLICY "Users can manage their scheduled sessions"
  ON session_schedule FOR ALL
  TO authenticated
  USING (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT parent_id FROM student_profiles 
      WHERE user_id = session_schedule.student_id
    )
  )
  WITH CHECK (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id
  );

-- Progress tracking policies
CREATE POLICY "Users can view progress tracking"
  ON progress_tracking FOR ALL
  TO authenticated
  USING (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT parent_id FROM student_profiles 
      WHERE user_id = progress_tracking.student_id
    )
  )
  WITH CHECK (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id
  );

-- Session analytics policies
CREATE POLICY "Users can access session analytics"
  ON session_analytics FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE tutor_id = auth.uid() OR 
            student_id = auth.uid() OR
            student_id IN (
              SELECT user_id FROM student_profiles 
              WHERE parent_id = auth.uid()
            )
    )
  );

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('session-recordings', 'session-recordings', true),
  ('session-reports', 'session-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-recordings');

CREATE POLICY "Users can view recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-recordings');

CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'session-reports');

CREATE POLICY "Users can view reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'session-reports');

-- Insert demo users for testing
INSERT INTO users (id, email, name, role, profile_complete) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'tutor@example.com', 'Dr. Sarah Wilson', 'tutor', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'student@example.com', 'Alex Johnson', 'student', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'parent@example.com', 'Michael Johnson', 'parent', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo tutor profile
INSERT INTO tutor_profiles (user_id, bio, hourly_rate, experience_years, subjects, certifications) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Experienced mathematics tutor with PhD in Applied Mathematics', 75, 8, ARRAY['Mathematics', 'Physics', 'Statistics'], ARRAY['PhD Mathematics', 'Teaching Certificate'])
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo student profile
INSERT INTO student_profiles (user_id, parent_id, grade_level, subjects_of_interest, learning_goals) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '10th Grade', ARRAY['Mathematics', 'Physics'], ARRAY['Improve algebra skills', 'Prepare for SAT'])
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo tutor-student relationship
INSERT INTO tutor_students (tutor_id, student_id, subject, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Mathematics', 'active')
ON CONFLICT (tutor_id, student_id, subject) DO NOTHING;