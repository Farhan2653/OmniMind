-- Add total_chats_created and time_spent_seconds to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_chats_created INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0 NOT NULL;

-- Create a trigger function to increment total_chats_created whenever a chat is created
CREATE OR REPLACE FUNCTION public.increment_total_chats()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET total_chats_created = total_chats_created + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the chats table
DROP TRIGGER IF EXISTS on_chat_created ON public.chats;
CREATE TRIGGER on_chat_created
  AFTER INSERT ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.increment_total_chats();

-- RPC function to increment time_spent_seconds
CREATE OR REPLACE FUNCTION public.increment_time_spent(user_uuid UUID, seconds_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET time_spent_seconds = time_spent_seconds + seconds_to_add
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
