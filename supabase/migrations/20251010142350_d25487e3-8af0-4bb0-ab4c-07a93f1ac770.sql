-- Create lab_reports table for storing uploaded reports
CREATE TABLE public.lab_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_url TEXT,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  file_size INTEGER,
  tsh_level DECIMAL,
  t3_level DECIMAL,
  t4_level DECIMAL,
  tsh_status TEXT,
  t3_status TEXT,
  t4_status TEXT,
  ai_summary TEXT,
  ai_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_reports
CREATE POLICY "Users can view their own lab reports" 
ON public.lab_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab reports" 
ON public.lab_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab reports" 
ON public.lab_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab reports" 
ON public.lab_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create health_tracker table for tracking daily health metrics
CREATE TABLE public.health_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tsh_level DECIMAL,
  t3_level DECIMAL,
  t4_level DECIMAL,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  synced_from_report_id UUID REFERENCES public.lab_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for health_tracker
CREATE POLICY "Users can view their own health tracker data" 
ON public.health_tracker 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health tracker entries" 
ON public.health_tracker 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health tracker entries" 
ON public.health_tracker 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health tracker entries" 
ON public.health_tracker 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create reminders table for medication and test reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('medication', 'test', 'appointment', 'other')),
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  synced_from_report_id UUID REFERENCES public.lab_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Users can view their own reminders" 
ON public.reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lab_reports_updated_at
BEFORE UPDATE ON public.lab_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_tracker_updated_at
BEFORE UPDATE ON public.health_tracker
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_tracker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;