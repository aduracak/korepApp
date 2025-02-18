-- Create topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id),
    name TEXT NOT NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisites JSONB,
    is_current_in_school BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create tests table
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    topics JSONB,
    recommended_prep_time INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create tutoring_sessions table
CREATE TABLE tutoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id),
    professor_id UUID REFERENCES profiles(id),
    subject_id UUID REFERENCES subjects(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    type TEXT NOT NULL CHECK (type IN ('individual', 'group', 'self_study')),
    location TEXT NOT NULL CHECK (location IN ('online', 'in_person')),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'paused', 'completed')),
    topics JSONB,
    study_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create session_timers table
CREATE TABLE session_timers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES tutoring_sessions(id),
    elapsed_time INTEGER DEFAULT 0, -- in seconds
    is_paused BOOLEAN DEFAULT false,
    last_pause TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create learning_progress table
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id),
    topic_id UUID REFERENCES topics(id),
    tutoring_session_id UUID REFERENCES tutoring_sessions(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Topics policies
CREATE POLICY "Topics are viewable by everyone"
    ON topics FOR SELECT
    USING (true);

-- Tests policies
CREATE POLICY "Tests are viewable by authenticated users"
    ON tests FOR SELECT
    USING (auth.role() = 'authenticated');

-- Tutoring sessions policies
CREATE POLICY "Users can view their own tutoring sessions"
    ON tutoring_sessions FOR SELECT
    USING (auth.uid() = student_id OR auth.uid() = professor_id);

CREATE POLICY "Students can create their own tutoring sessions"
    ON tutoring_sessions FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own tutoring sessions"
    ON tutoring_sessions FOR UPDATE
    USING (auth.uid() = student_id OR auth.uid() = professor_id);

-- Session timers policies
CREATE POLICY "Users can view their session timers"
    ON session_timers FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tutoring_sessions
        WHERE tutoring_sessions.id = session_timers.session_id
        AND (tutoring_sessions.student_id = auth.uid() OR tutoring_sessions.professor_id = auth.uid())
    ));

CREATE POLICY "Users can update their session timers"
    ON session_timers FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM tutoring_sessions
        WHERE tutoring_sessions.id = session_timers.session_id
        AND (tutoring_sessions.student_id = auth.uid() OR tutoring_sessions.professor_id = auth.uid())
    ));

-- Learning progress policies
CREATE POLICY "Users can view their learning progress"
    ON learning_progress FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can create their learning progress"
    ON learning_progress FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
    BEFORE UPDATE ON tests
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tutoring_sessions_updated_at
    BEFORE UPDATE ON tutoring_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_session_timers_updated_at
    BEFORE UPDATE ON session_timers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 