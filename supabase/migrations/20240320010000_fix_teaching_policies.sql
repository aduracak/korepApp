-- Create teaching table
create table if not exists "public"."teaching" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "class_id" uuid not null,
  "subject_id" uuid not null,
  "teacher_id" uuid not null,
  constraint "teaching_pkey" primary key ("id")
);

-- Enable RLS
alter table "public"."teaching" enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for authenticated users" on "public"."teaching";
drop policy if exists "Enable insert access for authenticated users" on "public"."teaching";
drop policy if exists "Enable update access for authenticated users" on "public"."teaching";
drop policy if exists "Enable delete access for authenticated users" on "public"."teaching";

-- Create policies
create policy "Enable read access for authenticated users"
on "public"."teaching"
for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on "public"."teaching"
for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on "public"."teaching"
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete access for authenticated users"
on "public"."teaching"
for delete
to authenticated
using (true);

-- Drop existing foreign keys if they exist
alter table if exists "public"."teaching" drop constraint if exists "teaching_class_id_fkey";
alter table if exists "public"."teaching" drop constraint if exists "teaching_subject_id_fkey";
alter table if exists "public"."teaching" drop constraint if exists "teaching_teacher_id_fkey";

-- Add foreign key constraints
alter table "public"."teaching" add constraint "teaching_class_id_fkey"
  foreign key ("class_id")
  references "public"."school_classes" ("id")
  on delete cascade;

alter table "public"."teaching" add constraint "teaching_subject_id_fkey"
  foreign key ("subject_id")
  references "public"."subjects" ("id")
  on delete cascade;

alter table "public"."teaching" add constraint "teaching_teacher_id_fkey"
  foreign key ("teacher_id")
  references "public"."teachers" ("id")
  on delete cascade;

-- Add unique constraint to prevent duplicates
alter table "public"."teaching" add constraint "teaching_unique_combination"
  unique ("class_id", "subject_id", "teacher_id"); 