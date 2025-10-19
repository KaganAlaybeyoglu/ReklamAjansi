/*
  # Advertising Agency Management System

  ## Overview
  Complete database schema for managing an advertising agency with clients, staff, campaigns, and adverts.

  ## New Tables
  
  ### 1. `staff_grades`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Grade name (e.g., "Junior Designer", "Senior Creative Director")
  - `pay_rate` (decimal) - Hourly or salary rate for this grade
  - `description` (text) - Description of the grade
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `staff`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key to auth.users) - Links to authenticated user
  - `first_name` (text) - Staff member's first name
  - `last_name` (text) - Staff member's last name
  - `email` (text, unique) - Email address
  - `phone` (text) - Contact phone number
  - `staff_type` (text) - Type: 'creative' or 'administrative'
  - `grade_id` (uuid, foreign key) - Links to staff_grades
  - `hire_date` (date) - Date of hire
  - `is_active` (boolean) - Whether staff member is currently active
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `clients`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Client company name
  - `contact_person` (text) - Primary contact person
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone number
  - `address_line1` (text) - Street address
  - `address_line2` (text) - Additional address info
  - `city` (text) - City
  - `postal_code` (text) - Postal/ZIP code
  - `country` (text) - Country
  - `staff_contact_id` (uuid, foreign key) - Assigned staff contact
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `campaigns`
  - `id` (uuid, primary key) - Unique identifier
  - `client_id` (uuid, foreign key) - Links to clients
  - `name` (text) - Campaign name
  - `description` (text) - Campaign description
  - `budget` (decimal) - Campaign budget
  - `start_date` (date) - Campaign start date
  - `end_date` (date) - Campaign end date
  - `status` (text) - Status: 'planning', 'active', 'completed', 'cancelled'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `adverts`
  - `id` (uuid, primary key) - Unique identifier
  - `campaign_id` (uuid, foreign key) - Links to campaigns
  - `title` (text) - Advert title
  - `description` (text) - Advert description
  - `format` (text) - Format: 'video', 'print', 'digital', 'social', 'billboard', 'radio'
  - `production_status` (text) - Status: 'concept', 'in_production', 'review', 'approved', 'completed'
  - `production_notes` (text) - Notes about production progress
  - `cost` (decimal) - Production cost
  - `due_date` (date) - Deadline for completion
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. `concept_notes`
  - `id` (uuid, primary key) - Unique identifier
  - `campaign_id` (uuid, foreign key) - Links to campaigns
  - `created_by` (uuid, foreign key) - Staff member who created the note
  - `title` (text) - Concept title
  - `content` (text) - Concept details
  - `is_shared` (boolean) - Whether accessible to other staff
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Authenticated users can read all data (staff need access to shared information)
  - Only authenticated users can insert/update/delete data
  - Concept notes visibility controlled by `is_shared` flag
  
  ### Important Notes
  1. All tables use UUID primary keys for better security and distribution
  2. Foreign key constraints maintain referential integrity
  3. Timestamps track all changes for audit purposes
  4. Status fields use text enums for flexibility
  5. RLS policies ensure only authorized users can modify data
  6. Default values ensure data consistency
*/

-- Staff Grades Table
CREATE TABLE IF NOT EXISTS staff_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pay_rate decimal(10,2) NOT NULL DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  staff_type text NOT NULL CHECK (staff_type IN ('creative', 'administrative')),
  grade_id uuid REFERENCES staff_grades(id),
  hire_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address_line1 text DEFAULT '',
  address_line2 text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT '',
  staff_contact_id uuid REFERENCES staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  budget decimal(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adverts Table
CREATE TABLE IF NOT EXISTS adverts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  format text NOT NULL CHECK (format IN ('video', 'print', 'digital', 'social', 'billboard', 'radio')),
  production_status text DEFAULT 'concept' CHECK (production_status IN ('concept', 'in_production', 'review', 'approved', 'completed')),
  production_notes text DEFAULT '',
  cost decimal(10,2) DEFAULT 0,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Concept Notes Table
CREATE TABLE IF NOT EXISTS concept_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  created_by uuid REFERENCES staff(id),
  title text NOT NULL,
  content text DEFAULT '',
  is_shared boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_grade_id ON staff(grade_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_staff_contact ON clients(staff_contact_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_adverts_campaign ON adverts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_concept_notes_campaign ON concept_notes(campaign_id);

-- Enable Row Level Security
ALTER TABLE staff_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_grades
CREATE POLICY "Authenticated users can view staff grades"
  ON staff_grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert staff grades"
  ON staff_grades FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff grades"
  ON staff_grades FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff grades"
  ON staff_grades FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for staff
CREATE POLICY "Authenticated users can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for campaigns
CREATE POLICY "Authenticated users can view all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for adverts
CREATE POLICY "Authenticated users can view all adverts"
  ON adverts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert adverts"
  ON adverts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update adverts"
  ON adverts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete adverts"
  ON adverts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for concept_notes
CREATE POLICY "Authenticated users can view shared concept notes"
  ON concept_notes FOR SELECT
  TO authenticated
  USING (is_shared = true OR created_by IN (
    SELECT id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can insert concept notes"
  ON concept_notes FOR INSERT
  TO authenticated
  WITH CHECK (created_by IN (
    SELECT id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can update own concept notes"
  ON concept_notes FOR UPDATE
  TO authenticated
  USING (created_by IN (
    SELECT id FROM staff WHERE user_id = auth.uid()
  ))
  WITH CHECK (created_by IN (
    SELECT id FROM staff WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can delete own concept notes"
  ON concept_notes FOR DELETE
  TO authenticated
  USING (created_by IN (
    SELECT id FROM staff WHERE user_id = auth.uid()
  ));