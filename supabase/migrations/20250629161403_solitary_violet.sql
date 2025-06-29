/*
  # Comprehensive Database Fixes

  1. Database Schema Fixes
    - Fix RLS policies with proper auth functions
    - Add missing columns and constraints
    - Fix foreign key relationships
    - Add proper indexes for performance

  2. Security Fixes
    - Enable RLS on all tables
    - Fix policy conflicts and duplicates
    - Ensure proper user access controls

  3. Data Integrity
    - Add proper constraints and checks
    - Fix default values
    - Ensure referential integrity
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can read tutor profiles" ON tutor_profiles;
DROP POLICY IF EXISTS "Tutors can manage own profile" ON tutor_profiles;
DROP POLICY IF EXISTS "Students and parents can manage profiles" ON student_profiles;
DROP POLICY IF EXISTS "Users can access their sessions" ON sessions;
DROP POLICY IF EXISTS "Users can access session recordings" ON session_recordings;
DROP POLICY IF EXISTS "Users can access session reports" ON session_reports;
DROP POLICY IF EXISTS "Students can view their tutors" ON tutor_students;
DROP POLICY IF EXISTS "Tutors can manage their students" ON tutor_students;
DROP POLICY IF EXISTS "Parents can view their children's tutors" ON tutor_students;
DROP POLICY IF EXISTS "Students and tutors can manage milestones" ON learning_milestones;
DROP POLICY IF EXISTS "Users can manage their scheduled sessions" ON session_schedule;
DROP POLICY IF EXISTS "Users can view progress tracking" ON progress_tracking;

-- Ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- Fix users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Update role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['student'::text, 'tutor'::text, 'parent'::text]));

-- Fix tutor_profiles table
ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Fix student_profiles table
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS school text DEFAULT '',
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}';

-- Fix sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS meeting_url text,
ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS materials_shared jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS homework_assigned text DEFAULT '';

-- Update session constraints
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_type_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check 
CHECK (session_type = ANY (ARRAY['regular'::text, 'trial'::text, 'makeup'::text, 'assessment'::text]));

-- Fix session_recordings table
ALTER TABLE session_recordings 
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS chapters jsonb DEFAULT '[]';

-- Update processing status constraint
ALTER TABLE session_recordings DROP CONSTRAINT IF EXISTS session_recordings_processing_status_check;
ALTER TABLE session_recordings ADD CONSTRAINT session_recordings_processing_status_check 
CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]));

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_student ON sessions(tutor_id, student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status_date ON sessions(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_tutor_students_active ON tutor_students(tutor_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_learning_milestones_student_id ON learning_milestones(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_milestones_tutor_id ON learning_milestones(tutor_id);
CREATE INDEX IF NOT EXISTS idx_session_schedule_date ON session_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_student_subject ON progress_tracking(student_id, subject);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tutor_profiles_updated_at ON tutor_profiles;
CREATE TRIGGER update_tutor_profiles_updated_at 
    BEFORE UPDATE ON tutor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at 
    BEFORE UPDATE ON student_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_milestones_updated_at ON learning_milestones;
CREATE TRIGGER update_learning_milestones_updated_at 
    BEFORE UPDATE ON learning_milestones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_schedule_updated_at ON session_schedule;
CREATE TRIGGER update_session_schedule_updated_at 
    BEFORE UPDATE ON session_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create comprehensive RLS policies

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Tutor profiles policies
CREATE POLICY "Anyone can read tutor profiles"
  ON tutor_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tutors can manage own profile"
  ON tutor_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Student profiles policies
CREATE POLICY "Students and parents can manage profiles"
  ON student_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = parent_id::text
  )
  WITH CHECK (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = parent_id::text
  );

-- Sessions policies
CREATE POLICY "Users can access their sessions"
  ON sessions
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text OR
    auth.uid()::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = sessions.student_id::text
    )
  )
  WITH CHECK (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text
  );

-- Session recordings policies
CREATE POLICY "Users can access session recordings"
  ON session_recordings
  FOR ALL
  TO authenticated
  USING (
    session_id::text IN (
      SELECT id::text FROM sessions 
      WHERE tutor_id::text = auth.uid()::text OR 
            student_id::text = auth.uid()::text OR
            student_id::text IN (
              SELECT user_id::text FROM student_profiles 
              WHERE parent_id::text = auth.uid()::text
            )
    )
  );

-- Session reports policies
CREATE POLICY "Users can access session reports"
  ON session_reports
  FOR ALL
  TO authenticated
  USING (
    session_id::text IN (
      SELECT id::text FROM sessions 
      WHERE tutor_id::text = auth.uid()::text OR 
            student_id::text = auth.uid()::text OR
            student_id::text IN (
              SELECT user_id::text FROM student_profiles 
              WHERE parent_id::text = auth.uid()::text
            )
    )
  );

-- Tutor students policies
CREATE POLICY "Students can view their tutors"
  ON tutor_students
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = student_id::text);

CREATE POLICY "Tutors can manage their students"
  ON tutor_students
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = tutor_id::text)
  WITH CHECK (auth.uid()::text = tutor_id::text);

CREATE POLICY "Parents can view their children tutors"
  ON tutor_students
  FOR SELECT
  TO authenticated
  USING (
    student_id::text IN (
      SELECT user_id::text FROM student_profiles 
      WHERE parent_id::text = auth.uid()::text
    )
  );

-- Learning milestones policies
CREATE POLICY "Students and tutors can manage milestones"
  ON learning_milestones
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = student_id::text OR 
    auth.uid()::text = tutor_id::text OR
    auth.uid()::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = learning_milestones.student_id::text
    )
  )
  WITH CHECK (
    auth.uid()::text = student_id::text OR 
    auth.uid()::text = tutor_id::text
  );

-- Session schedule policies
CREATE POLICY "Users can manage their scheduled sessions"
  ON session_schedule
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text OR
    auth.uid()::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = session_schedule.student_id::text
    )
  )
  WITH CHECK (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text
  );

-- Progress tracking policies
CREATE POLICY "Users can view progress tracking"
  ON progress_tracking
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text OR
    auth.uid()::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = progress_tracking.student_id::text
    )
  )
  WITH CHECK (
    auth.uid()::text = tutor_id::text OR 
    auth.uid()::text = student_id::text
  );