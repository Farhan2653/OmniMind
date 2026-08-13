create table public.user_settings (
  id uuid references auth.users on delete cascade not null primary key,
  model text default 'gpt-4o',
  api_key text default '',
  temperature numeric default 0.7,
  display_name text default '',
  title text default '',
  bio text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings." on public.user_settings
  for select using (auth.uid() = id);

create policy "Users can update own settings." on public.user_settings
  for update using (auth.uid() = id);

create policy "Users can insert own settings." on public.user_settings
  for insert with check (auth.uid() = id);

-- Trigger to automatically create a settings row when a user signs up
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();
