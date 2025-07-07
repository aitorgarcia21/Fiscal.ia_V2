-- ============================================================
--  Migration : profils_pro + quota 50 questions/mois
--  Date : 2025-07-07
-- ============================================================

-- 1) Prérequis ----------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- 2) Table profils_pro ---------------------------------------------------------
create table if not exists public.profils_pro (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,

  -- Identité
  prenom                text,
  nom                   text,
  email                 text,
  telephone             text,

  -- Entreprise
  entreprise_nom        text,
  siret                 varchar(14),
  adresse               text,
  ville                 text,
  code_postal           text,
  pays                  text,

  -- Métier / spécialité
  role_pro              text,

  -- Abonnement / facturation
  stripe_customer_id    text,
  stripe_account_id     text,
  stripe_subscription_id text,

  -- Onboarding
  onboarding_step       text default 'welcome',
  metadata              jsonb,
  is_active             boolean default true,

  -- Quota questions mensuel
  questions_compteur    integer default 0,
  questions_mois        date    default date_trunc('month', now()),

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- 3) Trigger mise à jour updated_at -------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profils_pro_updated on public.profils_pro;
create trigger trg_profils_pro_updated
before update on public.profils_pro
for each row execute procedure public.set_updated_at();

-- 4) Indexes -------------------------------------------------------------------
create index if not exists idx_profils_pro_user_id     on public.profils_pro(user_id);
create index if not exists idx_profils_pro_stripe_cust on public.profils_pro(stripe_customer_id);

-- 5) RLS -----------------------------------------------------------------------
alter table public.profils_pro enable row level security;

drop policy if exists "Pro – select own profile" on public.profils_pro;
create policy "Pro – select own profile"
  on public.profils_pro
  for select
  using (user_id = auth.uid());

drop policy if exists "Pro – update own profile" on public.profils_pro;
create policy "Pro – update own profile"
  on public.profils_pro
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Pro – insert self" on public.profils_pro;
create policy "Pro – insert self"
  on public.profils_pro
  for insert
  with check (user_id = auth.uid());

grant select, insert, update on public.profils_pro to authenticated;

-- 6) Table questions_pro -------------------------------------------------------
create table if not exists public.questions_pro (
  id          uuid primary key default uuid_generate_v4(),
  pro_id      uuid not null references public.profils_pro(id) on delete cascade,
  question    text not null,
  created_at  timestamptz default now()
);

alter table public.questions_pro enable row level security;

drop policy if exists "Pro – select own questions" on public.questions_pro;
create policy "Pro – select own questions"
  on public.questions_pro
  for select
  using (pro_id in (select id from public.profils_pro where user_id = auth.uid()));

drop policy if exists "Pro – insert own question" on public.questions_pro;
create policy "Pro – insert own question"
  on public.questions_pro
  for insert
  with check (pro_id in (select id from public.profils_pro where user_id = auth.uid()));

grant select, insert on public.questions_pro to authenticated;

-- 7) Fonction de remise à zéro si nouveau mois ---------------------------------
create or replace function public._reset_compteur_if_new_month(_pro_id uuid)
returns void
language plpgsql
as $$
begin
  update public.profils_pro
  set    questions_compteur = 0,
         questions_mois     = date_trunc('month', now())
  where  id = _pro_id
    and  questions_mois <> date_trunc('month', now());
end;
$$;

-- 8) Trigger quota 50 questions/mois ------------------------------------------
create or replace function public.before_insert_question()
returns trigger
language plpgsql
as $$
declare
  _quota integer := 50;
  _current_count integer;
begin
  -- Reset si changement de mois
  perform public._reset_compteur_if_new_month(new.pro_id);

  select questions_compteur into _current_count
  from public.profils_pro
  where id = new.pro_id
  for update;

  if _current_count >= _quota then
    raise exception using message = 'Quota mensuel atteint (50 questions)', errcode = 'PTLIM';
  end if;

  update public.profils_pro
  set    questions_compteur = questions_compteur + 1
  where  id = new.pro_id;

  return new;
end;
$$;

drop trigger if exists trg_questions_quota on public.questions_pro;
create trigger trg_questions_quota
before insert on public.questions_pro
for each row execute procedure public.before_insert_question();

-- 9) Fonction CRON mensuelle (edge schedule) -----------------------------------
create or replace function public.reset_questions_counters()
returns void
language plpgsql
as $$
  update public.profils_pro
  set    questions_compteur = 0,
         questions_mois     = date_trunc('month', now());
$$; 