-- Create work_centers table
CREATE TABLE IF NOT EXISTS public.work_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_center_name TEXT NOT NULL,
  code TEXT,
  tag TEXT,
  alternative_workcenters TEXT,
  cost_per_hour NUMERIC(10, 2),
  capacity NUMERIC(10, 2),
  time_efficiency NUMERIC(10, 2),
  oee_target NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add work_center_id to maintenance_requests
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES public.work_centers(id);

-- Add maintenance_for field to specify if it's for equipment or work center
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS maintenance_for TEXT CHECK (maintenance_for IN ('equipment', 'work_center'));

-- Enable RLS
ALTER TABLE public.work_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_centers
CREATE POLICY "Everyone can view work centers"
  ON public.work_centers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create work centers"
  ON public.work_centers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update work centers"
  ON public.work_centers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete work centers"
  ON public.work_centers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_work_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_centers_updated_at
  BEFORE UPDATE ON public.work_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_work_centers_updated_at();

-- Insert sample data
INSERT INTO public.work_centers (work_center_name, capacity, time_efficiency, oee_target) VALUES
  ('Assembly 1', 1.00, 100.00, 34.59),
  ('Drill 1', 1.00, 100.00, 90.00)
ON CONFLICT DO NOTHING;
