-- ============================================
-- GearGuard Clean Database Schema
-- ============================================
-- This script creates a clean database schema for GearGuard
-- Run this to reset and properly configure the database

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- 1. PROFILES TABLE - User information
-- ============================================
-- Update check constraint for roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'manager', 'technician'));

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.profiles;

-- Recreate RLS policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile during signup"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. TRIGGER - Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'technician')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. TEAMS TABLE - Team management
-- ============================================
-- Drop old RLS policies
DROP POLICY IF EXISTS "All authenticated users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can create teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can update teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can delete teams" ON public.teams;

-- Recreate RLS policies for teams
CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. MAINTENANCE_REQUESTS TABLE - Fix constraints
-- ============================================
-- Update status check constraint
ALTER TABLE public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;
ALTER TABLE public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_stage_check;
ALTER TABLE public.maintenance_requests ADD CONSTRAINT maintenance_requests_status_check 
  CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

-- Update priority check constraint
ALTER TABLE public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_priority_check;
ALTER TABLE public.maintenance_requests ADD CONSTRAINT maintenance_requests_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Drop and recreate RLS policies for maintenance_requests
DROP POLICY IF EXISTS "Everyone can view requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Authenticated users can update requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Authenticated users can delete requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Anyone can view requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Anyone can create requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Anyone can update requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Anyone can delete requests" ON public.maintenance_requests;

CREATE POLICY "Anyone can view requests"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create requests"
  ON public.maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update requests"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete requests"
  ON public.maintenance_requests FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. EQUIPMENT TABLE - RLS Policies
-- ============================================
-- Drop and recreate RLS policies for equipment
DROP POLICY IF EXISTS "Everyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can create equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can delete equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can create equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can delete equipment" ON public.equipment;

CREATE POLICY "Anyone can view equipment"
  ON public.equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create equipment"
  ON public.equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update equipment"
  ON public.equipment FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete equipment"
  ON public.equipment FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 6. TEAM_MEMBERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Everyone can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can add team members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated users can remove team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can add team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can remove team members" ON public.team_members;

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can add team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can remove team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 7. OTHER TABLES - Simplified RLS
-- ============================================

-- Comments table
DROP POLICY IF EXISTS "All authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "All authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;

CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Maintenance history
DROP POLICY IF EXISTS "Everyone can view history" ON public.maintenance_history;
DROP POLICY IF EXISTS "Authenticated users can create history" ON public.maintenance_history;
DROP POLICY IF EXISTS "Anyone can view history" ON public.maintenance_history;
DROP POLICY IF EXISTS "Anyone can create history" ON public.maintenance_history;

CREATE POLICY "Anyone can view history"
  ON public.maintenance_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create history"
  ON public.maintenance_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- DONE! Schema is now clean and consistent
-- ============================================
