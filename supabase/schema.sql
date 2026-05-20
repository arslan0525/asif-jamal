-- Madarsa Management System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES (Roles & Authentication)
-- ==========================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher', 'accountant')) NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- ==========================================
-- 2. CLASSES
-- ==========================================
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 3. STUDENTS
-- ==========================================
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'graduated')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 4. ATTENDANCE
-- ==========================================
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'leave')) NOT NULL,
  remarks TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, date)
);

-- ==========================================
-- 5. FEES
-- ==========================================
CREATE TABLE fees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  month DATE NOT NULL, -- e.g., '2023-09-01' representing September 2023
  status TEXT CHECK (status IN ('paid', 'pending', 'partial')) DEFAULT 'pending',
  paid_date DATE,
  receipt_number TEXT UNIQUE,
  collected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 6. DONATIONS
-- ==========================================
CREATE TABLE donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_name TEXT,
  donor_phone TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  donation_type TEXT CHECK (donation_type IN ('zakat', 'sadaqah', 'ashar', 'fitrana', 'general', 'kitchen_only')) NOT NULL,
  receipt_number TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  collected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 7. EXPENSES
-- ==========================================
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT CHECK (category IN ('electricity', 'gas', 'water', 'salaries', 'kitchen', 'guests', 'repairs', 'internet', 'other')) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT, -- Link to uploaded bill photo
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 8. KITCHEN INVENTORY
-- ==========================================
CREATE TABLE kitchen_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_name TEXT UNIQUE NOT NULL, -- e.g., 'Rice', 'Flour', 'Sugar'
  unit TEXT NOT NULL, -- e.g., 'kg', 'liters'
  remaining_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(10, 2) NOT NULL DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE kitchen_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES kitchen_inventory(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  remarks TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- RLS (Row Level Security) Policies
-- ==========================================

-- Example: Only accountants and admins can insert fees
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accountants and admins can manage fees" ON fees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'accountant')
    )
  );

-- Example: Teachers can insert attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers and admins can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'teacher')
    )
  );
