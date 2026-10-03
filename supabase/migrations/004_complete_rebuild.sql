-- HoneyBee Learning V2 -- Complete Schema Rebuild (Migration 004)
-- Run entire script in Supabase SQL Editor > New Query
-- This wipes all tables and rebuilds them correctly.

-- STEP 1: DROP ALL TABLES AND FUNCTIONS
DROP TABLE IF EXISTS ai_usage_log CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS child_activities CASCADE;
DROP TABLE IF EXISTS child_products CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_children CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS ai_credit_transactions CASCADE;
DROP TABLE IF EXISTS ai_credit_accounts CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS activity_skills CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS product_skills CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS age_stages CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_profile_credits() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS award_ai_credits(UUID,NUMERIC,TEXT,UUID,TEXT) CASCADE;
DROP FUNCTION IF EXISTS deduct_ai_credits(UUID,NUMERIC,TEXT,TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_order_transaction(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,NUMERIC,JSONB,UUID[]) CASCADE;

-- STEP 2: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 3: UTILITY TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
-- STEP 4: REFERENCE TABLES
CREATE TABLE age_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL, min_months INTEGER NOT NULL, max_months INTEGER NOT NULL,
    description TEXT, display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, description TEXT, icon TEXT, colour TEXT,
    display_order INTEGER NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    age_stage_id UUID REFERENCES age_stages(id) ON DELETE SET NULL,
    name TEXT NOT NULL, description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT,
    image_url TEXT, thumbnail_url TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    age_min_months INTEGER NOT NULL DEFAULT 0, age_max_months INTEGER NOT NULL DEFAULT 60,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE product_skills (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, skill_id)
);
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, description TEXT, instructions TEXT, image_url TEXT,
    age_min_months INTEGER NOT NULL DEFAULT 0, age_max_months INTEGER NOT NULL DEFAULT 60,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    sequence_order INTEGER NOT NULL DEFAULT 0, duration_mins INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE activity_skills (
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (activity_id, skill_id)
);
-- STEP 5: USER DATA TABLES

-- Profiles with role-based access (replaces cookie-auth admin)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT, avatar_url TEXT, phone TEXT,
    role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'admin', 'super_admin')),
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 'parent')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Children with soft delete
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
    avatar_url TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Addresses (normalized; snapshot into orders on purchase)
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home', full_name TEXT NOT NULL, phone TEXT NOT NULL,
    line1 TEXT NOT NULL, line2 TEXT, city TEXT NOT NULL, state TEXT NOT NULL,
    pincode TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'IN',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Credit Accounts (balance >= 0 enforced at DB level)
CREATE TABLE ai_credit_accounts (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION handle_new_profile_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_credit_accounts (id, balance) VALUES (NEW.id, 0) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_profile_created_add_credits AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION handle_new_profile_credits();

-- AI Credit Transactions (immutable ledger; CRITICAL: no user INSERT RLS)
CREATE TABLE ai_credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES ai_credit_accounts(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID,
    txn_type TEXT NOT NULL CHECK (txn_type IN ('purchase_reward','ai_usage','promo','refund','expiry','manual_adjustment')),
    amount NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Orders (address snapshot + idempotency key)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    shipping_name TEXT, shipping_phone TEXT, shipping_line1 TEXT,
    shipping_city TEXT, shipping_state TEXT, shipping_pincode TEXT, shipping_country TEXT DEFAULT 'IN',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
    payment_ref TEXT, payment_gateway TEXT,
    idempotency_key TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FK from credit transactions to orders
ALTER TABLE ai_credit_transactions ADD CONSTRAINT fk_act_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Order Items with product name snapshot
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order to Children M2M
CREATE TABLE order_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    UNIQUE (order_id, child_id)
);

-- Payment records (separate from order status)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    gateway_txn_id TEXT UNIQUE, gateway_order_id TEXT,
    amount NUMERIC(10,2) NOT NULL, currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated','success','failed','refunded')),
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Child Products
CREATE TABLE child_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (child_id, order_item_id)
);

-- Child Activities with quality scoring
CREATE TABLE child_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    score_percentage INTEGER CHECK (score_percentage BETWEEN 0 AND 100),
    duration_actual_mins INTEGER,
    notes TEXT,
    assessed_by TEXT DEFAULT 'parent_self',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, activity_id)
);
CREATE TRIGGER set_child_activities_updated_at BEFORE UPDATE ON child_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Conversations (now actually used)
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_ai_convs_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Messages (persisted)
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
    content TEXT NOT NULL, tokens_used INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Usage Log (monitoring + cost tracking)
CREATE TABLE ai_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    model TEXT NOT NULL, input_tokens INTEGER, output_tokens INTEGER,
    latency_ms INTEGER, success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT, credit_deducted NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Sessions (now actually used)
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ, notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- STEP 6: INDEXES
CREATE INDEX idx_orders_parent ON orders (parent_id, created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_idempotency ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_products_active ON products (active, age_min_months, age_max_months);
CREATE INDEX idx_activities_product ON activities (product_id, active, sequence_order);
CREATE INDEX idx_children_parent ON children (parent_id, created_at ASC) WHERE is_deleted = FALSE;
CREATE INDEX idx_child_products_child ON child_products (child_id);
CREATE INDEX idx_child_activities_child ON child_activities (child_id, completed);
CREATE INDEX idx_ai_convs_parent ON ai_conversations (parent_id, updated_at DESC);
CREATE INDEX idx_ai_msgs_conv ON ai_messages (conversation_id, created_at ASC);
CREATE INDEX idx_ai_credit_txns_parent ON ai_credit_transactions (parent_id, created_at DESC);

-- STEP 7: ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_skills ENABLE ROW LEVEL SECURITY;

-- Public reference data (no auth needed)
CREATE POLICY pub_age_stages ON age_stages FOR SELECT USING (TRUE);
CREATE POLICY pub_skill_cats ON skill_categories FOR SELECT USING (TRUE);
CREATE POLICY pub_skills ON skills FOR SELECT USING (TRUE);
CREATE POLICY pub_products ON products FOR SELECT USING (active = TRUE);
CREATE POLICY pub_product_skills ON product_skills FOR SELECT USING (TRUE);
CREATE POLICY pub_activities ON activities FOR SELECT USING (active = TRUE);
CREATE POLICY pub_activity_skills ON activity_skills FOR SELECT USING (TRUE);

-- Profiles
CREATE POLICY profile_sel ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profile_upd ON profiles FOR UPDATE USING (auth.uid() = id);

-- Children (no DELETE via RLS -- use soft delete)
CREATE POLICY children_sel ON children FOR SELECT USING (auth.uid() = parent_id AND is_deleted = FALSE);
CREATE POLICY children_ins ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY children_upd ON children FOR UPDATE USING (auth.uid() = parent_id);

-- Addresses
CREATE POLICY addr_sel ON addresses FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY addr_ins ON addresses FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY addr_upd ON addresses FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY addr_del ON addresses FOR DELETE USING (auth.uid() = parent_id);

-- AI Credit Accounts (READ ONLY for users -- writes via service role only)
CREATE POLICY cred_acc_sel ON ai_credit_accounts FOR SELECT USING (auth.uid() = id);

-- AI Credit Transactions (READ ONLY for users -- CRITICAL P0-4 FIX: no user INSERT)
CREATE POLICY cred_txn_sel ON ai_credit_transactions FOR SELECT USING (auth.uid() = parent_id);

-- Orders: read + insert; NO UPDATE for users -- CRITICAL P0-3 FIX
CREATE POLICY orders_sel ON orders FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY orders_ins ON orders FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Order items, children, payments (read via order ownership)
CREATE POLICY oi_sel ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.parent_id = auth.uid()));
CREATE POLICY oc_sel ON order_children FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_children.order_id AND orders.parent_id = auth.uid()));
CREATE POLICY pay_sel ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.parent_id = auth.uid()));

-- Child products + activities
CREATE POLICY cp_sel ON child_products FOR SELECT USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));
CREATE POLICY cp_ins ON child_products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));
CREATE POLICY cp_upd ON child_products FOR UPDATE USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));
CREATE POLICY ca_sel ON child_activities FOR SELECT USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));
CREATE POLICY ca_ins ON child_activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));
CREATE POLICY ca_upd ON child_activities FOR UPDATE USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));

-- AI conversations + messages
CREATE POLICY conv_sel ON ai_conversations FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY conv_ins ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY conv_upd ON ai_conversations FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY conv_del ON ai_conversations FOR DELETE USING (auth.uid() = parent_id);
CREATE POLICY msg_sel ON ai_messages FOR SELECT USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.parent_id = auth.uid()));
CREATE POLICY usage_sel ON ai_usage_log FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY sess_sel ON learning_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM children WHERE children.id = learning_sessions.child_id AND children.parent_id = auth.uid()));
CREATE POLICY sess_ins ON learning_sessions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = learning_sessions.child_id AND children.parent_id = auth.uid()));
-- STEP 8: ATOMIC DB FUNCTIONS

-- Award AI credits (service role only; idempotent; race-condition safe)
CREATE OR REPLACE FUNCTION award_ai_credits(p_parent_id UUID, p_amount NUMERIC, p_description TEXT, p_order_id UUID DEFAULT NULL, p_idem_key TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE v_idem TEXT; v_bal NUMERIC;
BEGIN
  v_idem := COALESCE(p_idem_key, 'award-' || p_parent_id::TEXT || '-' || extract(epoch from now())::TEXT);
  IF EXISTS (SELECT 1 FROM ai_credit_transactions WHERE idempotency_key = v_idem) THEN RETURN; END IF;
  PERFORM id FROM ai_credit_accounts WHERE id = p_parent_id FOR UPDATE;
  UPDATE ai_credit_accounts SET balance = balance + p_amount, updated_at = NOW() WHERE id = p_parent_id RETURNING balance INTO v_bal;
  IF NOT FOUND THEN INSERT INTO ai_credit_accounts (id, balance) VALUES (p_parent_id, p_amount) RETURNING balance INTO v_bal; END IF;
  INSERT INTO ai_credit_transactions (account_id, parent_id, order_id, txn_type, amount, balance_after, idempotency_key, description)
  VALUES (p_parent_id, p_parent_id, p_order_id, 'purchase_reward', p_amount, v_bal, v_idem, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct AI credits (service role only; idempotent; cannot go negative)
CREATE OR REPLACE FUNCTION deduct_ai_credits(p_parent_id UUID, p_amount NUMERIC, p_idem_key TEXT, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_bal NUMERIC; v_new NUMERIC;
BEGIN
  IF EXISTS (SELECT 1 FROM ai_credit_transactions WHERE idempotency_key = p_idem_key) THEN RETURN TRUE; END IF;
  SELECT balance INTO v_bal FROM ai_credit_accounts WHERE id = p_parent_id FOR UPDATE;
  IF v_bal IS NULL OR v_bal < p_amount THEN RETURN FALSE; END IF;
  v_new := v_bal - p_amount;
  UPDATE ai_credit_accounts SET balance = v_new, updated_at = NOW() WHERE id = p_parent_id;
  INSERT INTO ai_credit_transactions (account_id, parent_id, txn_type, amount, balance_after, idempotency_key, description)
  VALUES (p_parent_id, p_parent_id, 'ai_usage', -p_amount, v_new, p_idem_key, p_description);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic checkout transaction (all-or-nothing order creation)
CREATE OR REPLACE FUNCTION create_order_transaction(
  p_parent_id UUID, p_idempotency_key TEXT,
  p_shipping_name TEXT, p_shipping_phone TEXT, p_shipping_line1 TEXT,
  p_shipping_city TEXT, p_shipping_state TEXT, p_shipping_pincode TEXT,
  p_subtotal NUMERIC, p_total NUMERIC, p_items JSONB, p_child_ids UUID[]
)
RETURNS UUID AS $$
DECLARE v_order_id UUID; v_item JSONB; v_item_id UUID; v_child UUID;
BEGIN
  SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN RETURN v_order_id; END IF;
  INSERT INTO orders (parent_id, idempotency_key, shipping_name, shipping_phone, shipping_line1,
    shipping_city, shipping_state, shipping_pincode, subtotal, total, status, payment_status)
  VALUES (p_parent_id, p_idempotency_key, p_shipping_name, p_shipping_phone, p_shipping_line1,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_subtotal, p_total, 'pending', 'pending')
  RETURNING id INTO v_order_id;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    VALUES (v_order_id, (v_item->>'product_id')::UUID, v_item->>'product_name',
      (v_item->>'unit_price')::NUMERIC, (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC * (v_item->>'quantity')::INTEGER)
    RETURNING id INTO v_item_id;
    FOREACH v_child IN ARRAY p_child_ids LOOP
      INSERT INTO child_products (child_id, order_item_id) VALUES (v_child, v_item_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  FOREACH v_child IN ARRAY p_child_ids LOOP
    INSERT INTO order_children (order_id, child_id) VALUES (v_order_id, v_child) ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- STEP 9: SEED DATA

INSERT INTO age_stages (label, min_months, max_months, display_order) VALUES
  ('0-6 Months',0,6,1),('6-12 Months',6,12,2),('12-18 Months',12,18,3),('18-24 Months',18,24,4),
  ('2-3 Years',24,36,5),('3-4 Years',36,48,6),('4-5 Years',48,60,7),('5-6 Years',60,72,8)
ON CONFLICT DO NOTHING;

INSERT INTO skill_categories (name, description, icon, colour, display_order) VALUES
  ('Fine Motor Skills','Hand and finger coordination','✋','#F59E0B',1),
  ('Language & Communication','Vocabulary, speaking, listening','💬','#3B82F6',2),
  ('Early Numeracy','Counting, patterns, sorting','🔢','#10B981',3),
  ('Cognitive Skills','Problem solving, memory, attention','🧠','#8B5CF6',4),
  ('Sensory Exploration','Textures, colours, sounds','🎨','#EC4899',5),
  ('Pre-writing','Foundational strokes before formal writing','✏️','#EF4444',6),
  ('Social & Emotional','Turn-taking, empathy, sharing','❤️','#F97316',7)
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (category_id, name, display_order) VALUES
  ((SELECT id FROM skill_categories WHERE name='Fine Motor Skills'),'Pencil Grip',1),
  ((SELECT id FROM skill_categories WHERE name='Fine Motor Skills'),'Pincer Grip',2),
  ((SELECT id FROM skill_categories WHERE name='Fine Motor Skills'),'Line Tracing',3),
  ((SELECT id FROM skill_categories WHERE name='Fine Motor Skills'),'Shape Drawing',4),
  ((SELECT id FROM skill_categories WHERE name='Language & Communication'),'Vocabulary Building',1),
  ((SELECT id FROM skill_categories WHERE name='Language & Communication'),'Listening Skills',2),
  ((SELECT id FROM skill_categories WHERE name='Language & Communication'),'Storytelling',3),
  ((SELECT id FROM skill_categories WHERE name='Early Numeracy'),'Counting 1-5',1),
  ((SELECT id FROM skill_categories WHERE name='Early Numeracy'),'Counting 1-10',2),
  ((SELECT id FROM skill_categories WHERE name='Early Numeracy'),'Number Recognition',3),
  ((SELECT id FROM skill_categories WHERE name='Early Numeracy'),'Sorting',4),
  ((SELECT id FROM skill_categories WHERE name='Cognitive Skills'),'Attention & Focus',1),
  ((SELECT id FROM skill_categories WHERE name='Cognitive Skills'),'Sequencing',2),
  ((SELECT id FROM skill_categories WHERE name='Cognitive Skills'),'Pattern Recognition',3),
  ((SELECT id FROM skill_categories WHERE name='Cognitive Skills'),'Memory',4),
  ((SELECT id FROM skill_categories WHERE name='Sensory Exploration'),'Texture Exploration',1),
  ((SELECT id FROM skill_categories WHERE name='Sensory Exploration'),'Colour Recognition',2),
  ((SELECT id FROM skill_categories WHERE name='Sensory Exploration'),'Shape Recognition',3),
  ((SELECT id FROM skill_categories WHERE name='Pre-writing'),'Horizontal Lines',1),
  ((SELECT id FROM skill_categories WHERE name='Pre-writing'),'Vertical Lines',2),
  ((SELECT id FROM skill_categories WHERE name='Pre-writing'),'Curved Lines',3),
  ((SELECT id FROM skill_categories WHERE name='Pre-writing'),'Diagonal Lines',4),
  ((SELECT id FROM skill_categories WHERE name='Pre-writing'),'Circles',5),
  ((SELECT id FROM skill_categories WHERE name='Social & Emotional'),'Turn Taking',1),
  ((SELECT id FROM skill_categories WHERE name='Social & Emotional'),'Self-Expression',2)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, description, price, age_min_months, age_max_months) VALUES
  ('First Strokes Activity Book','first-strokes-activity-book','A pre-writing activity book with guided tracing pages. Builds pencil control through playful bee illustrations.',499,36,60),
  ('Little Explorer Sensory Kit','little-explorer-sensory-kit','Hands-on sensory kit with texture boards, colour cards, and sound shakers.',699,6,36),
  ('Number Bees Numeracy Book','number-bees-numeracy-book','Early maths activities: counting, sorting, patterns, and simple addition.',449,36,72),
  ('Language Blossoms Story Set','language-blossoms-story-set','Three illustrated storybooks with guided questions. Builds vocabulary, comprehension, and storytelling.',599,24,60)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_skills (product_id, skill_id) SELECT p.id,s.id FROM products p,skills s WHERE p.slug='first-strokes-activity-book' AND s.name IN ('Pencil Grip','Line Tracing','Horizontal Lines','Vertical Lines','Curved Lines','Circles','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO product_skills (product_id, skill_id) SELECT p.id,s.id FROM products p,skills s WHERE p.slug='little-explorer-sensory-kit' AND s.name IN ('Texture Exploration','Colour Recognition','Shape Recognition','Attention & Focus','Vocabulary Building') ON CONFLICT DO NOTHING;
INSERT INTO product_skills (product_id, skill_id) SELECT p.id,s.id FROM products p,skills s WHERE p.slug='number-bees-numeracy-book' AND s.name IN ('Counting 1-5','Counting 1-10','Number Recognition','Sorting','Pattern Recognition') ON CONFLICT DO NOTHING;
INSERT INTO product_skills (product_id, skill_id) SELECT p.id,s.id FROM products p,skills s WHERE p.slug='language-blossoms-story-set' AND s.name IN ('Vocabulary Building','Listening Skills','Storytelling','Attention & Focus') ON CONFLICT DO NOTHING;

INSERT INTO activities (product_id, name, description, instructions, age_min_months, age_max_months, difficulty, sequence_order, duration_mins) VALUES
  ((SELECT id FROM products WHERE slug='first-strokes-activity-book'),'My First Horizontal Lines','Trace horizontal lines to help the bee reach the flower.','Encourage tracing left to right. Celebrate each line!',36,60,1,1,5),
  ((SELECT id FROM products WHERE slug='first-strokes-activity-book'),'Vertical Lines Practice','Trace vertical lines to help raindrops reach the puddle.','Move crayon top to bottom. Practice in air first.',36,60,1,2,5),
  ((SELECT id FROM products WHERE slug='first-strokes-activity-book'),'Curved Lines — Follow the Rainbow','Trace rainbow arches.','Demonstrate smooth arching movement.',36,60,2,3,7),
  ((SELECT id FROM products WHERE slug='first-strokes-activity-book'),'Zigzag Lines — Lightning Bolts','Trace zigzag lightning bolts.','Go slowly, praise each direction change.',42,60,2,4,7),
  ((SELECT id FROM products WHERE slug='first-strokes-activity-book'),'Circle Tracing — Bubble Shapes','Trace big and small bubbles.','Start big, go smaller.',42,60,3,5,8),
  ((SELECT id FROM products WHERE slug='little-explorer-sensory-kit'),'Texture Touch Boards','Explore soft, rough, bumpy, and smooth textures.','Present one texture at a time. Describe each one.',6,36,1,1,10),
  ((SELECT id FROM products WHERE slug='little-explorer-sensory-kit'),'Colour Discovery','Match coloured objects to colour cards.','Lay out 3-4 colour cards and match objects.',18,36,1,2,10),
  ((SELECT id FROM products WHERE slug='little-explorer-sensory-kit'),'Sound Shaker Exploration','Listen to sounds from shaker bottles.','Make it a guessing game.',6,36,1,3,8),
  ((SELECT id FROM products WHERE slug='number-bees-numeracy-book'),'Count the Bees 1-5','Count and circle groups of bees.','Point to each bee as you count together.',36,72,1,1,8),
  ((SELECT id FROM products WHERE slug='number-bees-numeracy-book'),'Number Tracing 1-10','Trace numbers 1 to 10.','Show correct formation before tracing.',36,72,1,2,10),
  ((SELECT id FROM products WHERE slug='number-bees-numeracy-book'),'Big and Small Sorting','Sort honey jars from biggest to smallest.','Start with 3 jars, then increase to 5.',36,72,2,3,8),
  ((SELECT id FROM products WHERE slug='number-bees-numeracy-book'),'Counting Flower Petals','Count petals and write the number.','Point to each petal and count together.',42,72,2,4,10),
  ((SELECT id FROM products WHERE slug='language-blossoms-story-set'),'Read Aloud: The Busy Bee','Read the first story and discuss.','Read slowly with expression. Pause and ask questions.',24,60,1,1,15),
  ((SELECT id FROM products WHERE slug='language-blossoms-story-set'),'Retell the Story','Child retells story in own words.','Use picture cues. Prompt gently.',30,60,2,2,10),
  ((SELECT id FROM products WHERE slug='language-blossoms-story-set'),'Vocabulary Bee Words','Learn five new words from the story.','Point to each highlighted word. Use it in a sentence.',24,60,2,3,10)
ON CONFLICT DO NOTHING;

INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='My First Horizontal Lines' AND s.name IN ('Horizontal Lines','Pencil Grip','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Vertical Lines Practice' AND s.name IN ('Vertical Lines','Pencil Grip') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Curved Lines — Follow the Rainbow' AND s.name IN ('Curved Lines','Line Tracing') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Zigzag Lines — Lightning Bolts' AND s.name IN ('Diagonal Lines','Line Tracing','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Circle Tracing — Bubble Shapes' AND s.name IN ('Circles','Shape Drawing','Line Tracing') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Texture Touch Boards' AND s.name IN ('Texture Exploration','Attention & Focus','Vocabulary Building') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Colour Discovery' AND s.name IN ('Colour Recognition','Sorting','Vocabulary Building') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Sound Shaker Exploration' AND s.name IN ('Attention & Focus','Memory') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Count the Bees 1-5' AND s.name IN ('Counting 1-5','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Number Tracing 1-10' AND s.name IN ('Number Recognition','Counting 1-10','Pencil Grip') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Big and Small Sorting' AND s.name IN ('Sorting','Pattern Recognition','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Counting Flower Petals' AND s.name IN ('Counting 1-10','Number Recognition','Pencil Grip') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Read Aloud: The Busy Bee' AND s.name IN ('Listening Skills','Vocabulary Building','Attention & Focus') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Retell the Story' AND s.name IN ('Storytelling','Memory','Sequencing') ON CONFLICT DO NOTHING;
INSERT INTO activity_skills (activity_id, skill_id) SELECT a.id,s.id FROM activities a,skills s WHERE a.name='Vocabulary Bee Words' AND s.name IN ('Vocabulary Building','Memory','Listening Skills') ON CONFLICT DO NOTHING;

-- END OF MIGRATION 004