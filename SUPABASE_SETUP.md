# Vercel + Supabase setup

This application uses Supabase Auth, Postgres, and Storage directly. It does not need a Manus API key, Manus OAuth, a MySQL DSN, a service-role key, or Manus storage.

## 1. Prepare Supabase

Create a Supabase project and enable the Email/Password provider under Authentication. Turn off public user sign-ups; owner accounts are created by the project administrator, not through this app. In **SQL Editor**, run `supabase/migrations/20261021160000_initial_schema.sql`. This creates the portfolio tables, a private owner registry, row-level security policies, and a private `portfolio-images` bucket limited to JPEG, PNG, WebP, and AVIF files up to 8 MiB.

In **Authentication → Users**, create the owner account with a strong password and mark it confirmed if the project requires email confirmation. Copy its user UUID, then run this in SQL Editor, replacing the example UUID with that account's real UUID:

```sql
insert into public.portfolio_owners (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

Only an administrator using Supabase's SQL Editor can add an owner. The app never ships a service-role key. Public visitors can read published portfolio entries and gallery details. The Storage bucket is private; Storage RLS permits image reads only when an object maps to a published gallery record or the authenticated owner. The site serves images through a same-origin `/media/<image-id>` route that re-checks the database record, returns 404 for unpublished images to non-owners, and marks owner-only draft images `private, no-store`. Published media can be cached for up to five minutes. Unpublished drafts and orphaned Storage objects are not publicly readable; cleanup failures leave the object private and are surfaced to the owner for manual cleanup.

## 2. Configure the app

Copy `.env.example` to `.env.local` for local development. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's API settings. Do not use the secret/service-role key. For local plain-HTTP development, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`; this selects the local lax-cookie configuration. Set the production value to the exact real HTTPS origin only after the domain is known; HTTPS deployments and embedded preview use `SameSite=None; Secure`. This value also drives canonical tags, social URLs, the sitemap, and robots' sitemap reference.

Add the same three values to the Vercel project's Environment Variables, then redeploy. The owner can sign in at `/admin` using the Auth account created above. Public sign-up is not implemented.

## 3. Start and build

Use Node.js 22 and pnpm 11. Run `pnpm install --frozen-lockfile`, `pnpm dev` for local development, `pnpm typecheck` for TypeScript checking, and `pnpm build` for the production build. Vercel can install from the included `pnpm-lock.yaml` and use `pnpm build` as its build command.

The source archive does not include external database contents. If the previous live site contains real project entries or screenshots that are not in the archive, export or re-add them separately; this migration intentionally does not create sample work.

## Official references

- [Supabase SSR client setup for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Auth quickstart for Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase Storage access control and RLS](https://supabase.com/docs/guides/storage/security/access-control)
