-- Drop existing policies
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Allow insert during registration" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;
drop policy if exists "Allow role check during login" on profiles;

-- Create new policies
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Allow role check during login"
  on profiles for select
  using (auth.role() in ('authenticated', 'anon'));

create policy "Service role can create profiles"
  on profiles for insert
  with check (auth.jwt()->>'role' = 'service_role');

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (
    coalesce(auth.jwt()->>'role', '') in ('authenticated', 'service_role')
  );

-- Update RLS
alter table profiles enable row level security; 