-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  birthday DATE,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all members"
ON public.members
FOR SELECT
USING (true);

CREATE POLICY "Users can insert members"
ON public.members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own members"
ON public.members
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own members"
ON public.members
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();