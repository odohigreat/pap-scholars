# PAP Scholars

## Supabase authentication setup

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (and in your hosting environment).

Run `supabase/migrations/202610100001_initial_schema.sql` once in the Supabase SQL Editor for a fresh project. This creates the tables, row access policies, and the trigger that saves each new account's `full_name` to `public.profiles`. Supabase Auth manages account email and passwords.

In Supabase Authentication → URL Configuration, set your Site URL and allow these redirect URLs for each environment:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/callback?next=/reset-password`
- The same paths on your production origin.

Registration supports email confirmation. Login requires real credentials, the dashboard and lessons require a verified user, and logout clears the Supabase session. Password recovery sends a real reset email.

Dashboard account details come from Supabase. Course progress, enrollment counts, activities, and notifications still use demo data; this authentication change does not persist those features.

## Development

Run `npm run dev`. Validate changes with `npm run typecheck`, `npm run lint`, and `npm run build`.

### Course enrolments

Apply `supabase/migrations/202610100002_enrollment_tracking.sql` after the initial schema.
It extends existing enrolments without removing students or lesson completion records.
Published courses, including the existing seeded catalogue, can be enrolled in for free.
Resume locations are saved when a lesson opens; completion and percentages are maintained
by PostgreSQL triggers when lesson progress is inserted. Overall dashboard progress is
the average percentage across enrolled courses. Student updates are restricted to their
own resume location; lifecycle fields are controlled by the database.

Migration and RLS checks run against an isolated PostgreSQL runtime:

```sh
npm install --prefix /tmp/pap-enrollment-check --no-package-lock @electric-sql/pglite
PAP_PGLITE_MODULE=/tmp/pap-enrollment-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/check-enrollment-migrations.mjs
```

This check does not change the connected Supabase project.
