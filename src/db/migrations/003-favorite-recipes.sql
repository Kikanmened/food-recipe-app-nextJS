create table if not exists favorite_recipes (
    user_id     text not null,
    recipe_id   uuid not null references recipes (id) on delete cascade,
    title       text not null,
    image_url   text,
    note        text not null default '',
    created_at  timestamptz not null default now(),
    primary key (user_id, recipe_id)
);
