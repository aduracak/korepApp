-- Drop existing RCON settings if they exist
DROP TABLE IF EXISTS rcon_settings CASCADE;

-- Create RCON settings table
CREATE TABLE rcon_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE rcon_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read RCON settings (potrebno za provjeru koda)
CREATE POLICY "Anyone can read RCON settings"
  ON rcon_settings
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow anyone to update RCON settings (možemo kasnije dodati restrikcije)
CREATE POLICY "Anyone can update RCON settings"
  ON rcon_settings
  FOR UPDATE
  TO PUBLIC
  USING (true);

-- Function to handle RCON settings updates
CREATE OR REPLACE FUNCTION handle_rcon_settings_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for RCON settings updates
DROP TRIGGER IF EXISTS rcon_settings_updated ON rcon_settings;
CREATE TRIGGER rcon_settings_updated
  BEFORE UPDATE ON rcon_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_rcon_settings_update();

-- Insert default RCON settings
DELETE FROM rcon_settings;
INSERT INTO rcon_settings (code, is_active)
VALUES ('paradajz', true); 