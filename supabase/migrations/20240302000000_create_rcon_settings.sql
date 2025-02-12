-- Create RCON settings table
create table if not exists rcon_settings (
  id uuid default uuid_generate_v4() primary key,
  code text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table rcon_settings enable row level security;

-- Create policies for RCON settings
create policy "Enable all operations for authenticated users"
  on rcon_settings for all
  using (auth.role() = 'authenticated');

-- Insert default RCON settings
insert into rcon_settings (code, is_active) values ('admin123', true); 