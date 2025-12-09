-- Create table to track individual member attendance
CREATE TABLE public.member_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attendance_record_id, member_id)
);

-- Enable RLS
ALTER TABLE public.member_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all member attendance" 
ON public.member_attendance 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert member attendance" 
ON public.member_attendance 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.attendance_records ar 
    WHERE ar.id = attendance_record_id AND ar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update member attendance" 
ON public.member_attendance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.attendance_records ar 
    WHERE ar.id = attendance_record_id AND ar.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete member attendance" 
ON public.member_attendance 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.attendance_records ar 
    WHERE ar.id = attendance_record_id AND ar.user_id = auth.uid()
  )
);