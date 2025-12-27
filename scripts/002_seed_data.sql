-- Seed sample teams
INSERT INTO teams (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electrical Team', 'Handles all electrical equipment and systems'),
  ('22222222-2222-2222-2222-222222222222', 'HVAC Team', 'Manages heating, ventilation, and air conditioning'),
  ('33333333-3333-3333-3333-333333333333', 'Plumbing Team', 'Responsible for water systems and plumbing')
ON CONFLICT (id) DO NOTHING;

-- Note: Sample equipment data will be added after authentication is set up
-- This is because equipment requires a created_by user_id reference
