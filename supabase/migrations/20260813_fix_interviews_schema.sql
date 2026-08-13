-- Ensure all required columns exist in the interviews table
ALTER TABLE public.interviews 
ADD COLUMN IF NOT EXISTS role_title TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS mode TEXT,
ADD COLUMN IF NOT EXISTS num_questions INTEGER,
ADD COLUMN IF NOT EXISTS overall_score INTEGER,
ADD COLUMN IF NOT EXISTS metrics JSONB;

-- Reload the PostgREST schema cache so the API recognizes the columns
NOTIFY pgrst, 'reload schema';
