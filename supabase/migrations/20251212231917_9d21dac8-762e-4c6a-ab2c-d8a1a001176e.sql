-- Create gallery_albums table for organizing images
CREATE TABLE public.gallery_albums (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gallery_albums
CREATE POLICY "Anyone can view gallery albums"
ON public.gallery_albums
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert gallery albums"
ON public.gallery_albums
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update gallery albums"
ON public.gallery_albums
FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete gallery albums"
ON public.gallery_albums
FOR DELETE
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Add album_id column to gallery_images
ALTER TABLE public.gallery_images 
ADD COLUMN album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL;

-- Create trigger for updating timestamps
CREATE TRIGGER update_gallery_albums_updated_at
BEFORE UPDATE ON public.gallery_albums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default albums
INSERT INTO public.gallery_albums (name, description, created_by) VALUES
('Sunday Service', 'Photos from our weekly Sunday worship services', '3f8f1d51-7f4f-452c-afb0-bd7e175088b2'),
('Youth Events', 'Photos from youth ministry activities and events', '3f8f1d51-7f4f-452c-afb0-bd7e175088b2'),
('Special Programs', 'Photos from special church programs and celebrations', '3f8f1d51-7f4f-452c-afb0-bd7e175088b2');