-- HonorProxy Initial Schema (MVP)
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
create type request_status as enum ('open', 'claimed', 'in_progress', 'fulfilled', 'cancelled');
create type visit_status as enum ('planned', 'completed', 'cancelled');
create type cemetery_type as enum ('national_military', 'state_veterans', 'private', 'other');

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  is_veteran boolean default false,
  veteran_branch text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for profiles
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CEMETERIES (master data - initially seeded)
-- ============================================
create table cemeteries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,               -- e.g. 'arlington', 'fort-snelling'
  location_city text,
  location_state text,
  country text default 'USA',
  cemetery_type cemetery_type default 'national_military',
  official_site_url text,                  -- Link to ANC Explorer or equivalent
  visitor_info_url text,
  notes text,                              -- Rules, access notes
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Allow anyone (including anon key) to read cemetery reference data.
-- This table is not sensitive.
alter table cemeteries enable row level security;

create policy "Cemeteries are publicly readable"
  on cemeteries for select
  to anon, authenticated
  using (true);

-- Seed initial MVP cemeteries
insert into cemeteries (name, slug, location_city, location_state, official_site_url, notes) values
('Arlington National Cemetery', 'arlington', 'Arlington', 'VA', 'https://ancexplorer.army.mil/publicwmv/index.html#/arlington-national/', 'REAL ID required for vehicle entry. Use ANC Explorer (publicwmv link) for precise grave location — search by name then note Section + Grave.'),
('Fort Snelling National Cemetery', 'fort-snelling', 'Minneapolis', 'MN', 'https://www.cem.va.gov/cems/nchp/ftsnelling.asp', 'Large active national cemetery. Check current visitor guidelines.'),
('Golden Gate National Cemetery', 'golden-gate', 'San Bruno', 'CA', 'https://www.cem.va.gov/cems/nchp/goldengate.asp', 'Major West Coast national cemetery.'),
('Quantico National Cemetery', 'quantico', 'Triangle', 'VA', 'https://www.cem.va.gov/cems/nchp/quantico.asp', 'Serves many military families in the DC metro area.')
on conflict (slug) do nothing;

-- ============================================
-- GRAVE REQUESTS (from families / requesters)
-- ============================================
create table grave_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references profiles(id) on delete cascade,
  requester_email text,                    -- Denormalized for reliable email sending (bypasses profiles RLS)
  cemetery_id uuid not null references cemeteries(id),
  
  -- Grave identification (critical for accurate visits)
  deceased_full_name text not null,
  section text,
  grave_number text,
  plot_info text,                    -- Any additional locator info
  official_grave_url text,           -- Link to ANC Explorer result or Find a Grave
  
  personal_message text,             -- What the visitor should know / feel
  relationship_to_deceased text,     -- "My father", "My brother", "Gold Star widow", etc.
  
  preferred_visit_window_start date,
  preferred_visit_window_end date,
  
  status request_status default 'open',
  claimed_by uuid references profiles(id),
  claimed_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table grave_requests enable row level security;

-- Requesters can see and manage their own requests
create policy "Requesters can manage their own requests"
  on grave_requests for all
  using (auth.uid() = requester_id);

-- Anyone (logged in) can view open requests (for browsing as visitor)
create policy "Logged in users can view open requests"
  on grave_requests for select
  using (status = 'open' or status = 'claimed');

-- ============================================
-- VISITS (a visitor claims and schedules a visit)
-- ============================================
create table visits (
  id uuid primary key default uuid_generate_v4(),
  grave_request_id uuid not null references grave_requests(id) on delete cascade,
  visitor_id uuid not null references profiles(id),
  
  planned_date date,
  status visit_status default 'planned',
  
  -- Trust & verification fields (MVP: simple; later more sophisticated)
  visitor_notes text,                -- What the visitor intends to do
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table visits enable row level security;

create policy "Visitors can manage their own visits"
  on visits for all
  using (auth.uid() = visitor_id);

create policy "Requesters can view visits on their requests"
  on visits for select
  using (exists (
    select 1 from grave_requests 
    where grave_requests.id = visits.grave_request_id 
    and grave_requests.requester_id = auth.uid()
  ));

-- ============================================
-- VISIT REPORTS (the emotional delivery payload)
-- ============================================
create table visit_reports (
  id uuid primary key default uuid_generate_v4(),
  visit_id uuid not null references visits(id) on delete cascade,
  grave_request_id uuid not null references grave_requests(id),
  
  visit_date date not null,
  reflection_text text not null,           -- The visitor's personal note
  tribute_left text,                       -- "Small American flag", "Single white rose", "None"
  
  photo_urls text[] default '{}',          -- Array of Supabase Storage paths (we generate signed URLs on read)
  
  is_approved boolean default false,       -- Human moderation in early MVP
  moderated_by uuid references profiles(id),
  moderated_at timestamptz,
  
  delivered_at timestamptz,                -- When the beautiful email was sent
  
  created_at timestamptz default now()
);

alter table visit_reports enable row level security;

-- Only the visitor who did the visit can create/edit the report until approved
create policy "Visitor can create and edit their own report before approval"
  on visit_reports for all
  using (
    exists (
      select 1 from visits 
      where visits.id = visit_reports.visit_id 
      and visits.visitor_id = auth.uid()
    )
    and is_approved = false
  );

-- Requesters can view approved reports for their requests
create policy "Requesters can view approved reports for their requests"
  on visit_reports for select
  using (
    is_approved = true 
    and exists (
      select 1 from grave_requests 
      where grave_requests.id = visit_reports.grave_request_id 
      and grave_requests.requester_id = auth.uid()
    )
  );

-- ============================================
-- HELPER: Update timestamps
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
create trigger update_grave_requests_updated_at before update on grave_requests for each row execute function update_updated_at_column();
create trigger update_visits_updated_at before update on visits for each row execute function update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_grave_requests_status on grave_requests(status);
create index idx_grave_requests_cemetery on grave_requests(cemetery_id);
create index idx_visits_visitor on visits(visitor_id);
create index idx_visit_reports_request on visit_reports(grave_request_id);

COMMENT ON TABLE grave_requests IS 'Core requests from families wanting a proxy visit';
COMMENT ON TABLE visit_reports IS 'The emotional heart of the product — the report delivered back to the requester';
