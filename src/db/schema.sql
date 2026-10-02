create table recipes (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    title       text not null,
    ingredients jsonb not null,
    steps       text[] not null,
    image_url   text,
    created_at  timestamptz default now()
);

create table if not exists favorite_recipes (
    user_id     text not null,
    recipe_id   uuid not null references recipes (id) on delete cascade,
    title       text not null,
    image_url   text,
    note        text not null default '',
    created_at  timestamptz not null default now(),
    primary key (user_id, recipe_id)
);
