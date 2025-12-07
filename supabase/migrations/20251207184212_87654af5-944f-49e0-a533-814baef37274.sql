-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  attendance_date DATE NOT NULL,
  total_members INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  absent_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance_records
CREATE POLICY "Users can view all attendance records" 
ON public.attendance_records 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert attendance records" 
ON public.attendance_records 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance records" 
ON public.attendance_records 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance records" 
ON public.attendance_records 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for attendance files
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-files', 'attendance-files', false);

-- Storage policies for attendance files
CREATE POLICY "Authenticated users can view attendance files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attendance-files');

CREATE POLICY "Users can upload attendance files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attendance-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attendance files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attendance-files' AND auth.uid()::text = (storage.foldername(name))[1]);