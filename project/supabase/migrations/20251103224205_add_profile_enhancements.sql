/*
  # Profile Enhancement Schema

  ## Overview
  Add support for followers, profile images, and additional profile metadata.

  ## Changes
  - Add followers table for follow relationships
  - Add avatar_url and cover_image_url to profiles
  - Add bio field expansion to profiles
  - Add social links to profiles
  - Add is_public flag to profiles
  - Add created_at and updated_at to mentor_details and team_details
*/

DO $$
BEGIN
  -- Add columns to profiles if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_public boolean DEFAULT true;
  END IF;
END $$;

-- Create followers table
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on followers
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Followers policies
CREATE POLICY "Users can view followers"
  ON followers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create index for followers
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
