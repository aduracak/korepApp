-- Drop existing profiles table if exists
DROP TABLE IF EXISTS "public"."profiles" CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "role" text NOT NULL,
    "parent_names" text,
    "parent_phone" text,
    "subject" text,
    "school" text,
    "grades" text[],
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_email_key" UNIQUE ("email")
);

-- Enable RLS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_insert_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_delete_policy" ON "public"."profiles";

-- Create policies
CREATE POLICY "profiles_select_policy" ON "public"."profiles" 
    FOR SELECT TO authenticated 
    USING (true);

CREATE POLICY "profiles_insert_policy" ON "public"."profiles" 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON "public"."profiles" 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON "public"."profiles" 
    FOR DELETE TO authenticated 
    USING (auth.uid() = id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "public"."profiles" ("role");
CREATE INDEX IF NOT EXISTS "profiles_email_idx" ON "public"."profiles" ("email");

-- Grant permissions
GRANT ALL ON "public"."profiles" TO authenticated;
GRANT ALL ON "public"."profiles" TO service_role;

-- Insert test professor if needed (optional)
-- INSERT INTO "public"."profiles" (id, first_name, last_name, email, role)
-- VALUES 
--     (gen_random_uuid(), 'Test', 'Professor', 'test.professor@example.com', 'professor')
-- ON CONFLICT (email) DO NOTHING; 