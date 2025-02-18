-- Create professor_schools table
CREATE TABLE public.professor_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.professor_schools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
    ON public.professor_schools FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON public.professor_schools FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on professor_id"
    ON public.professor_schools FOR UPDATE
    USING (auth.uid() = professor_id);

CREATE POLICY "Enable delete for users based on professor_id"
    ON public.professor_schools FOR DELETE
    USING (auth.uid() = professor_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.professor_schools
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 