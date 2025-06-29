/*
  # Fix Authentication Issues

  1. Database Schema Fixes
    - Ensure all required tables exist with proper structure
    - Fix constraints and indexes
    - Update RLS policies for better security

  2. Authentication Flow
    - Proper user creation flow
    - Role-based access control
    - Profile creation automation
*/

-- Ensure users table has correct structure
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Update role constraint to be more permissive during development
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['student'::text, 'tutor'::text, 'parent'::text]));

-- Ensure tutor_profiles table exists with all columns
CREATE TABLE IF NOT EXISTS tutor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

-- Ensure student_profiles table exists with all columns
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

-- Insert demo users for testing (only if they don't exist)
INSERT INTO users (id, email, name, role, profile_complete) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'tutor@example.com', 'Dr. Sarah Wilson', 'tutor', true),
('550e8400-e29b-41d4-a716-446655440002', 'student@example.com', 'Alex Johnson', 'student', true),
('550e8400-e29b-41d4-a716-446655440003', 'parent@example.com', 'Michael Johnson', 'parent', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo tutor profile
INSERT INTO tutor_profiles (user_id, bio, hourly_rate, experience_years, subjects, certifications) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Experienced mathematics tutor with PhD in Applied Mathematics', 75, 8, ARRAY['Mathematics', 'Physics', 'Statistics'], ARRAY['PhD Mathematics', 'Teaching Certificate'])
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo student profile
INSERT INTO student_profiles (user_id, parent_id, grade_level, subjects_of_interest, learning_goals) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '10th Grade', ARRAY['Mathematics', 'Physics'], ARRAY['Improve algebra skills', 'Prepare for SAT'])
ON CONFLICT (user_id) DO NOTHING;