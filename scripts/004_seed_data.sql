-- Insert sample teams
INSERT INTO maintenance_teams (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mechanics', 'Mechanical maintenance and repair'),
  ('22222222-2222-2222-2222-222222222222', 'Electricians', 'Electrical systems and wiring'),
  ('33333333-3333-3333-3333-333333333333', 'IT Support', 'Computer and IT equipment maintenance');

-- Insert sample equipment
INSERT INTO equipment (equipment_name, serial_number, category, department, purchase_date, warranty_details, physical_location, health_percentage, assigned_team_id, status) VALUES
  ('Industrial Compressor A1', 'COMP-2023-001', 'Machinery', 'Production', '2023-01-15', '2 years warranty', 'Building A, Floor 1', 85, '11111111-1111-1111-1111-111111111111', 'operational'),
  ('Server Rack SR-05', 'SRV-2022-005', 'Computer', 'IT Department', '2022-06-10', '3 years warranty', 'Data Center, Room 2', 25, '33333333-3333-3333-3333-333333333333', 'operational'),
  ('CNC Machine M200', 'CNC-2021-200', 'Machinery', 'Manufacturing', '2021-03-20', 'Expired', 'Building B, Floor 2', 70, '11111111-1111-1111-1111-111111111111', 'operational'),
  ('Electrical Panel EP-12', 'ELEC-2023-012', 'Electrical', 'Utilities', '2023-09-01', '5 years warranty', 'Building C, Basement', 90, '22222222-2222-2222-2222-222222222222', 'operational'),
  ('HVAC Unit H3', 'HVAC-2020-003', 'Climate Control', 'Facilities', '2020-05-15', 'Expired', 'Building A, Roof', 60, '11111111-1111-1111-1111-111111111111', 'operational');
