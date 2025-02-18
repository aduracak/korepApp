-- Dodajemo funkcije za brojanje
CREATE OR REPLACE FUNCTION get_school_counts(school_id UUID)
RETURNS TABLE (
    classes_count BIGINT,
    subjects_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM school_classes WHERE school_id = $1),
        (SELECT COUNT(DISTINCT subject_id) FROM professor_schools WHERE school_id = $1);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_subject_counts(subject_id UUID)
RETURNS TABLE (
    schools_count BIGINT,
    professors_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(DISTINCT school_id) FROM professor_schools WHERE subject_id = $1),
        (SELECT COUNT(DISTINCT professor_id) FROM professor_schools WHERE subject_id = $1);
END;
$$ LANGUAGE plpgsql;

-- Kreiramo teaching_schedules tabelu
CREATE TABLE IF NOT EXISTS teaching_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    classes_per_week INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(school_id, subject_id, professor_id)
);

-- Dodajemo RLS politike za teaching_schedules
ALTER TABLE teaching_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teaching schedules are viewable by authenticated users"
    ON teaching_schedules FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Teaching schedules can be inserted by authenticated users"
    ON teaching_schedules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Dodajemo trigger za ažuriranje updated_at
CREATE TRIGGER update_teaching_schedules_updated_at
    BEFORE UPDATE ON teaching_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 