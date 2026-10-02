update recipes
set category = case title
    when 'Spaghetti Carbonara' then 'pasta'
    when 'Chicken Stir Fry' then 'chicken'
    when 'Vegetable Curry' then 'vegetarian'
    when 'Classic Pancakes' then 'breakfast'
end
where user_id = 'seed-user' and category = 'other'
    and title in ('Spaghetti Carbonara', 'Chicken Stir Fry', 'Vegetable Curry', 'Classic Pancakes');
