-- Create a table for public profiles (optional, for leaderboards)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  data jsonb -- The entire game save blob
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Users can view their own profile (and others for leaderboards later)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Policy: Users can insert their own profile.
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Policy: Users can update own profile.
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a secure bucket for save backups if needed (optional)
