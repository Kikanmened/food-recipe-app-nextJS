# Reconciled Project Plan: Recipe Book (Next.js + Neon)

## Project Goal

Build a recipe discovery and cookbook application with Next.js, Neon database, Neon Auth, Tailwind CSS, DaisyUI, and TanStack React Query. This plan merges the staged work breakdown with the 13-step Neon guide architecture.

## Architecture Decisions

| Decision | Chosen Approach |
|---|---|
| Framework | Next.js 16 App Router |
| Language | JavaScript for week 1, TypeScript refactor in week 2 |
| Styling | Tailwind CSS v4 + DaisyUI |
| Database | Neon PostgreSQL |
| Auth | `@neondatabase/auth` |
| Data fetching | API routes + TanStack React Query |
| Favorites | Client-side context with localStorage (FR010 Cookbook CRUD) |

## Stage 1: Infrastructure, Auth, Layouts & Database Configuration

**Goal:** Build foundational scaffolding, client routing skeleton, reusable UI, Neon connection, and auth wiring.

| File | Owner | Purpose |
|---|---|---|
| `.env.local` | Samuel | Stores `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET` |
| `package.json` dependencies | Samuel | Install `@neondatabase/serverless`, `@neondatabase/auth`, `@tanstack/react-query` |
| `src/lib/db.js` | Samuel | Reusable `neon()` SQL client for database queries |
| `src/db/schema.sql` | Samuel | Defines the `recipes` table structure |
| `src/lib/auth/server.js` | Samuel | Server-side Neon Auth instance with `createNeonAuth()` |
| `src/lib/auth/client.js` | Samuel | Browser-side auth client with `createAuthClient()` |
| `src/app/api/auth/[...all]/route.js` | Samuel | Catch-all auth API handlers |
| `middleware.js` | Samuel | Protects `/recipes` and `/favorites` routes for signed-in users |
| `src/provider/queryClient.js` | Samuel | React Query client setup |
| `src/provider/QueryProvider.jsx` | Samuel | Top-level provider wrapping the app with React Query |
| `src/app/layout.js` | Samuel | Mounts providers, global styles, Navbar, and Footer |
| `src/app/page.js` | Earl | Root `/` landing page |
| `src/app/sign-in/page.js` | Earl | Sign-in page shell |
| `src/components/sign-in-form.jsx` | Earl | Client sign-in form using `useActionState` |
| `src/components/ui/Button.jsx` | Earl | Styled atomic button component |
| `src/components/ui/Loader.jsx` | Earl | Loading spinner component |
| `src/components/layout/Navbar.jsx` | Earl | Responsive navigation bar |
| `src/components/layout/Footer.jsx` | Earl | Global footer |
| `src/components/category/CategoryCard.jsx` | Earl | Category visual card |
| `src/components/category/CategoryList.jsx` | Earl | Category list container |
| `src/utils/index.js` | Samuel | Shared helper utilities |

## Stage 2: Server Actions, Seeding, Error Handling & Favorites Context

**Goal:** Populate Neon with sample recipes, add auth server actions, set error/fallback boundaries, and initialize cookbook state.

| File | Owner | Purpose |
|---|---|---|
| `src/app/actions/auth.js` | Samuel | Server Action for form-based sign-in |
| `src/db/seed.sql` | Samuel | Sample recipe data for initial database population |
| `src/provider/queries.js` | Samuel | Database seeding helpers and SQL query functions |
| `src/app/error.js` | Samuel | Root client error boundary for DB/fetch failures |
| `src/app/not-found.js` | Earl | 404 page for unmatched routes |
| `src/context/FavoritesContext.js` | Earl | React Context definition for favorite recipes |
| `src/context/FavoritesState.jsx` | Earl | Provider managing add, list, update note, and delete actions |
| `src/context/index.js` | Earl | Re-export for context hooks |

## Stage 3: Core Features — Recipes API, Search, Details & Cookbook

**Goal:** Connect server queries to user-facing pages, implement search, recipe details, and cookbook management.

| File | Owner | Purpose |
|---|---|---|
| `src/app/api/recipes/route.js` | Samuel | GET all recipes and POST new recipe (auth-guarded) |
| `src/app/recipes/page.js` | Samuel | Protected page listing all recipes |
| `src/app/recipes/[id]/page.js` | Samuel | Dynamic recipe detail page |
| `src/app/search/page.js` | Earl | Search results page executing server-side query |
| `src/app/favorites/page.js` | Earl | Cookbook page rendering saved recipes and note editing |
| `src/components/recipe/RecipeCard.jsx` | Samuel | Recipe summary card with title, image, and tags |
| `src/components/recipe/RecipeList.jsx` | Samuel | Grid layout rendering `RecipeCard` items |
| `src/components/recipe/RecipeDetails.jsx` | Samuel | Full recipe view with ingredients and instructions |
| `src/components/recipe/RecipeForm.jsx` | Earl | New recipe form with React Query mutation |
| `src/components/ui/SearchBar.jsx` | Earl | Search input managing URL query parameters |
| `src/components/recipe/RecipeFilters.jsx` | Earl | Category pills and sorting controls |

## Stage 4: Loading Experience, Deployment & Documentation

**Goal:** Handle data-fetching transition states, deploy to Vercel, and complete project documentation.

| File | Owner | Purpose |
|---|---|---|
| `src/app/loading.js` | Samuel | Next.js streaming loading state using `Loader.jsx` |
| Vercel build and environment | Samuel | Configure production environment variables and verify build |
| `README.md` | Earl | Project overview, setup guide, Neon documentation, and TypeScript roadmap |

## Collaboration Workflow

- Use the `dev` branch for daily integration.
- Create feature branches from `dev` for every task.
- Open Pull Requests to `dev` and require partner review before merging.
- Merge `dev` into `main` only when a stage is complete and tested.
- All environment variables stay in `.env.local` and are never committed.

## Week 2 TypeScript Refactor

- Rename `.js` and `.jsx` files to `.ts` and `.tsx` where appropriate.
- Add a `src/types/` folder with interfaces for recipes, favorites, and auth sessions.
- Type dynamic route parameters as `Promise<{ id: string }>`.
