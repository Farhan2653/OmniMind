-- Add total_interviews to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_interviews INTEGER DEFAULT 0 NOT NULL;

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  mode TEXT NOT NULL,
  num_questions INTEGER NOT NULL,
  overall_score INTEGER NOT NULL,
  metrics JSONB NOT NULL,
  transcript JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own interviews
CREATE POLICY "Users can insert their own interviews"
  ON public.interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own interviews
CREATE POLICY "Users can view their own interviews"
  ON public.interviews FOR SELECT
  USING (auth.uid() = user_id);

-- Create a trigger function to increment total_interviews whenever an interview is completed
CREATE OR REPLACE FUNCTION public.increment_total_interviews()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET total_interviews = total_interviews + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the interviews table
DROP TRIGGER IF EXISTS on_interview_created ON public.interviews;
CREATE TRIGGER on_interview_created
  AFTER INSERT ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.increment_total_interviews();
