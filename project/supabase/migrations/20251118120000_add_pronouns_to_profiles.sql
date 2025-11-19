-- Add pronouns column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pronouns text;

-- Optional: index for faster searches by pronouns
CREATE INDEX IF NOT EXISTS idx_profiles_pronouns ON profiles (pronouns);
