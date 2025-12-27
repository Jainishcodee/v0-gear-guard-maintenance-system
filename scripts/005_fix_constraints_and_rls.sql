-- Fix the status check constraint to match what the database expects
-- The live schema shows status column exists, so let's ensure it accepts the right values

-- First, let's see what constraints exist and potentially drop/recreate them
ALTER TABLE maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_status_check;

-- Add the correct status check constraint
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_status_check 
  CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

-- Update any existing 'new' status to 'open'
UPDATE maintenance_requests SET status = 'open' WHERE status = 'new';

-- Fix teams RLS policies - allow all authenticated users to create teams
-- The original policy was too restrictive
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON teams;
DROP POLICY IF EXISTS "Admins and managers can manage teams (ALL)" ON teams;

-- Create more permissive policies for teams
CREATE POLICY "All authenticated users can create teams" 
  ON teams FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update teams" 
  ON teams FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can delete teams" 
  ON teams FOR DELETE 
  TO authenticated
  USING (true);

-- Similarly, ensure team_members has correct policies
DROP POLICY IF EXISTS "Admins and managers can manage team members (ALL)" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can add team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can remove team members" ON team_members;

CREATE POLICY "All authenticated users can add team members" 
  ON team_members FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can remove team members" 
  ON team_members FOR DELETE 
  TO authenticated
  USING (true);
