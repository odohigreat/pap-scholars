<div align="center">

# PAP Scholars

**Learn. Grow. Lead.**

A learning platform for academic growth, practical life skills, and personal development.

[Getting started](#getting-started) · [Database setup](#database-setup) · [Project structure](#project-structure) · [Development](#development)

</div>

---

## Overview

PAP Scholars brings a public course catalogue, the PAP Journal, and a student learning space into one application. Students can create an account, enroll in published courses, complete lessons, and return to their saved progress.

| Area | What it includes |
| --- | --- |
| Public website | Home, About, course catalogue, PAP Journal, and Contact |
| Accounts | Signup, email confirmation, login, and password recovery |
| Student dashboard | Enrolled courses, completion progress, and resume links |
| Learning | Protected lessons and saved lesson completion |

Built with **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Motion and GSAP support the interface animations.

## Getting started

### 1. Install dependencies

From the project root:

```sh
npm ci
```

### 2. Configure the environment

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use your Supabase project's public publishable key. Environment files are ignored by Git; configure these values separately in your hosting environment.

### 3. Prepare Supabase

Apply the migrations and configure authentication as described below before using signup or the course catalogue.

### 4. Start the application

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Database setup

For a fresh Supabase project, run these files in the SQL Editor **in order**. On an existing project, apply only migrations that have not already been run.

| Order | Migration | Purpose |
| --- | --- | --- |
| 1 | [Initial schema](supabase/migrations/202610100001_initial_schema.sql) | Tables, seed content, row access policies, and profile creation |
| 2 | [Enrollment tracking](supabase/migrations/202610100002_enrollment_tracking.sql) | Enrollments, lesson completion, and saved resume locations |
| 3 | [Catalogue and progress](supabase/migrations/202610110001_catalogue_progress.sql) | Public lesson previews and progress updates when the curriculum changes |
| 4 | [Course assessments](supabase/migrations/202610150001_course_assessments.sql) | Private answer keys, server grading, and saved assessment scores |
| 5 | [Assessment review workflow](supabase/migrations/202610150002_assessment_review_workflow.sql) | Twenty-question drafts per course, content-change detection, reviewed publication, and versioned results |

Published courses are available in the public catalogue. The `lesson_previews` view exposes lesson titles and ordering; full lesson content is restricted to enrolled students.

Assessments unlock after all lessons are completed. Each course has a 20-question assessment, a 60% pass mark (12 correct answers), answer explanations, and unlimited retries. The six initial banks contain 120 unpublished draft questions covering all 59 lesson topics. Course edits flag questions for review; only reviewed drafts can be published. Scores are graded by a database function and saved by revision. On an existing app, run the [combined assessment setup](supabase/setup-course-assessments.sql) (or migrations 4 and 5 in order), then follow the [assessment review workflow](supabase/assessments/README.md) to review and publish each set.

Enrollment progress is maintained by database triggers. Resume locations are saved after the lesson player mounts. Curriculum changes recalculate progress, and removing a lesson clears saved resume references to it.

### Authentication and email

In **Supabase → Authentication → URL Configuration**, set the Site URL to your application origin and allow these redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
```

Add the equivalent URLs for your production domain.

Signup supports email confirmation, and password recovery sends a reset link through Supabase Auth. Configure your email provider in Supabase for production delivery.

To use the branded signup email, paste the contents of [confirm-signup.html](supabase/templates/confirm-signup.html) into the **Confirm signup** email template in Supabase. Editing the local HTML file does not update the hosted template automatically.

## Project structure

```text
pap-scholars/
├── src/
│   ├── app/                 Routes, layouts, server actions, and page styles
│   │   ├── (marketing)/     Home, About, Courses, Journal, and Contact
│   │   ├── (auth)/          Login, signup, and password recovery
│   │   ├── auth/            Email confirmation callback
│   │   ├── dashboard/       Student dashboard
│   │   └── learn/           Protected lesson pages
│   ├── features/            Feature components, data, models, and server code
│   │   ├── auth/            Account forms
│   │   ├── blog/            Journal components, articles, and models
│   │   ├── contact/         Contact form
│   │   ├── courses/         Catalogue UI, queries, and sample course data
│   │   ├── dashboard/       Student dashboard UI and models
│   │   ├── enrollments/     Enrollment queries and learning server actions
│   │   ├── home/            Homepage sections
│   │   └── learn/           Lesson player, models, and demo curriculum
│   ├── components/          Shared animations, layout, and UI controls
│   ├── config/              Theme and navigation configuration
│   ├── lib/supabase/        Browser and server Supabase clients
│   └── proxy.ts             Session middleware
├── docs/design/             Image generation briefs and prompts
├── public/                  Images and static assets
├── supabase/
│   ├── migrations/          Ordered database migrations
│   └── templates/           Authentication email templates
├── scripts/                 Database verification tools
└── README.md
```

Use `@/` to import application code from `src/` and `@public/` for bundled static assets. Keep feature-specific code in `src/features/<feature>/`: UI in `components/`, local content in `data/`, models in `types.ts`, database queries in `server.ts`, and server actions in `actions.ts`. Shared layout, animations, and controls belong in `src/components/`; infrastructure clients belong in `src/lib/`.

Route files in `src/app/` compose features and own route metadata, layouts, and page styles. Import feature files directly so client components do not accidentally pull in server-only modules through barrel exports. Demo course data is explicitly named and separate from Supabase queries. Keep image generation notes in `docs/design/` rather than the publicly served asset directory.

Framework configuration, package files, and environment files stay at the project root. Restart the development server after moving route folders.

## Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Run ESLint with no warnings allowed |
| `npm run build` | Generate the production build |
| `npm run start` | Serve the production build |

### Database verification

The migration script checks enrollment behavior, curriculum updates, and row access policies using an isolated PostgreSQL runtime:

```sh
npm install --prefix /tmp/pap-enrollment-check --no-package-lock @electric-sql/pglite
PAP_PGLITE_MODULE=/tmp/pap-enrollment-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/check-enrollment-migrations.mjs
PAP_PGLITE_MODULE=/tmp/pap-enrollment-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/check-assessment-migrations.mjs
PAP_PGLITE_MODULE=/tmp/pap-enrollment-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/check-assessment-review.mjs
```

These checks do not modify the connected Supabase project. The assessment check covers scoring, prerequisites, invalid answers, retries, best/latest results, private answer keys, and access to scores.

## Current project status

- Account details, published courses, enrollments, and learning progress use Supabase.
- Dashboard Profile (`/dashboard#profile`) lets students update their name and learning goal and change their password after verifying their current password.
- Journal articles are maintained locally in `src/features/blog/data/articles.ts`.
- The Contact form previews messages locally; it does not send or save them.
- Seeded sample videos should be replaced with the intended course media before launch.
