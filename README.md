# Lordic product studio portfolio

Lordic is presented as the product and engineering studio of Obadasa Kayode, a full-stack developer and CEO. The homepage restores the earlier, direct composition the owner preferred: a clear full-stack developer headline, Lordic identity panel, focus areas, a data-driven case-study rail, tools, and direct contact links. Both the decorative 3D orbit and its replacement diagram have been removed.

The public work area reads real published case studies from Supabase. The uploaded source archive contained no old project records or gallery assets, so the archive is intentionally honest and directs the owner to the Project Studio rather than inventing case studies. Add the real project context, personal contribution, substantiated outcome and technologies there; screenshots can strengthen the case study. The server blocks public publishing until those case-study fields are meaningfully filled, and outcome numbers should only be included when supportable. Drafts remain private. The header's **Owner Studio** link opens `/admin`; the editor supports project drafts, publish controls and screenshot management.

The Studio is currently not connected because this workspace has no Supabase project URL or publishable key. To activate it, follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), apply the migration, create the owner Auth user and register its UUID. No public sign-up or development login bypass is provided.

## Brand and contact

The supplied Lordic logo and exact Upwork and TikTok links are preserved. The public Tools & Framework section lists the technologies Obadasa identified as tools he uses through Lordic: Next.js 15, React 19, TypeScript, Three.js, Supabase Auth, PostgreSQL, Supabase Storage, Firebase, OpenAI, LLMs, API integrations, Node.js and Python. The portfolio itself no longer ships Three.js or the decorative 3D object. “LML” was interpreted as “LLM.”

Contact email: **obadasakayode78@gmail.com**. Both homepage and case-study contact CTAs use this address.

The supplied MyWidgetFlow script is loaded once on public home and case-study pages, after the page becomes interactive. Its API/image host and required Google Fonts hosts are allowed only on those public routes. `/admin` neither loads the widget nor receives those CSP allowances. Its configured launcher and open/close interaction were verified in Preview; recheck the widget after deploying to the real Vercel domain.

## Deploy

1. Create a Supabase project and complete [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), including disabling public sign-ups, creating the owner account, running the SQL migration, and inserting its UUID into `portfolio_owners`.
2. Import this folder into Vercel as a Next.js project. Use Node.js 22 and the included `pnpm-lock.yaml`; use `pnpm install --frozen-lockfile` and `pnpm build`.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the actual HTTPS `NEXT_PUBLIC_SITE_URL` to Vercel. Never add a Supabase service-role key.
4. Redeploy and sign in at `/admin`, then create/publish your real case studies and upload project screenshots.

The portfolio is designed to support larger engagements, but no price, client, metric, testimonial or past-project result is claimed without evidence. Search ranking and live authentication require the owner to configure real project data and deployment details.
