-- ====================================================================
-- AI-Based Student Attendance Prediction and Risk Detection System
-- Production PostgreSQL Database Schema & Row Level Security Policies
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'administrator', 'teacher', 'student', 'parent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status_enum AS ENUM ('present', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trend_direction_enum AS ENUM ('improving', 'declining', 'stable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    institution_id UUID,
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INSTITUTIONS TABLE (for Super Admin)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT,
    state TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PARENTS TABLE
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL CHECK (relationship IN ('Father', 'Mother', 'Guardian')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 12),
    academic_year TEXT NOT NULL,
    class_teacher_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link class teacher foreign key
ALTER TABLE public.classes 
    ADD CONSTRAINT fk_class_teacher 
    FOREIGN KEY (class_teacher_id) 
    REFERENCES public.teachers(id) 
    ON DELETE SET NULL;

-- 8. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    roll_number TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 12),
    admission_year INTEGER NOT NULL,
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, subject_id, academic_year)
);

-- 11. TEACHER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, class_id, subject_id, academic_year)
);

-- 12. ATTENDANCE TABLE (With strict uniqueness)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL,
    status attendance_status_enum NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Strict Unique constraint: Never allow 2 attendance records for same student+class+subject+date
    CONSTRAINT unique_student_class_subject_date UNIQUE (student_id, class_id, subject_id, attendance_date)
);

-- 13. ATTENDANCE SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    total_classes INTEGER NOT NULL DEFAULT 0,
    present_classes INTEGER NOT NULL DEFAULT 0,
    absent_classes INTEGER NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_summary_student_subject UNIQUE (student_id, subject_id)
);

-- 14. RISK ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recent_attendance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    recent_absences INTEGER NOT NULL DEFAULT 0,
    consecutive_absences INTEGER NOT NULL DEFAULT 0,
    attendance_trend trend_direction_enum NOT NULL DEFAULT 'stable',
    predicted_attendance NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level_enum NOT NULL DEFAULT 'LOW',
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_risk_assessment_student UNIQUE (student_id)
);

-- 15. PREDICTIONS TABLE (Ready for future ML service)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    prediction_period TEXT NOT NULL DEFAULT 'Semester End',
    predicted_attendance NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 85.00 CHECK (confidence >= 0 AND confidence <= 100),
    predicted_risk_level risk_level_enum NOT NULL DEFAULT 'LOW',
    algorithm_version TEXT NOT NULL DEFAULT 'rule-based-v1',
    trend trend_direction_enum NOT NULL DEFAULT 'stable',
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'attendance',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_subject ON public.attendance(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher ON public.attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON public.risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_student ON public.alerts(student_id, is_read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Profiles view policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        public.get_auth_role() IN ('super_admin', 'administrator', 'teacher')
    );

CREATE POLICY "Profiles update policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        public.get_auth_role() IN ('super_admin', 'administrator')
    );

-- Students:
CREATE POLICY "Students view policy" ON public.students
    FOR SELECT USING (
        profile_id = auth.uid() OR
        public.get_auth_role() IN ('super_admin', 'administrator') OR
        (public.get_auth_role() = 'teacher' AND class_id IN (
            SELECT class_id FROM public.teacher_assignments ta 
            JOIN public.teachers t ON t.id = ta.teacher_id 
            WHERE t.profile_id = auth.uid()
        )) OR
        (public.get_auth_role() = 'parent' AND parent_id IN (
            SELECT id FROM public.parents WHERE profile_id = auth.uid()
        ))
    );

-- Attendance:
CREATE POLICY "Attendance view policy" ON public.attendance
    FOR SELECT USING (
        public.get_auth_role() IN ('super_admin', 'administrator') OR
        (public.get_auth_role() = 'student' AND student_id IN (
            SELECT id FROM public.students WHERE profile_id = auth.uid()
        )) OR
        (public.get_auth_role() = 'parent' AND student_id IN (
            SELECT s.id FROM public.students s 
            JOIN public.parents p ON p.id = s.parent_id 
            WHERE p.profile_id = auth.uid()
        )) OR
        (public.get_auth_role() = 'teacher' AND class_id IN (
            SELECT class_id FROM public.teacher_assignments ta 
            JOIN public.teachers t ON t.id = ta.teacher_id 
            WHERE t.profile_id = auth.uid()
        ))
    );

CREATE POLICY "Teacher insert attendance policy" ON public.attendance
    FOR INSERT WITH CHECK (
        public.get_auth_role() IN ('super_admin', 'administrator') OR
        (public.get_auth_role() = 'teacher' AND EXISTS (
            SELECT 1 FROM public.teacher_assignments ta
            JOIN public.teachers t ON t.id = ta.teacher_id
            WHERE t.profile_id = auth.uid() 
              AND ta.class_id = class_id 
              AND ta.subject_id = subject_id
        ))
    );

CREATE POLICY "Teacher update attendance policy" ON public.attendance
    FOR UPDATE USING (
        public.get_auth_role() IN ('super_admin', 'administrator') OR
        (public.get_auth_role() = 'teacher' AND EXISTS (
            SELECT 1 FROM public.teacher_assignments ta
            JOIN public.teachers t ON t.id = ta.teacher_id
            WHERE t.profile_id = auth.uid() 
              AND ta.class_id = class_id 
              AND ta.subject_id = subject_id
        ))
    );
