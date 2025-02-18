-- Drop conflicting policies
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "Professors can view their schools" ON professor_schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON professor_schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON school_classes;

-- Create unified policies for schools
CREATE POLICY "Enable read access for all users"
    ON schools FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON schools FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
    ON schools FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create unified policies for professor_schools
CREATE POLICY "Enable read access for all users"
    ON professor_schools FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON professor_schools FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
    ON professor_schools FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create unified policies for school_classes
CREATE POLICY "Enable read access for all users"
    ON school_classes FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON school_classes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
    ON school_classes FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create unified policies for class_students
CREATE POLICY "Enable read access for all users"
    ON class_students FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON class_students FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create unified policies for class_subjects
CREATE POLICY "Enable read access for all users"
    ON class_subjects FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON class_subjects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create unified policies for teaching_schedules
CREATE POLICY "Enable read access for all users"
    ON teaching_schedules FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON teaching_schedules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
    ON teaching_schedules FOR UPDATE
    USING (auth.role() = 'authenticated'); 