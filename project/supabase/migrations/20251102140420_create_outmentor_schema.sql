/*
  # OutMentor Database Schema

  ## Overview
  Complete database schema for OutMentor platform connecting FTC/FLL mentors and teams.

  ## New Tables

  ### profiles
  - `id` (uuid, pk) - References auth.users
  - `user_type` (text) - 'mentor' or 'team'
  - `full_name` (text) - Full name or team name
  - `email` (text) - User email
  - `birth_date` (date) - For mentors only
  - `state` (text) - Brazilian state
  - `city` (text) - City name
  - `linkedin_url` (text) - LinkedIn profile (optional)
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - Profile description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### mentor_details
  - `profile_id` (uuid, pk, fk) - References profiles
  - `mentor_ftc` (boolean) - Mentors FTC
  - `mentor_fll` (boolean) - Mentors FLL
  - `knowledge_areas` (jsonb) - Array of expertise areas

  ### team_details
  - `profile_id` (uuid, pk, fk) - References profiles
  - `team_number` (text) - Official team number (e.g., #21069)
  - `team_type` (text) - 'FTC' or 'FLL'
  - `interest_areas` (jsonb) - Areas seeking mentorship
  - `members` (jsonb) - Team members (optional)

  ### connections
  - `id` (uuid, pk)
  - `mentor_id` (uuid, fk) - References profiles
  - `team_id` (uuid, fk) - References profiles
  - `status` (text) - 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz)

  ### messages
  - `id` (uuid, pk)
  - `connection_id` (uuid, fk) - References connections
  - `sender_id` (uuid, fk) - References profiles
  - `content` (text) - Message content
  - `created_at` (timestamptz)

  ### meetings
  - `id` (uuid, pk)
  - `connection_id` (uuid, fk) - References connections
  - `title` (text) - Meeting title
  - `scheduled_at` (timestamptz) - Meeting date/time
  - `meet_link` (text) - Google Meet link
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Connected users can view each other's profiles
  - Messages only visible to connection participants
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('mentor', 'team')),
  full_name text NOT NULL,
  email text NOT NULL,
  birth_date date,
  state text NOT NULL,
  city text NOT NULL,
  linkedin_url text,
  avatar_url text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentor_details table
CREATE TABLE IF NOT EXISTS mentor_details (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_ftc boolean DEFAULT false,
  mentor_fll boolean DEFAULT false,
  knowledge_areas jsonb DEFAULT '[]'::jsonb
);

-- Create team_details table
CREATE TABLE IF NOT EXISTS team_details (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  team_number text NOT NULL,
  team_type text NOT NULL CHECK (team_type IN ('FTC', 'FLL')),
  interest_areas jsonb DEFAULT '[]'::jsonb,
  members jsonb DEFAULT '[]'::jsonb
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, team_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  meet_link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Mentor details policies
CREATE POLICY "Anyone can view mentor details"
  ON mentor_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can update own details"
  ON mentor_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Mentors can insert own details"
  ON mentor_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Team details policies
CREATE POLICY "Anyone can view team details"
  ON team_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teams can update own details"
  ON team_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Teams can insert own details"
  ON team_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Connections policies
CREATE POLICY "Users can view their connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = team_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = team_id);

CREATE POLICY "Users can update their connections"
  ON connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = team_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = team_id);

-- Messages policies
CREATE POLICY "Connection participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.mentor_id = auth.uid() OR connections.team_id = auth.uid())
    )
  );

CREATE POLICY "Connection participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND (connections.mentor_id = auth.uid() OR connections.team_id = auth.uid())
      AND connections.status = 'accepted'
    )
  );

-- Meetings policies
CREATE POLICY "Connection participants can view meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = meetings.connection_id
      AND (connections.mentor_id = auth.uid() OR connections.team_id = auth.uid())
    )
  );

CREATE POLICY "Connection participants can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND (connections.mentor_id = auth.uid() OR connections.team_id = auth.uid())
      AND connections.status = 'accepted'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_connections_mentor ON connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_connections_team ON connections(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
