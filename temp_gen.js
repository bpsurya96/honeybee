const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('/home/bpsurya96/projects/honeybee_V2/.env', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"?(.*?)\"?\r?\n/)[1];
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*?)\r?\n/)[1];
const supabase = createClient(url, key);

async function run() {
  console.log('Fetching products and skills...');
  const { data: products } = await supabase.from('products').select('id, name, description, age_min_months, age_max_months');
  const { data: skills } = await supabase.from('skills').select('id, name, category_id');

  // Helper to find a skill by name keyword
  const findSkill = (keywords) => {
    for (const kw of keywords) {
      const match = skills.find(s => s.name.toLowerCase().includes(kw));
      if (match) return match;
    }
    // Default to a generic cognitive or pre-writing skill if none found
    return skills.find(s => s.name.toLowerCase().includes('focus')) || skills[0];
  };

  let activitiesInserted = 0;
  let skillsInserted = 0;

  for (const product of products) {
    // Check if product already has activities
    const { data: existingActivities } = await supabase.from('activities').select('id').eq('product_id', product.id);
    if (existingActivities && existingActivities.length > 0) continue; // Skip if already populated

    console.log(`Generating activities for: ${product.name}`);
    
    let theme = "Learning";
    let targetSkill = null;
    let targetSkill2 = null;
    
    const text = (product.name + " " + product.description).toLowerCase();
    
    if (text.includes('math') || text.includes('number') || text.includes('addition') || text.includes('counting')) {
      theme = "Numeracy";
      targetSkill = findSkill(['counting', 'number', 'recognising']);
      targetSkill2 = findSkill(['sorting', 'focus']);
    } else if (text.includes('tracing') || text.includes('writing') || text.includes('stroke')) {
      theme = "Pre-writing";
      targetSkill = findSkill(['line', 'grip', 'horizontal', 'vertical']);
      targetSkill2 = findSkill(['focus', 'attention']);
    } else if (text.includes('alphabet') || text.includes('phonics') || text.includes('tamil') || text.includes('hindi')) {
      theme = "Language";
      targetSkill = findSkill(['vocabulary', 'listening']);
      targetSkill2 = findSkill(['grip', 'line']);
    } else if (text.includes('sensory') || text.includes('visual') || text.includes('baby')) {
      theme = "Sensory";
      targetSkill = findSkill(['texture', 'colour', 'sensory']);
      targetSkill2 = findSkill(['attention']);
    } else {
      theme = "Exploration";
      targetSkill = findSkill(['focus', 'sequencing']);
      targetSkill2 = findSkill(['grip', 'pincer']);
    }

    const newActivities = [
      {
        product_id: product.id,
        name: `${theme} Introduction: Day 1`,
        description: `Begin your journey with the ${product.name}. Let your child explore the book and get familiar with the concepts.`,
        instructions: `Sit with your child in a quiet room. Point to the colorful illustrations and talk about what they see. Spend 10 minutes tracing or identifying the first few elements.`,
        age_min_months: product.age_min_months || 24,
        age_max_months: product.age_max_months || 60,
        difficulty: 1,
        sequence_order: 1,
        duration_mins: 10
      },
      {
        product_id: product.id,
        name: `${theme} Practice: Day 2`,
        description: `Hands-on practice using the ${product.name} to build confidence and fine motor skills.`,
        instructions: `Hand the child a marker or their finger. Guide their hand for the first try, then let them attempt it independently. Celebrate all efforts!`,
        age_min_months: product.age_min_months || 24,
        age_max_months: product.age_max_months || 60,
        difficulty: 2,
        sequence_order: 2,
        duration_mins: 15
      },
      {
        product_id: product.id,
        name: `${theme} Mastery: Day 3`,
        description: `Independent practice session to solidify the concepts learned in the ${product.name}.`,
        instructions: `Allow the child to navigate the activities on their own. Ask them open-ended questions like 'What comes next?' or 'Can you show me how to do this?'`,
        age_min_months: product.age_min_months || 24,
        age_max_months: product.age_max_months || 60,
        difficulty: 3,
        sequence_order: 3,
        duration_mins: 15
      }
    ];

    for (const act of newActivities) {
      const { data: actData, error: actError } = await supabase.from('activities').insert(act).select().single();
      if (actError) {
        console.error('Error inserting activity:', actError);
        continue;
      }
      activitiesInserted++;

      // Insert Activity Skills
      if (targetSkill) {
        await supabase.from('activity_skills').insert({
          activity_id: actData.id,
          skill_id: targetSkill.id,
          weighting: 1
        });
        skillsInserted++;
      }
      if (targetSkill2) {
        await supabase.from('activity_skills').insert({
          activity_id: actData.id,
          skill_id: targetSkill2.id,
          weighting: 1
        });
        skillsInserted++;
      }
    }
  }

  console.log(`Successfully generated and mapped ${activitiesInserted} activities and ${skillsInserted} skill links!`);
}
run();
