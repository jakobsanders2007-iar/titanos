-- ============================================================
-- Titan Locksmith OS — Supabase Schema
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Enable pgcrypto for gen_random_uuid() (already enabled on Supabase).

-- ============================================================
-- ENUMS
-- ============================================================

create type job_status as enum (
  'New Lead', 'Scheduled', 'Assigned', 'En Route', 'Arrived',
  'In Progress', 'Completed', 'Cancelled', 'No Show',
  'Needs Review', 'Payment Pending', 'Cash Verification Needed', 'Closed'
);

create type payment_method as enum (
  'Cash', 'Card', 'Payment Link', 'Zelle', 'Venmo', 'Check', 'Other'
);

create type payment_status as enum (
  'Unpaid', 'Payment Link Sent', 'Partially Paid', 'Paid',
  'Cash Pending Verification', 'Refunded', 'Disputed'
);

create type cash_verification_status as enum (
  'pending', 'verified', 'flagged', 'unresolved'
);

create type user_role as enum (
  'owner', 'dispatcher', 'technician', 'accountant', 'ai_agent'
);

create type job_source as enum (
  'Phone', 'AI Call Agent', 'Website', 'Manual', 'Referral',
  'Google Business Profile', 'Yelp', 'Other'
);

-- ============================================================
-- COMPANIES
-- ============================================================

create table companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  email       text,
  website     text,
  address     text,
  timezone    text not null default 'America/Chicago',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table companies enable row level security;

-- ============================================================
-- PROFILES  (extends auth.users 1:1)
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references companies(id) on delete set null,
  full_name   text,
  email       text,
  role        user_role not null default 'dispatcher',
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CUSTOMERS
-- ============================================================

create table customers (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  name        text not null,
  phone       text,
  email       text,
  address     text,
  notes       text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table customers enable row level security;
create index customers_company_id_idx on customers(company_id);

-- ============================================================
-- TECHNICIANS
-- ============================================================

create table technicians (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  name        text not null,
  phone       text,
  email       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table technicians enable row level security;
create index technicians_company_id_idx on technicians(company_id);

-- ============================================================
-- SERVICE TYPES
-- ============================================================

create table service_types (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  default_price numeric(10,2),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table service_types enable row level security;
create index service_types_company_id_idx on service_types(company_id);

-- ============================================================
-- JOBS
-- ============================================================

create table jobs (
  id                      uuid primary key default gen_random_uuid(),
  company_id              uuid not null references companies(id) on delete cascade,
  customer_id             uuid references customers(id) on delete set null,
  technician_id           uuid references technicians(id) on delete set null,
  service_type            text not null,
  source                  job_source not null default 'Phone',
  status                  job_status not null default 'New Lead',
  address                 text,
  scheduled_start         timestamptz,
  scheduled_end           timestamptz,
  estimated_price         numeric(10,2),
  final_price             numeric(10,2),
  amount_collected        numeric(10,2) not null default 0,
  payment_method          payment_method,
  payment_status          payment_status not null default 'Unpaid',
  payment_link_sent       boolean not null default false,
  payment_link_url        text,
  payment_link_sent_at    timestamptz,
  paid_at                 timestamptz,
  cash_verification_status cash_verification_status,
  cash_verified_by        uuid references profiles(id) on delete set null,
  cash_verified_at        timestamptz,
  parts_cost              numeric(10,2) not null default 0,
  labor_cost_estimate     numeric(10,2),
  notes                   text,
  technician_notes        text,
  created_by              uuid references profiles(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table jobs enable row level security;
create index jobs_company_id_idx on jobs(company_id);
create index jobs_customer_id_idx on jobs(customer_id);
create index jobs_technician_id_idx on jobs(technician_id);
create index jobs_status_idx on jobs(status);
create index jobs_scheduled_start_idx on jobs(scheduled_start);

-- ============================================================
-- PAYMENTS
-- ============================================================

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  job_id              uuid references jobs(id) on delete set null,
  customer_id         uuid references customers(id) on delete set null,
  amount              numeric(10,2) not null default 0,
  method              payment_method,
  status              text not null default 'pending',
  provider            text,
  provider_payment_id text,
  payment_link_url    text,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

alter table payments enable row level security;
create index payments_company_id_idx on payments(company_id);
create index payments_job_id_idx on payments(job_id);

-- ============================================================
-- CASH VERIFICATIONS
-- ============================================================

create table cash_verifications (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id) on delete cascade,
  job_id                uuid not null references jobs(id) on delete cascade,
  technician_id         uuid references technicians(id) on delete set null,
  amount_reported       numeric(10,2) not null default 0,
  owner_verified_amount numeric(10,2),
  status                cash_verification_status not null default 'pending',
  technician_note       text,
  owner_note            text,
  verified_by           uuid references profiles(id) on delete set null,
  verified_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table cash_verifications enable row level security;
create index cash_verifications_company_id_idx on cash_verifications(company_id);
create index cash_verifications_status_idx on cash_verifications(status);

-- ============================================================
-- EXPENSES
-- ============================================================

create table expenses (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  category    text not null,
  amount      numeric(10,2) not null,
  date        date not null,
  notes       text,
  recurring   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table expenses enable row level security;
create index expenses_company_id_idx on expenses(company_id);
create index expenses_date_idx on expenses(date);

-- ============================================================
-- CEO PACKETS
-- ============================================================

create table ceo_packets (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references companies(id) on delete cascade,
  month            smallint not null check (month between 1 and 12),
  year             smallint not null,
  revenue          numeric(12,2) not null default 0,
  jobs_completed   integer not null default 0,
  average_ticket   numeric(10,2) not null default 0,
  cash_pending     numeric(10,2) not null default 0,
  ebitda_estimate  numeric(12,2) not null default 0,
  valuation_low    numeric(14,2) not null default 0,
  valuation_base   numeric(14,2) not null default 0,
  valuation_high   numeric(14,2) not null default 0,
  summary          text,
  created_at       timestamptz not null default now(),
  unique (company_id, month, year)
);

alter table ceo_packets enable row level security;
create index ceo_packets_company_id_idx on ceo_packets(company_id);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================

create table activity_log (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  user_id      uuid references profiles(id) on delete set null,
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

alter table activity_log enable row level security;
create index activity_log_company_id_idx on activity_log(company_id);
create index activity_log_created_at_idx on activity_log(created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on companies
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on profiles
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on customers
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on technicians
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on jobs
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on cash_verifications
  for each row execute procedure set_updated_at();
create trigger set_updated_at before update on expenses
  for each row execute procedure set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper: get the company_id of the currently authenticated user
create or replace function my_company_id()
returns uuid
language sql stable
security definer
as $$
  select company_id from profiles where id = auth.uid()
$$;

-- COMPANIES: user can only see their own company
create policy "users see own company"
  on companies for select
  using (id = my_company_id());

create policy "owners can update company"
  on companies for update
  using (id = my_company_id());

-- PROFILES: user sees own profile + company members
create policy "users see own profile"
  on profiles for select
  using (id = auth.uid() or company_id = my_company_id());

create policy "users update own profile"
  on profiles for update
  using (id = auth.uid());

-- CUSTOMERS
create policy "company members can select customers"
  on customers for select using (company_id = my_company_id());
create policy "company members can insert customers"
  on customers for insert with check (company_id = my_company_id());
create policy "company members can update customers"
  on customers for update using (company_id = my_company_id());
create policy "company members can delete customers"
  on customers for delete using (company_id = my_company_id());

-- TECHNICIANS
create policy "company members can select technicians"
  on technicians for select using (company_id = my_company_id());
create policy "company members can insert technicians"
  on technicians for insert with check (company_id = my_company_id());
create policy "company members can update technicians"
  on technicians for update using (company_id = my_company_id());
create policy "company members can delete technicians"
  on technicians for delete using (company_id = my_company_id());

-- SERVICE TYPES
create policy "company members can select service_types"
  on service_types for select using (company_id = my_company_id());
create policy "company members can insert service_types"
  on service_types for insert with check (company_id = my_company_id());
create policy "company members can update service_types"
  on service_types for update using (company_id = my_company_id());
create policy "company members can delete service_types"
  on service_types for delete using (company_id = my_company_id());

-- JOBS
create policy "company members can select jobs"
  on jobs for select using (company_id = my_company_id());
create policy "company members can insert jobs"
  on jobs for insert with check (company_id = my_company_id());
create policy "company members can update jobs"
  on jobs for update using (company_id = my_company_id());
create policy "company members can delete jobs"
  on jobs for delete using (company_id = my_company_id());

-- PAYMENTS
create policy "company members can select payments"
  on payments for select using (company_id = my_company_id());
create policy "company members can insert payments"
  on payments for insert with check (company_id = my_company_id());
create policy "company members can update payments"
  on payments for update using (company_id = my_company_id());

-- CASH VERIFICATIONS
create policy "company members can select cash_verifications"
  on cash_verifications for select using (company_id = my_company_id());
create policy "company members can insert cash_verifications"
  on cash_verifications for insert with check (company_id = my_company_id());
create policy "company members can update cash_verifications"
  on cash_verifications for update using (company_id = my_company_id());

-- EXPENSES
create policy "company members can select expenses"
  on expenses for select using (company_id = my_company_id());
create policy "company members can insert expenses"
  on expenses for insert with check (company_id = my_company_id());
create policy "company members can update expenses"
  on expenses for update using (company_id = my_company_id());
create policy "company members can delete expenses"
  on expenses for delete using (company_id = my_company_id());

-- CEO PACKETS
create policy "company members can select ceo_packets"
  on ceo_packets for select using (company_id = my_company_id());
create policy "company members can insert ceo_packets"
  on ceo_packets for insert with check (company_id = my_company_id());
create policy "company members can update ceo_packets"
  on ceo_packets for update using (company_id = my_company_id());

-- ACTIVITY LOG
create policy "company members can select activity_log"
  on activity_log for select using (company_id = my_company_id());
create policy "company members can insert activity_log"
  on activity_log for insert with check (company_id = my_company_id());

-- ============================================================================
-- TITAN FIELD OS EXPANSION — Sales, AI Receptionist, Shopper, Training
-- ============================================================================

-- LEADS
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  name text not null,
  phone text,
  email text,
  source text not null default 'Phone',
  stage text not null default 'New Lead',
  vertical text not null default 'Locksmith',
  service_need text,
  estimated_value numeric(10,2) default 0,
  assigned_to uuid references profiles(id) on delete set null,
  next_followup timestamptz,
  notes text,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_company_stage_idx on leads (company_id, stage);
create trigger leads_updated_at before update on leads
  for each row execute function set_updated_at();

-- QUOTES
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  service text not null,
  vertical text not null default 'Locksmith',
  amount numeric(10,2) not null default 0,
  status text not null default 'Draft', -- Draft/Sent/Viewed/Accepted/Declined/Expired
  sent_at timestamptz,
  decided_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quotes_company_status_idx on quotes (company_id, status);
create trigger quotes_updated_at before update on quotes
  for each row execute function set_updated_at();

-- CRM FOLLOW-UPS
create table if not exists crm_followups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  due_at timestamptz not null,
  channel text default 'Phone',
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists crm_followups_company_due_idx on crm_followups (company_id, due_at);

-- AI RECEPTIONIST CALLS
create table if not exists ai_receptionist_calls (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  caller_name text,
  caller_phone text,
  received_at timestamptz not null default now(),
  duration_sec int default 0,
  service_type text,
  vertical text default 'Locksmith',
  urgency text default 'Flexible',
  address text,
  quoted_estimate numeric(10,2),
  outcome text not null default 'Info Only',
  job_id uuid references jobs(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  escalation_needed boolean not null default false,
  ai_confidence numeric(4,3) default 0,
  summary text,
  transcript text,
  created_at timestamptz not null default now()
);
create index if not exists ai_calls_company_received_idx on ai_receptionist_calls (company_id, received_at desc);

-- AI RECEPTIONIST SETTINGS
create table if not exists ai_receptionist_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  greeting_script text,
  escalation_rules jsonb default '{}'::jsonb,
  business_hours jsonb default '{}'::jsonb,
  emergency_keywords text[] default '{}',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger ai_receptionist_settings_updated_at before update on ai_receptionist_settings
  for each row execute function set_updated_at();

-- AI CONVERSATIONS / MESSAGES (consultant chat)
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);
create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_conversation_idx on ai_messages (conversation_id, created_at);

-- AI RECOMMENDATIONS
create table if not exists ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  severity text not null default 'opportunity', -- critical/warning/opportunity/positive
  title text not null,
  body text,
  module text,
  href text,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ai_recommendations_company_idx on ai_recommendations (company_id, created_at desc);

-- SHOPPER ITEMS + UNIVERSAL CART + PURCHASE HISTORY
create table if not exists shopper_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  category text not null,
  vendor text,
  price numeric(10,2) not null default 0,
  unit text default 'unit',
  urgency text default 'Plan Ahead',
  reason text,
  created_at timestamptz not null default now()
);
create table if not exists universal_cart_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  shopper_item_id uuid references shopper_items(id) on delete cascade,
  quantity int not null default 1,
  status text not null default 'pending', -- pending/approved/ordered/received
  added_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists purchase_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  item_name text not null,
  vendor text,
  amount numeric(10,2) not null default 0,
  quantity int not null default 1,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- TRAINING
create table if not exists training_lessons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade, -- null = global curriculum
  title text not null,
  description text,
  duration_min int default 10,
  audience text default 'Everyone',
  checklist jsonb default '[]'::jsonb,
  video_url text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
create table if not exists training_progress (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lesson_id uuid not null references training_lessons(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  completed_at timestamptz,
  unique (lesson_id, user_id)
);

-- VALUATION REPORTS
create table if not exists valuation_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  inputs jsonb not null default '{}'::jsonb,
  conservative numeric(12,2),
  base numeric(12,2),
  aggressive numeric(12,2),
  sellability_score int,
  created_at timestamptz not null default now()
);

-- EQUIPMENT (HVAC and locksmith installed assets)
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  vertical text not null default 'HVAC',
  kind text, -- condenser/furnace/thermostat/smart lock/safe/access control
  brand text,
  model text,
  serial text,
  installed_at date,
  warranty_expires date,
  notes text,
  created_at timestamptz not null default now()
);

-- PARTS USED PER JOB
create table if not exists parts_used (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  name text not null,
  quantity int not null default 1,
  unit_cost numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists parts_used_job_idx on parts_used (job_id);

-- MAINTENANCE PLANS (HVAC recurring revenue)
create table if not exists maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  name text not null default 'Annual Maintenance Plan',
  price_per_year numeric(10,2) not null default 0,
  visits_per_year int not null default 2,
  next_visit_due date,
  status text not null default 'active', -- active/paused/cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger maintenance_plans_updated_at before update on maintenance_plans
  for each row execute function set_updated_at();

-- INTEGRATION SETTINGS
create table if not exists integration_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  provider text not null, -- stripe/twilio/quickbooks/llm
  settings jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (company_id, provider)
);
create trigger integration_settings_updated_at before update on integration_settings
  for each row execute function set_updated_at();

-- JOB STATUS HISTORY
create table if not exists job_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index if not exists job_status_history_job_idx on job_status_history (job_id, changed_at);

-- RLS for all new tables ------------------------------------------------------

alter table leads enable row level security;
alter table quotes enable row level security;
alter table crm_followups enable row level security;
alter table ai_receptionist_calls enable row level security;
alter table ai_receptionist_settings enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table ai_recommendations enable row level security;
alter table shopper_items enable row level security;
alter table universal_cart_items enable row level security;
alter table purchase_history enable row level security;
alter table training_lessons enable row level security;
alter table training_progress enable row level security;
alter table valuation_reports enable row level security;
alter table equipment enable row level security;
alter table parts_used enable row level security;
alter table maintenance_plans enable row level security;
alter table integration_settings enable row level security;
alter table job_status_history enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'leads','quotes','crm_followups','ai_receptionist_calls','ai_receptionist_settings',
    'ai_conversations','ai_messages','ai_recommendations','shopper_items',
    'universal_cart_items','purchase_history','training_progress','valuation_reports',
    'equipment','parts_used','maintenance_plans','integration_settings','job_status_history'
  ]
  loop
    execute format('create policy "company select %1$s" on %1$I for select using (company_id = my_company_id())', t);
    execute format('create policy "company insert %1$s" on %1$I for insert with check (company_id = my_company_id())', t);
    execute format('create policy "company update %1$s" on %1$I for update using (company_id = my_company_id())', t);
    execute format('create policy "company delete %1$s" on %1$I for delete using (company_id = my_company_id())', t);
  end loop;
end $$;

-- training_lessons: global rows (company_id null) readable by all authed users
create policy "read global or company lessons" on training_lessons
  for select using (company_id is null or company_id = my_company_id());
create policy "manage company lessons" on training_lessons
  for all using (company_id = my_company_id()) with check (company_id = my_company_id());

-- ============================================================================
-- TITAN AGENT + INTEGRATION LAYER
-- ============================================================================

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  provider text not null,
  status text not null default 'missing_key', -- ready/mock/missing_key/error/disabled
  last_checked_at timestamptz,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider)
);
create trigger integration_connections_updated_at before update on integration_connections
  for each row execute function set_updated_at();

create table if not exists agent_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  title text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger agent_sessions_updated_at before update on agent_sessions
  for each row execute function set_updated_at();

create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  tool_calls jsonb,
  created_at timestamptz not null default now()
);
create index if not exists agent_messages_session_idx on agent_messages (session_id, created_at);

create table if not exists agent_tool_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  tool_name text not null,
  input jsonb,
  output jsonb,
  status text not null default 'ok', -- ok/error/draft
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists agent_tool_runs_company_idx on agent_tool_runs (company_id, created_at desc);

create table if not exists web_research_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  source text not null, -- exa/firecrawl/browserbase
  query text,
  url text,
  title text,
  summary text,
  content text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists web_research_company_idx on web_research_results (company_id, created_at desc);

create table if not exists document_analyses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  document_name text,
  document_type text,
  source_url text,
  extracted_text text,
  summary text,
  key_findings jsonb default '[]'::jsonb,
  risks jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists call_transcripts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  provider text, -- gladia/vapi/telnyx
  call_id text,
  customer_id uuid references customers(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  transcript text,
  summary text,
  sentiment text,
  action_items jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists address_validations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  original_address text not null,
  normalized_address text,
  valid boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists outbound_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  provider text, -- telnyx/resend
  channel text, -- sms/email
  recipient text not null,
  subject text,
  body text,
  status text not null default 'draft', -- draft/approved/sent/failed
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists outbound_messages_company_idx on outbound_messages (company_id, created_at desc);

-- RLS
alter table integration_connections enable row level security;
alter table agent_sessions enable row level security;
alter table agent_messages enable row level security;
alter table agent_tool_runs enable row level security;
alter table web_research_results enable row level security;
alter table document_analyses enable row level security;
alter table call_transcripts enable row level security;
alter table address_validations enable row level security;
alter table outbound_messages enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'integration_connections','agent_sessions','agent_messages','agent_tool_runs',
    'web_research_results','document_analyses','call_transcripts','address_validations',
    'outbound_messages'
  ]
  loop
    execute format('create policy "company select %1$s" on %1$I for select using (company_id = my_company_id())', t);
    execute format('create policy "company insert %1$s" on %1$I for insert with check (company_id = my_company_id())', t);
    execute format('create policy "company update %1$s" on %1$I for update using (company_id = my_company_id())', t);
    execute format('create policy "company delete %1$s" on %1$I for delete using (company_id = my_company_id())', t);
  end loop;
end $$;

-- ============================================================================
-- TITAN INTELLIGENCE OS — canonical model, memory, goals, risk, closeouts
-- ============================================================================

create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (company_id, profile_id)
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger employees_updated_at before update on employees
  for each row execute function set_updated_at();

-- Source-system registry (Connected Mode). Titan Native is just another row.
create table if not exists connectors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,           -- jobber/servicetitan/toast/titan_native/...
  category text,
  mode text not null default 'connected', -- connected | native
  status text not null default 'available',
  records_synced int not null default 0,
  last_synced_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);
create trigger connectors_updated_at before update on connectors
  for each row execute function set_updated_at();

-- Canonical event stream: every fact from every connector normalizes here.
create table if not exists business_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  connector_id uuid references connectors(id) on delete set null,
  source text not null default 'titan_native',
  event_type text not null, -- job/payment/call/email/document/decision/...
  occurred_at timestamptz not null default now(),
  title text not null,
  detail text,
  amount numeric(12,2),
  entity_type text,
  entity_id uuid,
  impact text default 'neutral', -- positive/negative/neutral
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists business_events_company_time_idx on business_events (company_id, occurred_at desc);
create index if not exists business_events_type_idx on business_events (company_id, event_type);

-- Long-term memory items: decisions, documents, KPI snapshots, mistakes.
create table if not exists business_memory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category text not null, -- decision/document/goal/kpi_snapshot/people/risk/mistake
  title text not null,
  summary text,
  source text,
  tags text[] default '{}',
  embedding_ref text,       -- pointer for future vector search
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists business_memory_company_idx on business_memory (company_id, occurred_at desc);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  goal_type text not null, -- revenue/ebitda/valuation/expansion/cash_flow/owner_freedom/hiring
  title text not null,
  current_value numeric(14,2) default 0,
  target_value numeric(14,2) not null,
  unit text default 'currency',
  target_date date,
  status text not null default 'active',
  latest_impact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger goals_updated_at before update on goals
  for each row execute function set_updated_at();

create table if not exists goal_milestones (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  goal_id uuid references goals(id) on delete set null,
  category text not null default 'Ops',
  title text not null,
  rationale text,
  impact_estimate numeric(12,2),
  effort text default 'Low',
  owner_label text,
  status text not null default 'To Do',
  due_date date,
  why_analysis_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger action_items_updated_at before update on action_items
  for each row execute function set_updated_at();

create table if not exists why_analyses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  question text not null,
  headline text,
  unit text default 'currency',
  factors jsonb default '[]'::jsonb,
  root_cause text,
  recommendation text,
  created_at timestamptz not null default now()
);

create table if not exists risk_flags (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category text not null,
  severity text not null default 'medium', -- critical/high/medium
  title text not null,
  detail text,
  exposure numeric(12,2),
  status text not null default 'open', -- open/acknowledged/resolved
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  href text,
  created_at timestamptz not null default now()
);
create index if not exists risk_flags_company_idx on risk_flags (company_id, status, severity);

-- Per-service operating playbooks (mirrors src/lib/job-playbooks.ts for DB-driven verticals)
create table if not exists job_playbooks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade, -- null = global
  service_type text not null,
  vertical text not null default 'Locksmith',
  labor_minutes int default 45,
  diagnosis jsonb default '[]'::jsonb,
  tools jsonb default '[]'::jsonb,
  parts jsonb default '[]'::jsonb,
  checklist jsonb default '[]'::jsonb,
  closeout jsonb default '[]'::jsonb,
  upsell text,
  follow_up_days int default 3,
  follow_up_action text,
  created_at timestamptz not null default now()
);

-- Closeout enforcement record: a job cannot close without one of these rows complete.
create table if not exists job_closeouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  final_price numeric(10,2),
  payment_method text,
  amount_collected numeric(10,2),
  notes text,
  parts_used jsonb default '[]'::jsonb,
  photos jsonb default '[]'::jsonb,
  customer_followup_status text,
  review_request_sent boolean not null default false,
  cash_verification_triggered boolean not null default false,
  profit_score int,
  profit_explanation text,
  completed_by uuid references profiles(id) on delete set null,
  closed_at timestamptz not null default now(),
  unique (job_id)
);

create table if not exists financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  revenue numeric(14,2) default 0,
  expenses numeric(14,2) default 0,
  gross_profit numeric(14,2) default 0,
  ebitda_estimate numeric(14,2) default 0,
  cash_days numeric(6,1),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  doc_type text,
  source_url text,
  storage_path text,
  status text not null default 'processing', -- processing/processed/failed
  insights_count int default 0,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  report_type text not null,
  period_start date,
  period_end date,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table company_members enable row level security;
alter table employees enable row level security;
alter table connectors enable row level security;
alter table business_events enable row level security;
alter table business_memory enable row level security;
alter table goals enable row level security;
alter table goal_milestones enable row level security;
alter table action_items enable row level security;
alter table why_analyses enable row level security;
alter table risk_flags enable row level security;
alter table job_closeouts enable row level security;
alter table financial_snapshots enable row level security;
alter table documents enable row level security;
alter table reports enable row level security;
alter table job_playbooks enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'company_members','employees','connectors','business_events','business_memory',
    'goals','goal_milestones','action_items','why_analyses','risk_flags',
    'job_closeouts','financial_snapshots','documents','reports'
  ]
  loop
    execute format('create policy "company select %1$s" on %1$I for select using (company_id = my_company_id())', t);
    execute format('create policy "company insert %1$s" on %1$I for insert with check (company_id = my_company_id())', t);
    execute format('create policy "company update %1$s" on %1$I for update using (company_id = my_company_id())', t);
    execute format('create policy "company delete %1$s" on %1$I for delete using (company_id = my_company_id())', t);
  end loop;
end $$;

-- job_playbooks: global rows (company_id null) readable by all authed users
create policy "read global or company playbooks" on job_playbooks
  for select using (company_id is null or company_id = my_company_id());
create policy "manage company playbooks" on job_playbooks
  for all using (company_id = my_company_id()) with check (company_id = my_company_id());
