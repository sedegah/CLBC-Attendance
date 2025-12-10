-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public can view all gallery images
CREATE POLICY "Anyone can view gallery images"
ON public.gallery_images
FOR SELECT
USING (true);

-- Only admins can insert gallery images
CREATE POLICY "Admins can insert gallery images"
ON public.gallery_images
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete gallery images
CREATE POLICY "Admins can delete gallery images"
ON public.gallery_images
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));