-- Prvo uklanjamo sve postojeće politike za schools tabelu
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON schools;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON schools;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;

-- Kreiramo nove politike
CREATE POLICY "Enable read access for all users"
    ON schools FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON schools FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own schools"
    ON schools FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM professor_schools
            WHERE professor_schools.school_id = schools.id
            AND professor_schools.professor_id = auth.uid()
        )
    );

CREATE POLICY "Enable delete for own schools"
    ON schools FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM professor_schools
            WHERE professor_schools.school_id = schools.id
            AND professor_schools.professor_id = auth.uid()
        )
    );

-- Provjeravamo da li je RLS omogućen
ALTER TABLE schools ENABLE ROW LEVEL SECURITY; 