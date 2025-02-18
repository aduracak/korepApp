-- Drop existing table if exists
DROP TABLE IF EXISTS teaching_schedules CASCADE;

-- Create teaching_schedules table
CREATE TABLE teaching_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    classes_per_week INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(school_id, subject_id, professor_id)
);

-- Enable RLS
ALTER TABLE teaching_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
    ON teaching_schedules FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON teaching_schedules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own schedules"
    ON teaching_schedules FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        (professor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM professor_schools
            WHERE professor_schools.school_id = teaching_schedules.school_id
            AND professor_schools.professor_id = auth.uid()
        ))
    );

CREATE POLICY "Enable delete for own schedules"
    ON teaching_schedules FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        (professor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM professor_schools
            WHERE professor_schools.school_id = teaching_schedules.school_id
            AND professor_schools.professor_id = auth.uid()
        ))
    );

-- Create indexes for better performance
CREATE INDEX idx_teaching_schedules_school ON teaching_schedules(school_id);
CREATE INDEX idx_teaching_schedules_subject ON teaching_schedules(subject_id);
CREATE INDEX idx_teaching_schedules_professor ON teaching_schedules(professor_id); 