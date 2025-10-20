-- Parent-Teacher Contact Notebook Database Schema
-- This schema supports the PRD requirements for a digital communication platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'admin');
CREATE TYPE note_status AS ENUM ('draft', 'published', 'archived');

-- Users table (parents, teachers, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20),
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    student_id VARCHAR(50) UNIQUE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher-Class assignments
CREATE TABLE teacher_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, class_id)
);

-- Daily notes table
CREATE TABLE daily_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    status note_status DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, note_date)
);

-- File attachments for notes
CREATE TABLE note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES daily_notes(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on notes
CREATE TABLE note_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES daily_notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email notifications log
CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES daily_notes(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent'
);

-- Activity logs for admin monitoring
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_daily_notes_student_date ON daily_notes(student_id, note_date);
CREATE INDEX idx_daily_notes_teacher ON daily_notes(teacher_id);
CREATE INDEX idx_note_comments_note ON note_comments(note_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Parents can view their children" ON students
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Teachers can view students in their classes" ON students
    FOR SELECT USING (
        id IN (
            SELECT s.id FROM students s
            JOIN teacher_classes tc ON s.class_id = tc.class_id
            WHERE tc.teacher_id = auth.uid()
        )
    );

-- RLS Policies for daily_notes
CREATE POLICY "Parents can view notes for their children" ON daily_notes
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view notes for their students" ON daily_notes
    FOR SELECT USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN teacher_classes tc ON s.class_id = tc.class_id
            WHERE tc.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert notes for their students" ON daily_notes
    FOR INSERT WITH CHECK (
        teacher_id = auth.uid() AND
        student_id IN (
            SELECT s.id FROM students s
            JOIN teacher_classes tc ON s.class_id = tc.class_id
            WHERE tc.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update their own notes" ON daily_notes
    FOR UPDATE USING (teacher_id = auth.uid());

-- RLS Policies for note_comments
CREATE POLICY "Users can view comments on notes they can access" ON note_comments
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM daily_notes WHERE
            student_id IN (
                SELECT id FROM students WHERE parent_id = auth.uid()
            ) OR
            student_id IN (
                SELECT s.id FROM students s
                JOIN teacher_classes tc ON s.class_id = tc.class_id
                WHERE tc.teacher_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert comments on notes they can access" ON note_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        note_id IN (
            SELECT id FROM daily_notes WHERE
            student_id IN (
                SELECT id FROM students WHERE parent_id = auth.uid()
            ) OR
            student_id IN (
                SELECT s.id FROM students s
                JOIN teacher_classes tc ON s.class_id = tc.class_id
                WHERE tc.teacher_id = auth.uid()
            )
        )
    );

-- RLS Policies for note_attachments
CREATE POLICY "Users can view attachments for notes they can access" ON note_attachments
    FOR SELECT USING (
        note_id IN (
            SELECT id FROM daily_notes WHERE
            student_id IN (
                SELECT id FROM students WHERE parent_id = auth.uid()
            ) OR
            student_id IN (
                SELECT s.id FROM students s
                JOIN teacher_classes tc ON s.class_id = tc.class_id
                WHERE tc.teacher_id = auth.uid()
            )
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON daily_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_comments_updated_at BEFORE UPDATE ON note_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
INSERT INTO users (phone_number, password_hash, first_name, last_name, role)
VALUES ('0501234567', '1234', 'Demo', 'Parent', 'parent');
