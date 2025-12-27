-- Drop existing tables if they exist
DROP TABLE IF EXISTS maintenance_comments CASCADE;
DROP TABLE IF EXISTS maintenance_notifications CASCADE;
DROP TABLE IF EXISTS maintenance_history CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS maintenance_teams CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Teams table
CREATE TABLE maintenance_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members junction table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  category TEXT NOT NULL,
  department TEXT,
  purchase_date DATE,
  warranty_details TEXT,
  physical_location TEXT,
  health_percentage INTEGER DEFAULT 100 CHECK (health_percentage >= 0 AND health_percentage <= 100),
  assigned_team_id UUID REFERENCES maintenance_teams(id) ON DELETE SET NULL,
  default_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'scrap')),
  scrap_note TEXT,
  scrap_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Requests table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  category TEXT,
  maintenance_team_id UUID REFERENCES maintenance_teams(id) ON DELETE SET NULL,
  assigned_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('corrective', 'preventive')),
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'in_progress', 'repaired', 'scrap')),
  scheduled_date TIMESTAMPTZ,
  duration_hours DECIMAL(10, 2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  company TEXT DEFAULT 'My Company',
  is_overdue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance History table
CREATE TABLE maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  performed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE maintenance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE maintenance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_team ON equipment(assigned_team_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_health ON equipment(health_percentage);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_technician ON maintenance_requests(assigned_technician_id);
CREATE INDEX idx_requests_team ON maintenance_requests(maintenance_team_id);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_history_equipment ON maintenance_history(equipment_id);
CREATE INDEX idx_comments_request ON maintenance_comments(request_id);
CREATE INDEX idx_notifications_user ON maintenance_notifications(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Everyone can view teams" ON maintenance_teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON maintenance_teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update teams" ON maintenance_teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete teams" ON maintenance_teams FOR DELETE USING (auth.role() = 'authenticated');

-- Team members policies
CREATE POLICY "Everyone can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add team members" ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can remove team members" ON team_members FOR DELETE USING (auth.role() = 'authenticated');

-- Equipment policies
CREATE POLICY "Everyone can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create equipment" ON equipment FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update equipment" ON equipment FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete equipment" ON equipment FOR DELETE USING (auth.role() = 'authenticated');

-- Maintenance requests policies
CREATE POLICY "Everyone can view requests" ON maintenance_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create requests" ON maintenance_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update requests" ON maintenance_requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete requests" ON maintenance_requests FOR DELETE USING (auth.role() = 'authenticated');

-- Maintenance history policies
CREATE POLICY "Everyone can view history" ON maintenance_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create history" ON maintenance_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comments policies
CREATE POLICY "Everyone can view comments" ON maintenance_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON maintenance_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON maintenance_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON maintenance_comments FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON maintenance_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create notifications" ON maintenance_notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications" ON maintenance_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON maintenance_notifications FOR DELETE USING (auth.uid() = user_id);

-- Triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON maintenance_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'technician')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update overdue status
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scheduled_date IS NOT NULL AND NEW.scheduled_date < NOW() AND NEW.stage NOT IN ('repaired', 'scrap') THEN
    NEW.is_overdue = TRUE;
  ELSE
    NEW.is_overdue = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_overdue_status BEFORE INSERT OR UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_overdue_status();
