/*
  # Create events table for EventMapper application

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `description` (text, optional)
      - `date` (date, required)
      - `time` (text, required - HH:MM format)
      - `location_name` (text, required)
      - `location_address` (text, required)
      - `location_lat` (double precision, required)
      - `location_lng` (double precision, required)
      - `category` (text, required)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `events` table
    - Add policies for authenticated users to manage their own events only
    - Users can SELECT, INSERT, UPDATE, DELETE their own events
    - Foreign key constraint ensures data integrity with auth.users

  3. Notes
    - Location data is stored as separate fields for name, address, and coordinates
    - Category field supports: work, personal, social, health, hobby, other
    - All operations are user-scoped for data privacy and security
*/

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time text NOT NULL,
  location_name text NOT NULL,
  location_address text NOT NULL,
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  category text NOT NULL CHECK (category IN ('work', 'personal', 'social', 'health', 'hobby', 'other')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can view their own events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS events_user_id_idx ON public.events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);