create extension if not exists pgcrypto;

create table if not exists public.portfolio_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.portfolio_owners enable row level security;
revoke all on public.portfolio_owners from anon, authenticated;

create or replace function public.is_portfolio_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.portfolio_owners where user_id = auth.uid()
  );
$$;
revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to anon, authenticated;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  category text not null default 'Project',
  summary text not null default '',
  context text not null default '',
  contribution text not null default '',
  outcome text not null default '',
  technologies text[] not null default array[]::text[],
  demo_url text not null default '',
  repository_url text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_public_order on public.projects (published, sort_order, created_at desc);
alter table public.projects enable row level security;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public" on public.projects
  for select to anon, authenticated using (published or public.is_portfolio_owner());
drop policy if exists "Portfolio owner manages projects" on public.projects;
create policy "Portfolio owner manages projects" on public.projects
  for all to authenticated using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path text not null,
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_order on public.project_images (project_id, sort_order, created_at);
create unique index if not exists project_images_path_unique on public.project_images (path);
alter table public.project_images enable row level security;
grant select on public.project_images to anon, authenticated;
grant insert, update, delete on public.project_images to authenticated;
drop policy if exists "Images for public projects are public" on public.project_images;
create policy "Images for public projects are public" on public.project_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id
        and (p.published or public.is_portfolio_owner())
    )
  );
drop policy if exists "Portfolio owner manages project images" on public.project_images;
create policy "Portfolio owner manages project images" on public.project_images
  for all to authenticated using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Published portfolio images are readable" on storage.objects;
create policy "Published portfolio images are readable" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'portfolio-images' and (
      public.is_portfolio_owner() or exists (
        select 1
        from public.project_images image
        join public.projects project on project.id = image.project_id
        where image.path = storage.objects.name and project.published = true
      )
    )
  );
drop policy if exists "Portfolio owner uploads images" on storage.objects;
create policy "Portfolio owner uploads images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-images' and public.is_portfolio_owner());
drop policy if exists "Portfolio owner updates images" on storage.objects;
create policy "Portfolio owner updates images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-images' and public.is_portfolio_owner())
  with check (bucket_id = 'portfolio-images' and public.is_portfolio_owner());
drop policy if exists "Portfolio owner removes images" on storage.objects;
create policy "Portfolio owner removes images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-images' and public.is_portfolio_owner());
