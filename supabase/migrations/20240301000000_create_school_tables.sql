-- Drop existing tables if they exist
drop table if exists class_subjects;
drop table if exists classes;
drop table if exists subjects;
drop table if exists schools;

-- Create schools table
create table schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subjects table
create table subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create classes table
create table classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  school_id uuid not null references schools(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, school_id)
);

-- Create class_subjects junction table
create table class_subjects (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, subject_id)
);

-- Add RLS policies
alter table schools enable row level security;
alter table classes enable row level security;
alter table subjects enable row level security;
alter table class_subjects enable row level security;

-- Create policies for schools
create policy "Enable read access for all users" on schools
  for select using (true);

create policy "Enable insert for authenticated users" on schools
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on schools
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on schools
  for delete using (auth.role() = 'authenticated');

-- Create policies for classes
create policy "Enable read access for all users" on classes
  for select using (true);

create policy "Enable insert for authenticated users" on classes
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on classes
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on classes
  for delete using (auth.role() = 'authenticated');

-- Create policies for subjects
create policy "Enable read access for all users" on subjects
  for select using (true);

create policy "Enable insert for authenticated users" on subjects
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on subjects
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on subjects
  for delete using (auth.role() = 'authenticated');

-- Create policies for class_subjects
create policy "Enable read access for all users" on class_subjects
  for select using (true);

create policy "Enable insert for authenticated users" on class_subjects
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on class_subjects
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on class_subjects
  for delete using (auth.role() = 'authenticated');

-- Create indexes
create index if not exists idx_schools_name on schools(name);
create index if not exists idx_subjects_name on subjects(name);
create index if not exists idx_classes_school_id on classes(school_id);
create index if not exists idx_classes_name_school on classes(name, school_id);
create index if not exists idx_class_subjects_class on class_subjects(class_id);
create index if not exists idx_class_subjects_subject on class_subjects(subject_id);

-- Create triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_schools_updated_at
  before update on schools
  for each row
  execute function update_updated_at_column();

create trigger update_subjects_updated_at
  before update on subjects
  for each row
  execute function update_updated_at_column();

create trigger update_classes_updated_at
  before update on classes
  for each row
  execute function update_updated_at_column(); 