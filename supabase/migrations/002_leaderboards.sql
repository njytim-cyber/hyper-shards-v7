
-- Global High Scores Table
create table leaderboards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  score bigint not null,
  wave integer not null,
  pilot_id text not null,
  created_at timestamp with time zone default now(),
  
  -- Prevent spam: Limit 1 entry per user? Or just top scores?
  -- For arcade style, we usually want "Top 100 All Time", so we store many.
  -- But to keep it efficient, maybe we only insert if it's a PB?
  -- Or we just store everything and query efficiently.
  
  constraint score_positive check (score >= 0)
);

-- Enable RLS
alter table leaderboards enable row level security;

-- Everyone can read stats
create policy "Leaderboards are public"
  on leaderboards for select
  using ( true );

-- Authenticated users can insert scores
create policy "Users can submit scores"
  on leaderboards for insert
  with check ( auth.uid() = user_id );

-- Optional: Create a view for easy "Top 10" querying including profile data
create or replace view top_scores as
  select 
    l.score,
    l.wave,
    l.pilot_id,
    l.created_at,
    p.username,
    p.avatar_url,
    p.data->>'equippedTitle' as title
  from leaderboards l
  left join profiles p on l.user_id = p.id
  order by l.score desc
  limit 100;
