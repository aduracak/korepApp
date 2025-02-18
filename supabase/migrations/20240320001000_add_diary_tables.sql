-- Create schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create professor_schools table (many-to-many relationship)
CREATE TABLE professor_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES profiles(id),
    school_id UUID REFERENCES schools(id),
    subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(professor_id, school_id, subject_id)
);

-- Create school_classes table
CREATE TABLE school_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    name TEXT NOT NULL, -- e.g., "I-1", "II-2"
    year INTEGER NOT NULL, -- 1, 2, 3, 4
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create class_students table
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES school_classes(id),
    student_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(class_id, student_id)
);

-- Create diary_entries table
CREATE TABLE diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID REFERENCES profiles(id),
    school_id UUID REFERENCES schools(id),
    class_id UUID REFERENCES school_classes(id),
    subject_id UUID REFERENCES subjects(id),
    date DATE NOT NULL,
    period_number INTEGER NOT NULL, -- redni broj časa u danu (1-7)
    lesson_number INTEGER NOT NULL, -- redni broj časa u godini
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lesson_title TEXT NOT NULL,
    lesson_type TEXT NOT NULL CHECK (lesson_type IN ('lecture', 'exercise', 'review', 'test', 'written_exam')),
    curriculum_unit TEXT,
    lesson_plan TEXT,
    homework TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create absent_students table
CREATE TABLE absent_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diary_entry_id UUID REFERENCES diary_entries(id),
    student_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(diary_entry_id, student_id)
);

-- Add RLS policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE absent_students ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Schools are viewable by authenticated users"
    ON schools FOR SELECT
    USING (auth.role() = 'authenticated');

-- Professor schools policies
CREATE POLICY "Professors can view their schools"
    ON professor_schools FOR SELECT
    USING (auth.uid() = professor_id);

CREATE POLICY "Professors can insert their schools"
    ON professor_schools FOR INSERT
    WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professors can delete their schools"
    ON professor_schools FOR DELETE
    USING (auth.uid() = professor_id);

-- School classes policies
CREATE POLICY "Classes are viewable by authenticated users"
    ON school_classes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Class students policies
CREATE POLICY "Class students are viewable by authenticated users"
    ON class_students FOR SELECT
    USING (auth.role() = 'authenticated');

-- Diary entries policies
CREATE POLICY "Professors can view their diary entries"
    ON diary_entries FOR SELECT
    USING (auth.uid() = professor_id);

CREATE POLICY "Professors can insert their diary entries"
    ON diary_entries FOR INSERT
    WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professors can update their diary entries"
    ON diary_entries FOR UPDATE
    USING (auth.uid() = professor_id);

-- Absent students policies
CREATE POLICY "Users can view absent students for their diary entries"
    ON absent_students FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM diary_entries
        WHERE diary_entries.id = absent_students.diary_entry_id
        AND diary_entries.professor_id = auth.uid()
    ));

CREATE POLICY "Users can insert absent students for their diary entries"
    ON absent_students FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM diary_entries
        WHERE diary_entries.id = absent_students.diary_entry_id
        AND diary_entries.professor_id = auth.uid()
    ));

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_professor_schools_updated_at
    BEFORE UPDATE ON professor_schools
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_school_classes_updated_at
    BEFORE UPDATE ON school_classes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_class_students_updated_at
    BEFORE UPDATE ON class_students
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at
    BEFORE UPDATE ON diary_entries
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_absent_students_updated_at
    BEFORE UPDATE ON absent_students
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 