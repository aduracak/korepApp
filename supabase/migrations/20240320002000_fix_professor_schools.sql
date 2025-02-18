-- Drop existing table if exists
DROP TABLE IF EXISTS public.professor_schools CASCADE;

-- Create professor_schools table
CREATE TABLE public.professor_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(professor_id, school_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.professor_schools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Professors can view their schools"
    ON public.professor_schools FOR SELECT
    USING (auth.uid() = professor_id);

CREATE POLICY "Professors can insert their schools"
    ON public.professor_schools FOR INSERT
    WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professors can delete their schools"
    ON public.professor_schools FOR DELETE
    USING (auth.uid() = professor_id);

-- Create updated_at trigger
CREATE TRIGGER update_professor_schools_updated_at
    BEFORE UPDATE ON public.professor_schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 