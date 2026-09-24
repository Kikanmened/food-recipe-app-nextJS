-- Schema and sample recipes for development and testing
-- Run this file once to create the table and populate it with sample data.

create table if not exists recipes (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null,
    title       text not null,
    ingredients jsonb not null,
    steps       text[] not null,
    created_at  timestamptz default now()
);

INSERT INTO recipes (user_id, title, ingredients, steps) VALUES
(
  'seed-user',
  'Spaghetti Carbonara',
  '[
    {"name": "spaghetti", "amount": "400g"},
    {"name": "eggs", "amount": "4 large"},
    {"name": "pecorino cheese", "amount": "100g"},
    {"name": "guanciale", "amount": "150g"},
    {"name": "black pepper", "amount": "to taste"}
  ]'::jsonb,
  ARRAY[
    'Boil a large pot of salted water and cook the spaghetti until al dente.',
    'While the pasta cooks, cut the guanciale into small strips and fry until crispy.',
    'Beat the eggs in a bowl and mix in the grated pecorino cheese and black pepper.',
    'Drain the spaghetti, reserving a cup of pasta water.',
    'Toss the hot pasta with the guanciale, then remove from heat.',
    'Stir in the egg and cheese mixture, adding pasta water until creamy.',
    'Serve immediately with extra black pepper and cheese.'
  ]
),
(
  'seed-user',
  'Chicken Stir Fry',
  '[
    {"name": "chicken breast", "amount": "500g"},
    {"name": "soy sauce", "amount": "3 tbsp"},
    {"name": "bell peppers", "amount": "2"},
    {"name": "broccoli", "amount": "1 head"},
    {"name": "garlic", "amount": "3 cloves"},
    {"name": "vegetable oil", "amount": "2 tbsp"}
  ]'::jsonb,
  ARRAY[
    'Slice the chicken breast into thin strips.',
    'Chop the bell peppers and broccoli into bite-sized pieces.',
    'Heat oil in a large pan or wok over high heat.',
    'Cook the chicken until browned and cooked through, then remove from the pan.',
    'Stir fry the vegetables and garlic for 3-4 minutes until tender-crisp.',
    'Return the chicken to the pan and add soy sauce.',
    'Toss everything together and serve hot over rice or noodles.'
  ]
),
(
  'seed-user',
  'Vegetable Curry',
  '[
    {"name": "chickpeas", "amount": "1 can"},
    {"name": "coconut milk", "amount": "400ml"},
    {"name": "spinach", "amount": "200g"},
    {"name": "onion", "amount": "1"},
    {"name": "curry powder", "amount": "2 tbsp"},
    {"name": "tomatoes", "amount": "2"}
  ]'::jsonb,
  ARRAY[
    'Dice the onion and tomatoes.',
    'Saute the onion in a large pot until softened.',
    'Add the curry powder and cook for 1 minute until fragrant.',
    'Add the tomatoes, chickpeas, and coconut milk.',
    'Simmer for 15 minutes, stirring occasionally.',
    'Stir in the spinach and cook until wilted.',
    'Serve with rice or flatbread.'
  ]
),
(
  'seed-user',
  'Classic Pancakes',
  '[
    {"name": "flour", "amount": "200g"},
    {"name": "milk", "amount": "300ml"},
    {"name": "eggs", "amount": "2"},
    {"name": "baking powder", "amount": "2 tsp"},
    {"name": "sugar", "amount": "2 tbsp"},
    {"name": "butter", "amount": "for cooking"}
  ]'::jsonb,
  ARRAY[
    'Whisk together the flour, baking powder, sugar, and a pinch of salt.',
    'In a separate bowl, beat the eggs and mix in the milk.',
    'Pour the wet ingredients into the dry ingredients and stir until just combined.',
    'Heat a non-stick pan and melt a small amount of butter.',
    'Pour in batter to form pancakes and cook until bubbles form on the surface.',
    'Flip and cook until golden brown on the other side.',
    'Serve with syrup, fruit, or your favorite toppings.'
  ]
);
