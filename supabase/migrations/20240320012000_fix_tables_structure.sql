-- Drop existing tables if they exist
DROP TABLE IF EXISTS "public"."teaching" CASCADE;
DROP TABLE IF EXISTS "public"."professors" CASCADE;
DROP TABLE IF EXISTS "public"."school_classes" CASCADE;
DROP TABLE IF EXISTS "public"."subjects" CASCADE;
DROP TABLE IF EXISTS "public"."schools" CASCADE;

-- Create professors table (umjesto teachers)
CREATE TABLE IF NOT EXISTS "public"."professors" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text,
    "phone" text,
    CONSTRAINT "professors_pkey" PRIMARY KEY ("id")
);

-- Create schools table
CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "name" text NOT NULL,
    "address" text,
    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "name" text NOT NULL,
    "description" text,
    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- Create school_classes table
CREATE TABLE IF NOT EXISTS "public"."school_classes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "name" text NOT NULL,
    "school_id" uuid NOT NULL,
    CONSTRAINT "school_classes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "school_classes_school_id_fkey" FOREIGN KEY ("school_id") 
        REFERENCES "public"."schools"("id") ON DELETE CASCADE
);

-- Create teaching table
CREATE TABLE IF NOT EXISTS "public"."teaching" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "class_id" uuid NOT NULL,
    "subject_id" uuid NOT NULL,
    "professor_id" uuid NOT NULL,
    CONSTRAINT "teaching_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teaching_class_id_fkey" FOREIGN KEY ("class_id") 
        REFERENCES "public"."school_classes"("id") ON DELETE CASCADE,
    CONSTRAINT "teaching_subject_id_fkey" FOREIGN KEY ("subject_id") 
        REFERENCES "public"."subjects"("id") ON DELETE CASCADE,
    CONSTRAINT "teaching_professor_id_fkey" FOREIGN KEY ("professor_id") 
        REFERENCES "public"."professors"("id") ON DELETE CASCADE,
    CONSTRAINT "teaching_unique_combination" UNIQUE ("class_id", "subject_id", "professor_id")
);

-- Enable RLS on all tables
ALTER TABLE "public"."professors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."school_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teaching" ENABLE ROW LEVEL SECURITY;

-- Create policies for professors
CREATE POLICY "professors_read_policy" ON "public"."professors" 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "professors_insert_policy" ON "public"."professors" 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "professors_update_policy" ON "public"."professors" 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "professors_delete_policy" ON "public"."professors" 
    FOR DELETE TO authenticated USING (true);

-- Create policies for schools
CREATE POLICY "schools_read_policy" ON "public"."schools" 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "schools_insert_policy" ON "public"."schools" 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "schools_update_policy" ON "public"."schools" 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "schools_delete_policy" ON "public"."schools" 
    FOR DELETE TO authenticated USING (true);

-- Create policies for subjects
CREATE POLICY "subjects_read_policy" ON "public"."subjects" 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "subjects_insert_policy" ON "public"."subjects" 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subjects_update_policy" ON "public"."subjects" 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "subjects_delete_policy" ON "public"."subjects" 
    FOR DELETE TO authenticated USING (true);

-- Create policies for school_classes
CREATE POLICY "classes_read_policy" ON "public"."school_classes" 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes_insert_policy" ON "public"."school_classes" 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "classes_update_policy" ON "public"."school_classes" 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "classes_delete_policy" ON "public"."school_classes" 
    FOR DELETE TO authenticated USING (true);

-- Create policies for teaching
CREATE POLICY "teaching_read_policy" ON "public"."teaching" 
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "teaching_insert_policy" ON "public"."teaching" 
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teaching_update_policy" ON "public"."teaching" 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "teaching_delete_policy" ON "public"."teaching" 
    FOR DELETE TO authenticated USING (true); 