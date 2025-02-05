-- Dodajemo nove kolone u users tabelu
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'professor', 'student')) DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  -- Dodatni podaci za učenike
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_phone text,
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS grade text,
  -- Dodatni podaci za profesore
  ADD COLUMN IF NOT EXISTS subjects text[],
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS experience text,
  -- Sistemski podaci
  ADD COLUMN IF NOT EXISTS last_login timestamptz,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Kreiramo indekse za često korištene kolone
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Dodajemo RLS (Row Level Security) politike
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin može sve
CREATE POLICY "Admins have full access"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Korisnici mogu čitati osnovne podatke o drugim korisnicima
CREATE POLICY "Users can read basic info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true)
  WITH CHECK (
    status = 'active' AND
    (
      -- Mogu vidjeti javne podatke
      auth.jwt() ->> 'role' IN ('student', 'professor', 'admin') OR
      -- Ili svoje vlastite podatke
      auth.uid() = id
    )
  );

-- Korisnici mogu ažurirati svoje podatke
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger za ažuriranje updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 