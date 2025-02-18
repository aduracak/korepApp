-- Prvo uklanjamo sve postojeće politike
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Professors can view their schools" ON professor_schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON professor_schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON school_classes;

-- Kreiramo nove politike za schools tabelu
CREATE POLICY "Enable read access for all users" ON schools
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON schools
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON schools
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON schools
    FOR DELETE USING (auth.role() = 'authenticated');

-- Kreiramo nove politike za professor_schools tabelu
CREATE POLICY "Enable read access for all users" ON professor_schools
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON professor_schools
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON professor_schools
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON professor_schools
    FOR DELETE USING (auth.role() = 'authenticated');

-- Kreiramo nove politike za school_classes tabelu
CREATE POLICY "Enable read access for all users" ON school_classes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON school_classes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON school_classes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON school_classes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Kreiramo nove politike za teaching_schedules tabelu
CREATE POLICY "Enable read access for all users" ON teaching_schedules
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON teaching_schedules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON teaching_schedules
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON teaching_schedules
    FOR DELETE USING (auth.role() = 'authenticated');

-- Dodajemo potrebne relacije i indekse
ALTER TABLE school_classes
    ADD CONSTRAINT fk_school_classes_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE CASCADE;

ALTER TABLE professor_schools
    ADD CONSTRAINT fk_professor_schools_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE CASCADE;

ALTER TABLE teaching_schedules
    ADD CONSTRAINT fk_teaching_schedules_school
    FOREIGN KEY (school_id)
    REFERENCES schools(id)
    ON DELETE CASCADE;

-- Dodajemo indekse za bolje performanse
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_professor_schools_school_id ON professor_schools(school_id);
CREATE INDEX IF NOT EXISTS idx_professor_schools_subject_id ON professor_schools(subject_id);
CREATE INDEX IF NOT EXISTS idx_school_classes_school_id ON school_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teaching_schedules_school_id ON teaching_schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_teaching_schedules_subject_id ON teaching_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_teaching_schedules_professor_id ON teaching_schedules(professor_id); 