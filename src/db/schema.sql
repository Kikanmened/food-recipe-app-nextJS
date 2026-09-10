create table recipes (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    title       text not null,
    ingredients jsonb not null,
    steps       text[] not null,
    created_at  timestamptz default now()
);