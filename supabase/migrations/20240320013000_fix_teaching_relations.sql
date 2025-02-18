-- Drop existing teaching table
DROP TABLE IF EXISTS "public"."teaching" CASCADE;

-- Create teaching table with correct relations
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
        REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "teaching_unique_combination" UNIQUE ("class_id", "subject_id", "professor_id")
);

-- Enable RLS
ALTER TABLE "public"."teaching" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "teaching_select_policy" ON "public"."teaching";
DROP POLICY IF EXISTS "teaching_insert_policy" ON "public"."teaching";
DROP POLICY IF EXISTS "teaching_update_policy" ON "public"."teaching";
DROP POLICY IF EXISTS "teaching_delete_policy" ON "public"."teaching";

-- Create new policies
CREATE POLICY "teaching_select_policy" ON "public"."teaching" 
    FOR SELECT TO authenticated 
    USING (true);

CREATE POLICY "teaching_insert_policy" ON "public"."teaching" 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "teaching_update_policy" ON "public"."teaching" 
    FOR UPDATE TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "teaching_delete_policy" ON "public"."teaching" 
    FOR DELETE TO authenticated 
    USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "teaching_professor_id_idx" ON "public"."teaching" ("professor_id");
CREATE INDEX IF NOT EXISTS "teaching_class_id_idx" ON "public"."teaching" ("class_id");
CREATE INDEX IF NOT EXISTS "teaching_subject_id_idx" ON "public"."teaching" ("subject_id"); 