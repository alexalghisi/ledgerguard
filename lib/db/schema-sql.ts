export const SCHEMA_SQL = `
create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null
);
create table if not exists profiles (
  user_id text primary key references users(id) on delete cascade,
  display_name text not null
);
create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create table if not exists organizations (
  id text primary key,
  name text not null,
  slug text not null unique
);
create table if not exists organization_members (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  role text not null,
  unique (organization_id, user_id)
);

create table if not exists accounts (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null
);
create table if not exists category_rules (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  payee_contains text not null,
  category text not null
);
create table if not exists transactions (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  posted_on date not null,
  payee text not null,
  amount_cents integer not null,
  category text not null,
  fingerprint text not null,
  unique (organization_id, fingerprint)
);
create table if not exists budgets (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  category text not null,
  month text not null,
  limit_cents integer not null
);
`;
