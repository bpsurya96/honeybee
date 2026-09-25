-- ============================================================
-- HoneyBee Learning — Initial Schema Migration
-- ============================================================
-- Run this in your Supabase SQL editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- REFERENCE TABLES (no RLS — public read)
-- ============================================================

-- Age stages
CREATE TABLE IF NOT EXISTS age_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    min_months INTEGER NOT NULL,
    max_months INTEGER NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skill categories
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    colour TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    age_stage_id UUID REFERENCES age_stages(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    age_min_months INTEGER NOT NULL DEFAULT 0,
    age_max_months INTEGER NOT NULL DEFAULT 60,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product-Skill join table
CREATE TABLE IF NOT EXISTS product_skills (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, skill_id)
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    age_min_months INTEGER NOT NULL DEFAULT 0,
    age_max_months INTEGER NOT NULL DEFAULT 60,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    sequence_order INTEGER NOT NULL DEFAULT 0,
    duration_mins INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity-Skill join table
CREATE TABLE IF NOT EXISTS activity_skills (
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (activity_id, skill_id)
);

-- ============================================================
-- PARENT DATA TABLES (RLS enabled)
-- ============================================================

-- Parent profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Children
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered')),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Child-product assignments (product purchased -> assigned to specific child)
CREATE TABLE IF NOT EXISTS child_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (child_id, order_item_id)
);

-- Child activity completion tracking
CREATE TABLE IF NOT EXISTS child_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    duration_mins INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, activity_id)
);

-- Learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    recommended_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reason TEXT,
    score NUMERIC,
    viewed BOOLEAN NOT NULL DEFAULT FALSE,
    clicked BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_activities_child_id ON child_activities(child_id);
CREATE INDEX IF NOT EXISTS idx_child_activities_activity_id ON child_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_child_activities_completed ON child_activities(child_id, completed);
CREATE INDEX IF NOT EXISTS idx_activities_product_id ON activities(product_id);
CREATE INDEX IF NOT EXISTS idx_activities_age ON activities(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_orders_parent_id ON orders(parent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_parent_id ON ai_conversations(parent_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_child_id ON recommendations(child_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['profiles', 'children', 'products', 'activities', 'orders', 'ai_conversations', 'child_activities']
    LOOP
        EXECUTE format(
            'CREATE TRIGGER update_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            t, t
        );
    END LOOP;
END
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read
ALTER TABLE age_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Reference tables (public read)
CREATE POLICY "Public read age_stages" ON age_stages FOR SELECT USING (true);
CREATE POLICY "Public read skill_categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public read product_skills" ON product_skills FOR SELECT USING (true);
CREATE POLICY "Public read active activities" ON activities FOR SELECT USING (active = true);
CREATE POLICY "Public read activity_skills" ON activity_skills FOR SELECT USING (true);

-- RLS Policies: Profiles
CREATE POLICY "Parent reads own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parent updates own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Parent inserts own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies: Children
CREATE POLICY "Parent reads own children" ON children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent inserts own children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parent updates own children" ON children FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parent deletes own children" ON children FOR DELETE USING (auth.uid() = parent_id);

-- RLS Policies: Orders
CREATE POLICY "Parent reads own orders" ON orders FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent inserts own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parent updates own orders" ON orders FOR UPDATE USING (auth.uid() = parent_id);

-- RLS Policies: Order Items (access if parent owns the order)
CREATE POLICY "Parent reads own order items" ON order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.parent_id = auth.uid()));
CREATE POLICY "Parent inserts own order items" ON order_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.parent_id = auth.uid()));

-- RLS Policies: Child Products
CREATE POLICY "Parent reads child products" ON child_products FOR SELECT
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parent inserts child products" ON child_products FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parent updates child products" ON child_products FOR UPDATE
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_products.child_id AND children.parent_id = auth.uid()));

-- RLS Policies: Child Activities
CREATE POLICY "Parent reads child activities" ON child_activities FOR SELECT
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parent inserts child activities" ON child_activities FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parent updates child activities" ON child_activities FOR UPDATE
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activities.child_id AND children.parent_id = auth.uid()));

-- RLS Policies: Learning Sessions
CREATE POLICY "Parent reads learning sessions" ON learning_sessions FOR SELECT
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = learning_sessions.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parent inserts learning sessions" ON learning_sessions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = learning_sessions.child_id AND children.parent_id = auth.uid()));

-- RLS Policies: AI Conversations
CREATE POLICY "Parent reads own ai conversations" ON ai_conversations FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent inserts own ai conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- RLS Policies: AI Messages (via conversation ownership)
CREATE POLICY "Parent reads own ai messages" ON ai_messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.parent_id = auth.uid()));
CREATE POLICY "Parent inserts own ai messages" ON ai_messages FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.parent_id = auth.uid()));

-- RLS Policies: Recommendations
CREATE POLICY "Parent reads own recommendations" ON recommendations FOR SELECT
    USING (EXISTS (SELECT 1 FROM children WHERE children.id = recommendations.child_id AND children.parent_id = auth.uid()));

-- ============================================================
-- END OF MIGRATION
-- ============================================================
