-- Synchronize the total_chats_created column in profiles with existing data
UPDATE public.profiles p
SET total_chats_created = (
  SELECT COUNT(id)
  FROM public.chats c
  WHERE c.user_id = p.id
);
