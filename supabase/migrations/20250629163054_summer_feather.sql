-- Create session analytics table for storing real-time monitoring data
CREATE TABLE IF NOT EXISTS session_analytics (
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

-- Enable RLS
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access session analytics"
  ON session_analytics
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_created_at ON session_analytics(created_at);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_session_analytics_updated_at ON session_analytics;
CREATE TRIGGER update_session_analytics_updated_at 
    BEFORE UPDATE ON session_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();