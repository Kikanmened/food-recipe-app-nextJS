# Food Recipe App (Next.js)

A recipe discovery app built with Next.js, Tailwind CSS, and DaisyUI. This is a group project for the Recipe Book assignment.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript for week 1, with a TypeScript refactor planned for week 2
- **Styling:** Tailwind CSS v4 + DaisyUI
- **Data Fetching:** React Query (client-side) and Next.js server functions (server-side)
- **Database:** Neon (to be integrated when instructed)
- **Deployment:** Vercel

## Features (planned)

- Search recipes by name
- View detailed recipe instructions and ingredients
- Save favorite recipes (client-side until Neon CRUD is added)
- Loading and error states for all data-driven pages
- Responsive design with Tailwind CSS and DaisyUI

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```text
src/
  app/              # Next.js App Router pages
  components/       # Reusable UI components
  context/          # React context providers (e.g., favorites)
  provider/         # React Query provider setup
  utils/            # Server functions and utility helpers
  types/            # TypeScript types (added during week 2 refactor)
```

## Git Workflow

- The repository is public at [https://github.com/Kikanmened/food-recipe-app-nextJS](https://github.com/Kikanmened/food-recipe-app-nextJS).
- All changes must be merged into `main` via pull request.
- Make small, frequent commits with clear messages.

## Roadmap

- **Week 1:** Build the app in JavaScript with Next.js, Tailwind, DaisyUI, and React Query. Integrate Neon for data fetching when instructions are provided.
- **Week 2:** Refactor the codebase to TypeScript, add `src/types/`, and continue feature development.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
