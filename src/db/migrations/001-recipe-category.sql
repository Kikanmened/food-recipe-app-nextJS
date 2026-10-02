alter table recipes add column if not exists category text not null default 'other'
    constraint recipes_category_check
    check (category in ('pasta', 'chicken', 'vegetarian', 'breakfast', 'other'));
