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
