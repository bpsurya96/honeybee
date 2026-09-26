-- ============================================================
-- HoneyBee Learning � Seed Data
-- Demo data only. Mark clearly as demo.
-- ============================================================

-- ---- Age Stages ----
INSERT INTO age_stages (label, min_months, max_months, description, display_order) VALUES
    ('0-6 months',       0,  5,  'Newborn stage. Sensory exploration and basic motor development.',     1),
    ('6-12 months',      6,  11, 'Baby stage. Object permanence, sitting, early communication.',        2),
    ('1-2 years',        12, 23, 'Early toddler. Walking, first words, exploratory play.',              3),
    ('2-3 years',        24, 35, 'Toddler. Language explosion, imaginative play, self-awareness.',      4),
    ('3-4 years',        36, 47, 'Pre-schooler. Social play, early literacy, number concepts.',         5),
    ('4-5 years',        48, 59, 'Pre-kindergarten. Letter recognition, counting, complex play.',       6)
ON CONFLICT DO NOTHING;

-- ---- Skill Categories ----
INSERT INTO skill_categories (name, description, icon, colour, display_order) VALUES
    ('Fine Motor Skills',               'Hand and finger strength, coordination, and dexterity.',         '🎨', '#f59e0b', 1),
    ('Language & Communication',        'Listening, speaking, vocabulary, and early literacy.',           '🗣️', '#3b82f6', 2),
    ('Early Numeracy',                  'Counting, number recognition, sorting, and patterns.',           '🔢', '#10b981', 3),
    ('Cognitive Skills',                'Memory, attention, sequencing, and reasoning.',                  '🧠', '#8b5cf6', 4),
    ('Problem Solving',                 'Puzzles, cause-and-effect, and spatial reasoning.',              '🧩', '#f97316', 5),
    ('Creativity',                      'Art, imagination, music, and open-ended play.',                  '🎭', '#ec4899', 6),
    ('Pre-writing',                     'Pencil grip, line tracing, shapes, and letter formation.',       '✍️', '#06b6d4', 7),
    ('Sensory Exploration',             'Touch, texture, sound, smell, and visual discovery.',            '🖐️', '#84cc16', 8),
    ('Social & Emotional Learning',     'Sharing, empathy, turn-taking, and self-regulation.',            '🤝', '#ef4444', 9)
ON CONFLICT DO NOTHING;

-- ---- Sample Products ----
INSERT INTO products (name, slug, description, price, age_min_months, age_max_months) VALUES
    (
        'First Strokes Activity Book',
        'first-strokes-activity-book',
        'A gentle introduction to mark-making and pre-writing skills. Includes 30 tracing activities that develop pencil control, hand-eye coordination, and fine motor strength.',
        12.99,
        36, 60
    ),
    (
        'Little Explorer Sensory Kit',
        'little-explorer-sensory-kit',
        'Hands-on sensory exploration for babies and toddlers. 20 guided sensory activities covering texture, colour, sound, and movement.',
        18.99,
        6, 36
    ),
    (
        'Number Bees Numeracy Book',
        'number-bees-numeracy-book',
        'Fun and engaging early maths activities for pre-schoolers. Counting, sorting, patterns, and simple addition through play.',
        14.99,
        36, 72
    )
ON CONFLICT DO NOTHING;

-- ---- Sample Skills ----
-- We join these to categories. Using subqueries to get category IDs.
INSERT INTO skills (category_id, name, description, display_order) VALUES
    -- Fine Motor
    ((SELECT id FROM skill_categories WHERE name = 'Fine Motor Skills'), 'Pencil Grip',         'Holding a pencil or crayon correctly.',      1),
    ((SELECT id FROM skill_categories WHERE name = 'Fine Motor Skills'), 'Pincer Grip',         'Picking up small objects with finger and thumb.', 2),
    ((SELECT id FROM skill_categories WHERE name = 'Fine Motor Skills'), 'Line Tracing',        'Tracing along lines and paths.',             3),
    ((SELECT id FROM skill_categories WHERE name = 'Fine Motor Skills'), 'Shape Drawing',       'Drawing basic shapes independently.',        4),
    -- Language
    ((SELECT id FROM skill_categories WHERE name = 'Language & Communication'), 'Vocabulary Building', 'Learning new words through context.', 1),
    ((SELECT id FROM skill_categories WHERE name = 'Language & Communication'), 'Listening Skills',    'Following simple instructions.',         2),
    -- Numeracy
    ((SELECT id FROM skill_categories WHERE name = 'Early Numeracy'), 'Counting 1-5',     'Counting objects up to 5.',                  1),
    ((SELECT id FROM skill_categories WHERE name = 'Early Numeracy'), 'Counting 1-10',    'Counting objects up to 10.',                 2),
    ((SELECT id FROM skill_categories WHERE name = 'Early Numeracy'), 'Number Recognition','Recognising numerals 1-10.',                3),
    ((SELECT id FROM skill_categories WHERE name = 'Early Numeracy'), 'Sorting',          'Sorting objects by colour, size, or shape.', 4),
    -- Cognitive
    ((SELECT id FROM skill_categories WHERE name = 'Cognitive Skills'), 'Attention & Focus',  'Sustained attention on a task.',            1),
    ((SELECT id FROM skill_categories WHERE name = 'Cognitive Skills'), 'Sequencing',         'Understanding order and sequences.',        2),
    -- Sensory
    ((SELECT id FROM skill_categories WHERE name = 'Sensory Exploration'), 'Texture Exploration', 'Experiencing different textures.',        1),
    ((SELECT id FROM skill_categories WHERE name = 'Sensory Exploration'), 'Colour Recognition',  'Identifying and naming colours.',         2),
    -- Pre-writing
    ((SELECT id FROM skill_categories WHERE name = 'Pre-writing'), 'Horizontal Lines',   'Tracing and drawing horizontal lines.',      1),
    ((SELECT id FROM skill_categories WHERE name = 'Pre-writing'), 'Vertical Lines',     'Tracing and drawing vertical lines.',        2),
    ((SELECT id FROM skill_categories WHERE name = 'Pre-writing'), 'Curved Lines',       'Tracing and drawing curves.',                3)
ON CONFLICT DO NOTHING;

-- ---- Sample Activities: First Strokes Activity Book ----
INSERT INTO activities (product_id, name, description, instructions, age_min_months, age_max_months, difficulty, sequence_order, duration_mins) VALUES
    (
        (SELECT id FROM products WHERE slug = 'first-strokes-activity-book'),
        'My First Horizontal Lines',
        'Trace the horizontal lines to help the bee reach the flower.',
        'Point to the bee at the start of each line. Encourage your child to hold their crayon and trace slowly from left to right. Celebrate each completed line! Repeat up to 3 times.',
        36, 60, 1, 1, 5
    ),
    (
        (SELECT id FROM products WHERE slug = 'first-strokes-activity-book'),
        'Vertical Lines Practice',
        'Trace the vertical lines to help raindrops reach the puddle.',
        'Show your child how to move the crayon from top to bottom. Practice in the air first, then on paper. Praise effort, not perfection.',
        36, 60, 1, 2, 5
    ),
    (
        (SELECT id FROM products WHERE slug = 'first-strokes-activity-book'),
        'Curved Lines � Follow the Rainbow',
        'Trace the rainbow arches from one cloud to another.',
        'Curved lines require more control. Demonstrate the smooth arching movement. Let your child try slowly, then faster as confidence grows.',
        36, 60, 2, 3, 7
    ),
    (
        (SELECT id FROM products WHERE slug = 'first-strokes-activity-book'),
        'Zigzag Lines � Lightning Bolts',
        'Trace the zigzag lightning bolts across the sky.',
        'Change direction tracing is a new challenge. Go slowly and praise each direction change. This builds the hand-eye coordination needed for letters.',
        42, 60, 2, 4, 7
    ),
    (
        (SELECT id FROM products WHERE slug = 'first-strokes-activity-book'),
        'Circle Tracing � Bubble Shapes',
        'Trace the big and small bubbles.',
        'Circles prepare children for letters like O, C, D, G. Start big and go smaller. Encourage smooth, continuous movement without lifting the pencil.',
        42, 60, 3, 5, 8
    )
ON CONFLICT DO NOTHING;

-- ---- Sample Activities: Little Explorer Sensory Kit ----
INSERT INTO activities (product_id, name, description, instructions, age_min_months, age_max_months, difficulty, sequence_order, duration_mins) VALUES
    (
        (SELECT id FROM products WHERE slug = 'little-explorer-sensory-kit'),
        'Texture Touch Boards',
        'Explore soft, rough, bumpy, and smooth textures.',
        'Present one texture at a time. Let your baby or toddler touch and explore freely. Describe each texture: "This is soft like a cloud!" Watch their reactions.',
        6, 36, 1, 1, 10
    ),
    (
        (SELECT id FROM products WHERE slug = 'little-explorer-sensory-kit'),
        'Colour Discovery',
        'Match coloured objects to their colour cards.',
        'Lay out 3-4 colour cards. Pick up an object and name its colour. Place it on the matching card. Let your child try. Celebrate each match.',
        18, 36, 1, 2, 10
    ),
    (
        (SELECT id FROM products WHERE slug = 'little-explorer-sensory-kit'),
        'Sound Shaker Exploration',
        'Listen to different sounds from the shaker bottles.',
        'Shake one bottle at a time. Encourage listening. Can they tell which is loud and which is quiet? Make it a guessing game.',
        6, 36, 1, 3, 8
    )
ON CONFLICT DO NOTHING;

-- ---- Sample Activities: Number Bees Numeracy Book ----
INSERT INTO activities (product_id, name, description, instructions, age_min_months, age_max_months, difficulty, sequence_order, duration_mins) VALUES
    (
        (SELECT id FROM products WHERE slug = 'number-bees-numeracy-book'),
        'Count the Bees 1-5',
        'Count and circle the groups of bees.',
        'Point to each bee as you count together. Say the number out loud. When done, write the number next to each group. Repeat the activity orally during the day.',
        36, 60, 1, 1, 8
    ),
    (
        (SELECT id FROM products WHERE slug = 'number-bees-numeracy-book'),
        'Number Tracing 1-10',
        'Trace the numbers 1 to 10 in the honeycomb.',
        'Show correct number formation before your child traces. Encourage them to say each number aloud as they write it. Correct grip and formation matter more than speed.',
        36, 60, 1, 2, 10
    ),
    (
        (SELECT id FROM products WHERE slug = 'number-bees-numeracy-book'),
        'Big and Small Sorting',
        'Sort the honey jars from biggest to smallest.',
        'Ask: "Which jar is biggest?" and "Which is smallest?" Start with 3 jars, then increase to 5. This builds early mathematical thinking.',
        36, 60, 2, 3, 8
    ),
    (
        (SELECT id FROM products WHERE slug = 'number-bees-numeracy-book'),
        'Counting to 10 � Flower Petals',
        'Count how many petals each flower has and write the number.',
        'Point to each petal and count together. This combines counting with number recognition and early writing.',
        42, 60, 2, 4, 10
    )
ON CONFLICT DO NOTHING;

-- ============================================================
-- END OF SEED DATA
-- ============================================================
