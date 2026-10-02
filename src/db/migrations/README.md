# Database Migrations

## Favorites

Run `npm run migrate:favorites` against the deployment's `DATABASE_URL` before
deploying favorites. This creates the missing `favorite_recipes` table without
changing existing recipes or favorites. It is safe to rerun. The composite
primary key prevents the same account from saving a recipe twice; separate
accounts can each save it. Keep this table when rolling back application code
to preserve saved favorites and notes.

## Recipe Categories

Before deploying the category-aware app, run `npm run migrate:categories`
against that environment's `DATABASE_URL`. The runner reads `.env.local` using
Next.js's environment loader without overriding existing environment variables.

The migration adds a required category with an `other` default so the previous
app version can continue creating recipes. Only the four known built-in sample
recipes are assigned specific categories. Other existing recipes are preserved
as `other` and their owners can select a category when editing.

The script runs both migrations in a transaction and is safe to rerun. No recipe
or favorite is deleted. New form submissions must explicitly select a category.

## Rollback

Roll back application code first and leave the extra column in place. This
preserves category choices and is compatible with the previous app. Removing
the column would discard those choices and is intentionally not automatic.
