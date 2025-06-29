-- Fix users table constraints and add missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Update users role constraint to include all roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['student'::text, 'tutor'::text, 'parent'::text]));

-- Fix tutor_profiles foreign key and add missing columns
ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Fix student_profiles and ensure proper relationships
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS school text DEFAULT '',
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}';

-- Ensure sessions table has all required columns
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS meeting_url text,
ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS materials_shared jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS homework_assigned text DEFAULT '';

-- Add session_type constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'sessions_session_type_check'
    ) THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check 
        CHECK (session_type IN ('regular', 'trial', 'makeup', 'assessment'));
    END IF;
END $$;

-- Fix session_recordings table structure
ALTER TABLE session_recordings 
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS chapters jsonb DEFAULT '[]';

-- Add processing_status constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'session_recordings_processing_status_check'
    ) THEN
        ALTER TABLE session_recordings ADD CONSTRAINT session_recordings_processing_status_check 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
END $$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_student ON sessions(tutor_id, student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status_date ON sessions(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_tutor_students_active ON tutor_students(tutor_id, status) WHERE status = 'active';

-- Fix RLS policies to use correct auth functions
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Fix tutor_profiles policies
DROP POLICY IF EXISTS "Anyone can read tutor profiles" ON tutor_profiles;
CREATE POLICY "Anyone can read tutor profiles"
  ON tutor_profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Tutors can manage own profile" ON tutor_profiles;
CREATE POLICY "Tutors can manage own profile"
  ON tutor_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix student_profiles policies
DROP POLICY IF EXISTS "Students and parents can manage profiles" ON student_profiles;
CREATE POLICY "Students and parents can manage profiles"
  ON student_profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = parent_id
  );

-- Fix sessions policies
DROP POLICY IF EXISTS "Users can access their sessions" ON sessions;
CREATE POLICY "Users can access their sessions"
  ON sessions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = tutor_id OR 
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT parent_id FROM student_profiles 
      WHERE user_id = sessions.student_id
    )
  );

-- Fix session_recordings policies
DROP POLICY IF EXISTS "Users can access session recordings" ON session_recordings;
CREATE POLICY "Users can access session recordings"
  ON session_recordings
  FOR ALL
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

-- Fix session_reports policies
DROP POLICY IF EXISTS "Users can access session reports" ON session_reports;
CREATE POLICY "Users can access session reports"
  ON session_reports
  FOR ALL
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

-- Fix tutor_students policies
DROP POLICY IF EXISTS "Students can view their tutors" ON tutor_students;
CREATE POLICY "Students can view their tutors"
  ON tutor_students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can manage their students" ON tutor_students;
CREATE POLICY "Tutors can manage their students"
  ON tutor_students
  FOR ALL
  TO authenticated
  USING (auth.uid() = tutor_id);

-- Add policy for parents to view their children's tutors
DROP POLICY IF EXISTS "Parents can view their children's tutors" ON tutor_students;
CREATE POLICY "Parents can view their children's tutors"
  ON tutor_students
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT user_id FROM student_profiles 
      WHERE parent_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
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

-- Add sample data for testing using DO blocks to avoid conflicts
DO $$
BEGIN
    -- Insert sample users if they don't exist
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tutor@example.com') THEN
        INSERT INTO users (id, email, name, role, profile_complete) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'tutor@example.com', 'Dr. Sarah Wilson', 'tutor', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@example.com') THEN
        INSERT INTO users (id, email, name, role, profile_complete) VALUES
        ('550e8400-e29b-41d4-a716-446655440002', 'student@example.com', 'Alex Johnson', 'student', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'parent@example.com') THEN
        INSERT INTO users (id, email, name, role, profile_complete) VALUES
        ('550e8400-e29b-41d4-a716-446655440003', 'parent@example.com', 'Michael Johnson', 'parent', true);
    END IF;
END $$;

-- Add sample tutor profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tutor_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001') THEN
        INSERT INTO tutor_profiles (user_id, bio, hourly_rate, experience_years, subjects, certifications) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'Experienced mathematics tutor with PhD in Applied Mathematics', 75, 8, ARRAY['Mathematics', 'Physics', 'Statistics'], ARRAY['PhD Mathematics', 'Teaching Certificate']);
    END IF;
END $$;

-- Add sample student profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM student_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002') THEN
        INSERT INTO student_profiles (user_id, parent_id, grade_level, subjects_of_interest, learning_goals) VALUES
        ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '10th Grade', ARRAY['Mathematics', 'Physics'], ARRAY['Improve algebra skills', 'Prepare for SAT']);
    END IF;
END $$;

-- Add sample tutor-student relationship
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM tutor_students 
        WHERE tutor_id = '550e8400-e29b-41d4-a716-446655440001' 
        AND student_id = '550e8400-e29b-41d4-a716-446655440002' 
        AND subject = 'Mathematics'
    ) THEN
        INSERT INTO tutor_students (tutor_id, student_id, subject, status) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Mathematics', 'active');
    END IF;
END $$;