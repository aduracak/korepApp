-- Create schools table
create table if not exists "public"."schools" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "name" text not null,
  "address" text,
  constraint "schools_pkey" primary key ("id")
);

-- Create school_classes table
create table if not exists "public"."school_classes" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "name" text not null,
  "school_id" uuid not null,
  constraint "school_classes_pkey" primary key ("id"),
  constraint "school_classes_school_id_fkey" foreign key ("school_id") references "public"."schools"("id") on delete cascade
);

-- Create subjects table
create table if not exists "public"."subjects" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "name" text not null,
  "description" text,
  constraint "subjects_pkey" primary key ("id")
);

-- Create teachers table
create table if not exists "public"."teachers" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "first_name" text not null,
  "last_name" text not null,
  "email" text,
  "phone" text,
  constraint "teachers_pkey" primary key ("id")
);

-- Create teaching table
create table if not exists "public"."teaching" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
  "class_id" uuid not null,
  "subject_id" uuid not null,
  "teacher_id" uuid not null,
  constraint "teaching_pkey" primary key ("id"),
  constraint "teaching_class_id_fkey" foreign key ("class_id") references "public"."school_classes"("id") on delete cascade,
  constraint "teaching_subject_id_fkey" foreign key ("subject_id") references "public"."subjects"("id") on delete cascade,
  constraint "teaching_teacher_id_fkey" foreign key ("teacher_id") references "public"."teachers"("id") on delete cascade,
  constraint "teaching_unique_combination" unique ("class_id", "subject_id", "teacher_id")
);

-- Enable RLS on all tables
alter table "public"."schools" enable row level security;
alter table "public"."school_classes" enable row level security;
alter table "public"."subjects" enable row level security;
alter table "public"."teachers" enable row level security;
alter table "public"."teaching" enable row level security;

-- Create policies for schools
create policy "Enable read access for authenticated users" on "public"."schools" for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on "public"."schools" for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on "public"."schools" for update to authenticated using (true) with check (true);
create policy "Enable delete access for authenticated users" on "public"."schools" for delete to authenticated using (true);

-- Create policies for school_classes
create policy "Enable read access for authenticated users" on "public"."school_classes" for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on "public"."school_classes" for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on "public"."school_classes" for update to authenticated using (true) with check (true);
create policy "Enable delete access for authenticated users" on "public"."school_classes" for delete to authenticated using (true);

-- Create policies for subjects
create policy "Enable read access for authenticated users" on "public"."subjects" for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on "public"."subjects" for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on "public"."subjects" for update to authenticated using (true) with check (true);
create policy "Enable delete access for authenticated users" on "public"."subjects" for delete to authenticated using (true);

-- Create policies for teachers
create policy "Enable read access for authenticated users" on "public"."teachers" for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on "public"."teachers" for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on "public"."teachers" for update to authenticated using (true) with check (true);
create policy "Enable delete access for authenticated users" on "public"."teachers" for delete to authenticated using (true);

-- Create policies for teaching
create policy "Enable read access for authenticated users" on "public"."teaching" for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on "public"."teaching" for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on "public"."teaching" for update to authenticated using (true) with check (true);
create policy "Enable delete access for authenticated users" on "public"."teaching" for delete to authenticated using (true); 