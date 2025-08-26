import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  // Example seed data
  const users = [
    { email: 'user1@example.com', password: 'password1' },
    { email: 'user2@example.com', password: 'password2' },
  ];

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert(users);

  if (userError) {
    console.error('Error seeding users:', userError);
  } else {
    console.log('Users seeded:', userData);
  }

  // Add more seed data as needed
}

seedDatabase()
  .then(() => {
    console.log('Seeding completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });