const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetProducts() {
  console.log('Deleting existing products...');
  const { error: err1 } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error(err1);
  const { error: err2 } = await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: err3 } = await supabase.from('skill_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: err4 } = await supabase.from('age_stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Inserting Age Stages...');
  const stages = [
    { label: '0-6 months', min_months: 0, max_months: 5, display_order: 1 },
    { label: '6-12 months', min_months: 6, max_months: 11, display_order: 2 },
    { label: '1-2 years', min_months: 12, max_months: 23, display_order: 3 },
    { label: '2-3 years', min_months: 24, max_months: 35, display_order: 4 },
    { label: '3-4 years', min_months: 36, max_months: 47, display_order: 5 },
    { label: '4-5 years', min_months: 48, max_months: 59, display_order: 6 },
    { label: '5-6 years', min_months: 60, max_months: 71, display_order: 7 },
    { label: '6-7 years', min_months: 72, max_months: 83, display_order: 8 }
  ];
  const { data: ageData, error: ageErr } = await supabase.from('age_stages').insert(stages).select();
  if (ageErr) throw ageErr;

  console.log('Inserting Skill Categories...');
  const categories = [
    { name: 'Fine Motor Skills', description: 'Hand and finger strength.', display_order: 1, active: true },
    { name: 'Language & Communication', description: 'Listening and speaking.', display_order: 2, active: true },
    { name: 'Cognitive Skills', description: 'Memory and problem solving.', display_order: 3, active: true }
  ];
  const { data: catData, error: catErr } = await supabase.from('skill_categories').insert(categories).select();
  if (catErr) throw catErr;

  console.log('Inserting Skills...');
  const skills = [
    { category_id: catData[0].id, age_stage_id: ageData[3].id, name: 'Pencil Grip', description: 'Holding a pencil', display_order: 1 },
    { category_id: catData[1].id, age_stage_id: ageData[3].id, name: 'Vocabulary', description: 'Naming things', display_order: 1 },
    { category_id: catData[2].id, age_stage_id: ageData[3].id, name: 'Sorting', description: 'Grouping by type', display_order: 1 }
  ];
  const { data: skillData, error: skillErr } = await supabase.from('skills').insert(skills).select();
  if (skillErr) throw skillErr;

  console.log('Inserting Product...');
  const product = {
    name: 'Developmental Learning Kit 2-3 Years',
    slug: 'dev-kit-2-3',
    description: 'A comprehensive kit for toddlers focusing on language, motor skills, and problem solving.',
    price: 29.99,
    age_min_months: 24,
    age_max_months: 35,
    active: true,
    image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'
  };
  const { data: prodData, error: prodErr } = await supabase.from('products').insert([product]).select();
  if (prodErr) throw prodErr;

  console.log('Inserting Product Skills...');
  await supabase.from('product_skills').insert([
    { product_id: prodData[0].id, skill_id: skillData[0].id },
    { product_id: prodData[0].id, skill_id: skillData[1].id },
    { product_id: prodData[0].id, skill_id: skillData[2].id }
  ]);

  console.log('Inserting Activities...');
  const activities = [
    { product_id: prodData[0].id, name: 'Sorting Colors', instructions: 'Sort items by color.', age_min_months: 24, age_max_months: 35, difficulty: 1, sequence_order: 1 },
    { product_id: prodData[0].id, name: 'Name the Animal', instructions: 'Say the animal name.', age_min_months: 24, age_max_months: 35, difficulty: 1, sequence_order: 2 }
  ];
  const { data: actData, error: actErr } = await supabase.from('activities').insert(activities).select();
  if (actErr) throw actErr;

  console.log('Inserting Activity Skills...');
  await supabase.from('activity_skills').insert([
    { activity_id: actData[0].id, skill_id: skillData[2].id },
    { activity_id: actData[1].id, skill_id: skillData[1].id }
  ]);

  console.log('Done!');
}
resetProducts();
