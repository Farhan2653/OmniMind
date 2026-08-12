-- Initialize missing profiles and sync chat counts
INSERT INTO public.profiles (id, total_chats_created, time_spent_seconds)
SELECT id, 0, 0 FROM auth.users
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles p
SET total_chats_created = (
  SELECT COUNT(id)
  FROM public.chats c
  WHERE c.user_id = p.id
);
