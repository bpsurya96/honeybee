-- ============================================================
-- HONEYBEE V2 - SEED DATA
-- ============================================================

-- Note: In a production DB, run this after migrating.
-- For local dev, this is applied automatically by Supabase.

-- 1. AGE STAGES
INSERT INTO age_stages (id, name, min_months, max_months, description) VALUES
('a0000000-0000-0000-0000-000000000001', '0-1 Years', 0, 12, 'Infancy and early exploration'),
('a0000000-0000-0000-0000-000000000002', '1-2 Years', 13, 24, 'Toddlerhood, first steps and words'),
('a0000000-0000-0000-0000-000000000003', '2-3 Years', 25, 36, 'Early preschool, independent play'),
('a0000000-0000-0000-0000-000000000004', '3-4 Years', 37, 48, 'Preschool, complex sentences and imagination')
ON CONFLICT (id) DO NOTHING;

-- 2. LEARNING AREAS
INSERT INTO learning_areas (id, name, description, display_order) VALUES
('11000000-0000-0000-0000-000000000001', 'Language & Communication', 'Developing speech, vocabulary, and listening', 1),
('11000000-0000-0000-0000-000000000002', 'Fine Motor', 'Small muscle movements and hand-eye coordination', 2),
('11000000-0000-0000-0000-000000000003', 'Cognitive', 'Problem solving, memory, and thinking', 3),
('11000000-0000-0000-0000-000000000004', 'Creativity', 'Creative expression and imagination', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. SKILLS
INSERT INTO skills (id, learning_area_id, name, description) VALUES
-- Language
('55000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Vocabulary', 'Learning new words'),
('55000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'Listening', 'Paying attention to sounds and words'),
-- Fine Motor
('55000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'Pincer Grasp', 'Picking up small objects'),
('55000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002', 'Hand-Eye Coordination', 'Using eyes and hands together'),
-- Cognitive
('55000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000003', 'Shape Recognition', 'Identifying basic shapes'),
('55000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000003', 'Cause and Effect', 'Understanding actions have consequences'),
-- Creativity
('55000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000004', 'Pretend Play', 'Engaging in imaginative play scenarios')
ON CONFLICT (id) DO NOTHING;

-- 4. AGE STAGE TO SKILLS
INSERT INTO age_stage_skills (age_stage_id, skill_id) VALUES
('a0000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000002'), -- 0-1: Listening
('a0000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000003'), -- 0-1: Pincer
('a0000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000006'), -- 0-1: Cause/Effect
('a0000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000001'), -- 1-2: Vocab
('a0000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000004'), -- 1-2: Hand-Eye
('a0000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000005'), -- 1-2: Shapes
('a0000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000007'), -- 1-2: Pretend
('a0000000-0000-0000-0000-000000000003', '55000000-0000-0000-0000-000000000001'), -- 2-3: Vocab
('a0000000-0000-0000-0000-000000000003', '55000000-0000-0000-0000-000000000004'), -- 2-3: Hand-Eye
('a0000000-0000-0000-0000-000000000003', '55000000-0000-0000-0000-000000000007')  -- 2-3: Pretend
ON CONFLICT (age_stage_id, skill_id) DO NOTHING;

-- 5. PRODUCTS
INSERT INTO products (id, name, slug, description, price, min_age_months, max_age_months) VALUES
('ff000000-0000-0000-0000-000000000001', 'Sensory Explorer Kit', 'sensory-explorer-kit', 'A wonderful kit designed for early sensory development.', 29.99, 0, 12),
('ff000000-0000-0000-0000-000000000002', 'Toddler Language Blocks', 'toddler-language-blocks', 'Colorful blocks with animals and letters to boost vocabulary.', 34.99, 12, 36)
ON CONFLICT (id) DO NOTHING;

-- 6. PRODUCT IMAGES
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
('ff000000-0000-0000-0000-000000000001', 'https://placehold.co/800x800/e0f2fe/0369a1?text=Sensory+Explorer+1', 1, true),
('ff000000-0000-0000-0000-000000000001', 'https://placehold.co/800x800/e0f2fe/0369a1?text=Sensory+Explorer+2', 2, false),
('ff000000-0000-0000-0000-000000000002', 'https://placehold.co/800x800/fef08a/a16207?text=Language+Blocks+1', 1, true),
('ff000000-0000-0000-0000-000000000002', 'https://placehold.co/800x800/fef08a/a16207?text=Language+Blocks+2', 2, false);

-- 7. PRODUCT SKILLS (Overall skills supported by product)
INSERT INTO product_skills (product_id, skill_id) VALUES
('ff000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000002'),
('ff000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000003'),
('ff000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000006'),
('ff000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000001'),
('ff000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000004'),
('ff000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000007')
ON CONFLICT (product_id, skill_id) DO NOTHING;

-- 8. ACTIVITIES
INSERT INTO activities (id, product_id, title, description, display_order) VALUES
('ac000000-0000-0000-0000-000000000001', 'ff000000-0000-0000-0000-000000000001', 'Sound Shaker', 'Shake the rattles and identify the different sounds.', 1),
('ac000000-0000-0000-0000-000000000002', 'ff000000-0000-0000-0000-000000000001', 'Pick up the bead', 'Practice grabbing the wooden bead.', 2),
('ac000000-0000-0000-0000-000000000003', 'ff000000-0000-0000-0000-000000000002', 'Name the Animal', 'Hold up a block and ask your child to name the animal.', 1),
('ac000000-0000-0000-0000-000000000004', 'ff000000-0000-0000-0000-000000000002', 'Build a Tower', 'Stack the blocks as high as you can.', 2)
ON CONFLICT (id) DO NOTHING;

-- 9. ACTIVITY SKILLS (Specific skills per activity)
INSERT INTO activity_skills (activity_id, skill_id) VALUES
('ac000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000002'),
('ac000000-0000-0000-0000-000000000001', '55000000-0000-0000-0000-000000000006'),
('ac000000-0000-0000-0000-000000000002', '55000000-0000-0000-0000-000000000003'),
('ac000000-0000-0000-0000-000000000003', '55000000-0000-0000-0000-000000000001'),
('ac000000-0000-0000-0000-000000000004', '55000000-0000-0000-0000-000000000004')
ON CONFLICT (activity_id, skill_id) DO NOTHING;
