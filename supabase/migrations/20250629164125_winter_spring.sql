/*
  # Fix Authentication and Database Schema Issues

  1. Database Structure
    - Ensure users table has all required columns
    - Create tutor_profiles and student_profiles tables with proper structure
    - Add proper constraints and indexes

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies for data access
    - Ensure proper authentication flow

  3. Demo Data
    - Add demo users for testing
    - Create sample profiles
    - Handle conflicts properly
*/

-- Ensure users table has correct structure
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
    ALTER TABLE users ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- Update role constraint to be more permissive
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['student'::text, 'tutor'::text, 'parent'::text]));

-- Ensure tutor_profiles table exists with all columns
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
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

-- Add foreign key constraint for tutor_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tutor_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE tutor_profiles 
    ADD CONSTRAINT tutor_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure student_profiles table exists with all columns
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  parent_id uuid,
  grade_level text DEFAULT '',
  subjects_of_interest text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  age integer,
  school text DEFAULT '',
  emergency_contact jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for student_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE student_profiles 
    ADD CONSTRAINT student_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_profiles_parent_id_fkey'
  ) THEN
    ALTER TABLE student_profiles 
    ADD CONSTRAINT student_profiles_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Anyone can read tutor profiles" ON tutor_profiles;
DROP POLICY IF EXISTS "Tutors can manage own profile" ON tutor_profiles;
DROP POLICY IF EXISTS "Students and parents can manage profiles" ON student_profiles;

-- Create comprehensive RLS policies for users
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

-- Create policies for tutor profiles
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

-- Create policies for student profiles
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user_id ON tutor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_parent_id ON student_profiles(parent_id);

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

-- Insert demo users for testing (check if they exist first)
DO $$
BEGIN
  -- Insert demo tutor
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tutor@example.com') THEN
    INSERT INTO users (id, email, name, role, profile_complete) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'tutor@example.com', 'Dr. Sarah Wilson', 'tutor', true);
  END IF;
  
  -- Insert demo student
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@example.com') THEN
    INSERT INTO users (id, email, name, role, profile_complete) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'student@example.com', 'Alex Johnson', 'student', true);
  END IF;
  
  -- Insert demo parent
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'parent@example.com') THEN
    INSERT INTO users (id, email, name, role, profile_complete) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'parent@example.com', 'Michael Johnson', 'parent', true);
  END IF;
END $$;

-- Insert demo tutor profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tutor_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO tutor_profiles (user_id, bio, hourly_rate, experience_years, subjects, certifications) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Experienced mathematics tutor with PhD in Applied Mathematics', 75, 8, ARRAY['Mathematics', 'Physics', 'Statistics'], ARRAY['PhD Mathematics', 'Teaching Certificate']);
  END IF;
END $$;

-- Insert demo student profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM student_profiles WHERE user_id = '550e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO student_profiles (user_id, parent_id, grade_level, subjects_of_interest, learning_goals) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '10th Grade', ARRAY['Mathematics', 'Physics'], ARRAY['Improve algebra skills', 'Prepare for SAT']);
  END IF;
END $$;