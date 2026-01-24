-- Complete schema for faith-flow-tool
-- This file combines all migrations in order

-- Migration 1: Create enum for user roles and base tables
CREATE TYPE public.app_role AS ENUM ('admin', 'pastor', 'member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'member' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'member');
  
  RETURN new;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration 2: Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration 3: Create attendance_records table
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

-- Migration 4: Create members table
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

-- Migration 5: Create member_attendance table
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

-- Migration 6: Create gallery_images table
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

-- Migration 7: Create gallery_albums table and add album_id to gallery_images
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
