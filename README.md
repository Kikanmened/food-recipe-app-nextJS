# Food Recipe App (Next.js)

A recipe cookbook app built with Next.js, Neon, Tailwind CSS, and DaisyUI. This is a group project for the Recipe Book assignment.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript for week 1, with a TypeScript refactor planned for week 2
- **Styling:** Tailwind CSS v4 + DaisyUI (light and dark themes)
- **Data fetching:** TanStack React Query on the client, Neon SQL on the server
- **Database:** [Neon](https://neon.tech) PostgreSQL
- **Auth:** [Neon Auth](https://neon.tech/docs/auth/overview)
- **Deployment:** Vercel

## Features

- Search recipes by title, sort, and filter by ingredients
- Browse recipe cards with photos
- View ingredients and step-by-step instructions
- Add a recipe (signed-in users)
- Save favorites and personal notes in localStorage
- Sign up, sign in, and sign out
- Light/dark mode toggle

## Environment variables

Create `.env.local` in the project root (never commit this file):

```bash
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL from the Neon Console |
| `NEON_AUTH_COOKIE_SECRET` | Cookie signing secret, at least 32 characters (`openssl rand -base64 32`) |

Copy the first two values from the Neon Console. Generate the cookie secret locally. Do not put spaces around `=`.

The same three variables must be set in the Vercel project for Production, Preview, and Development.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: seed extra recipes from TheMealDB (skips titles that already exist):

```bash
npm run seed:themealdb
```

## Project Structure

```text
src/
  app/              # App Router pages and API routes
  components/       # UI, layout, recipe, and auth components
  context/          # Favorites provider (localStorage)
  lib/              # Neon SQL client and Neon Auth
  db/               # schema.sql and seed.sql
  provider/         # React Query client and recipe queries
  utils/            # Shared helpers
```

## Git Workflow

- Public repo: [https://github.com/Kikanmened/food-recipe-app-nextJS](https://github.com/Kikanmened/food-recipe-app-nextJS)
- Merge into `main` through pull requests
- Integrate work on `dev`, then merge `dev` to `main` when ready to ship

## Roadmap

- **Week 1:** JavaScript Next.js app with Neon, Neon Auth, Tailwind, DaisyUI, and React Query
- **Week 2:** Refactor to TypeScript and add `src/types/`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Neon Auth for Next.js](https://neon.tech/docs/auth/quick-start/nextjs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
