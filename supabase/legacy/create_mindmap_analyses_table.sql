-- Create mindmap_analyses table
CREATE TABLE IF NOT EXISTS mindmap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Hierarchy
  exam_type TEXT NOT NULL, -- 'TYT', 'AYT', 'Geometri' vs.
  course_name TEXT NOT NULL, -- 'Fizik', 'Matematik' vs.
  unit_name TEXT, -- 'Optik' vb. Mathemetik ve Sosyal gibi alt dalı olmayanlar için NULL kalabilir
  
  -- Content
  image_url TEXT NOT NULL,
  note TEXT,
  is_solved BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) due to custom auth
ALTER TABLE mindmap_analyses DISABLE ROW LEVEL SECURITY;

-- Create policies (assuming authentication is set up via uid)
CREATE POLICY "Users can view their own mindmap analyses"
  ON mindmap_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindmap analyses"
  ON mindmap_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmap analyses"
  ON mindmap_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmap analyses"
  ON mindmap_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for faster queries
CREATE INDEX IF NOT EXISTS idx_mindmap_analyses_user ON mindmap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_analyses_hierarchy ON mindmap_analyses(exam_type, course_name, unit_name);
CREATE INDEX IF NOT EXISTS idx_mindmap_analyses_created_at ON mindmap_analyses(created_at DESC);
