-- Create trial_analyses table
CREATE TABLE IF NOT EXISTS trial_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trial_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming authentication is set up)
CREATE POLICY "Users can view their own trial analyses"
  ON trial_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trial analyses"
  ON trial_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trial analyses"
  ON trial_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trial analyses"
  ON trial_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trial_analyses_user_subject ON trial_analyses(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_trial_analyses_created_at ON trial_analyses(created_at DESC);
