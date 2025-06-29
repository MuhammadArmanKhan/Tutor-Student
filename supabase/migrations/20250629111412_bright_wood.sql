/*
  # Add Progress Tracking and Session Scheduling

  1. New Tables
    - `learning_milestones` - Track student progress milestones
    - `session_schedule` - Manage scheduled sessions
    - `progress_tracking` - Track completion rates and learning progress

  2. Updates
    - Add progress fields to existing tables
    - Add scheduling capabilities
    - Add parent-specific features

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Learning Milestones
CREATE TABLE IF NOT EXISTS learning_milestones (
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

ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and tutors can manage milestones"
  ON learning_milestones
  FOR ALL
  TO authenticated
  USING (
    (auth.uid())::text = student_id::text OR 
    (auth.uid())::text = tutor_id::text OR
    (auth.uid())::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = student_id::text
    )
  );

-- Session Schedule
CREATE TABLE IF NOT EXISTS session_schedule (
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

ALTER TABLE session_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their scheduled sessions"
  ON session_schedule
  FOR ALL
  TO authenticated
  USING (
    (auth.uid())::text = tutor_id::text OR 
    (auth.uid())::text = student_id::text OR
    (auth.uid())::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = student_id::text
    )
  );

-- Progress Tracking
CREATE TABLE IF NOT EXISTS progress_tracking (
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

ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view progress tracking"
  ON progress_tracking
  FOR ALL
  TO authenticated
  USING (
    (auth.uid())::text = tutor_id::text OR 
    (auth.uid())::text = student_id::text OR
    (auth.uid())::text IN (
      SELECT parent_id::text FROM student_profiles 
      WHERE user_id::text = student_id::text
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_milestones_student_id ON learning_milestones(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_milestones_tutor_id ON learning_milestones(tutor_id);
CREATE INDEX IF NOT EXISTS idx_session_schedule_date ON session_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_student_subject ON progress_tracking(student_id, subject);