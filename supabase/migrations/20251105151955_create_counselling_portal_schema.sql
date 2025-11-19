/*
  # Counselling Portal Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text: 'student', 'teacher', 'admin')
      - `card_number` (text, nullable, for students)
      - `course` (text, nullable, for students)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `teacher_routines`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, references profiles)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `counselling_bookings`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `teacher_id` (uuid, references profiles)
      - `student_name` (text)
      - `card_number` (text)
      - `course` (text)
      - `subject` (text)
      - `description` (text)
      - `booking_date` (date)
      - `booking_time` (time)
      - `status` (text: 'pending', 'approved', 'rejected', 'completed')
      - `teacher_notes` (text, nullable)
      - `notification_sent` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for profiles: users can read all profiles, update own profile
    - Policies for teacher_routines: teachers can manage own routines, students can view all routines
    - Policies for counselling_bookings: students can create and view own bookings, teachers can view and update bookings assigned to them, admins can view all
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  card_number text,
  course text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS teacher_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teacher_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own routines"
  ON teacher_routines FOR ALL
  TO authenticated
  USING (
    auth.uid() = teacher_id
  )
  WITH CHECK (
    auth.uid() = teacher_id
  );

CREATE POLICY "Students can view teacher routines"
  ON teacher_routines FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS counselling_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  card_number text NOT NULL,
  course text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  teacher_notes text,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE counselling_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings"
  ON counselling_bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
  );

CREATE POLICY "Students can create bookings"
  ON counselling_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
  );

CREATE POLICY "Teachers can view their bookings"
  ON counselling_bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = teacher_id
  );

CREATE POLICY "Teachers can update their bookings"
  ON counselling_bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = teacher_id
  )
  WITH CHECK (
    auth.uid() = teacher_id
  );

CREATE POLICY "Admins can view all bookings"
  ON counselling_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_teacher_routines_teacher ON teacher_routines(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON counselling_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON counselling_bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON counselling_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON counselling_bookings(status);