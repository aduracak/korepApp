-- Enable RLS
alter table auth.users enable row level security;

-- Create extensions if needed
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('professor', 'student')),
  parent_names text,
  parent_phone text,
  subject text,
  school text,
  grades text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lessons table
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  professor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create grades table
create table public.grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  professor_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  value integer not null check (value between 1 and 5),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subjects table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create schools table
create table public.schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.grades enable row level security;
alter table public.subjects enable row level security;
alter table public.schools enable row level security;

-- Create trigger function for handling new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_user_meta_data json;
begin
  -- Log the incoming data
  raise notice 'Creating profile for user %', new.id;
  raise notice 'Raw metadata: %', new.raw_user_meta_data;
  
  raw_user_meta_data := new.raw_user_meta_data;
  
  -- Validate required fields
  if raw_user_meta_data->>'first_name' is null or raw_user_meta_data->>'first_name' = '' then
    raise exception 'first_name is required';
  end if;
  
  if raw_user_meta_data->>'last_name' is null or raw_user_meta_data->>'last_name' = '' then
    raise exception 'last_name is required';
  end if;
  
  if raw_user_meta_data->>'role' is null or raw_user_meta_data->>'role' = '' then
    raise exception 'role is required';
  end if;
  
  -- Insert into profiles with validation
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    parent_names,
    parent_phone,
    subject,
    school,
    grades,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    raw_user_meta_data->>'first_name',
    raw_user_meta_data->>'last_name',
    raw_user_meta_data->>'phone',
    raw_user_meta_data->>'role',
    case 
      when raw_user_meta_data->>'role' = 'student' then raw_user_meta_data->>'parent_names'
      else null
    end,
    case 
      when raw_user_meta_data->>'role' = 'student' then raw_user_meta_data->>'parent_phone'
      else null
    end,
    case 
      when raw_user_meta_data->>'role' = 'professor' then raw_user_meta_data->>'subject'
      else null
    end,
    case 
      when raw_user_meta_data->>'role' = 'professor' then raw_user_meta_data->>'school'
      else null
    end,
    null::text[],
    now(),
    now()
  );
  
  raise notice 'Profile created successfully';
  return new;
exception
  when others then
    raise exception 'Error creating profile: %', SQLERRM;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create policies
-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Allow insert during registration"
  on public.profiles for insert
  with check (true);

create policy "Enable update for users based on id"
  on public.profiles for update
  using (auth.uid() = id);

-- Lessons policies
create policy "Professors and students can view their lessons"
  on public.lessons for select
  using (auth.uid() = professor_id or auth.uid() = student_id);

create policy "Professors can insert lessons"
  on public.lessons for insert
  with check (auth.uid() = professor_id);

create policy "Professors can update their lessons"
  on public.lessons for update
  using (auth.uid() = professor_id);

create policy "Professors can delete their lessons"
  on public.lessons for delete
  using (auth.uid() = professor_id);

-- Grades policies
create policy "Professors and students can view grades"
  on public.grades for select
  using (auth.uid() = professor_id or auth.uid() = student_id);

create policy "Professors can insert grades"
  on public.grades for insert
  with check (auth.uid() = professor_id);

create policy "Professors can update their grades"
  on public.grades for update
  using (auth.uid() = professor_id);

-- Subjects and schools policies
create policy "Subjects are viewable by everyone"
  on public.subjects for select
  using (true);

create policy "Schools are viewable by everyone"
  on public.schools for select
  using (true); 