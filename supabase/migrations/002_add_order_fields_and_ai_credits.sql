-- add fields to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_state TEXT,
ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- change status check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('new', 'pending_confirmation', 'pending', 'paid', 'failed', 'refunded'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'new';

-- ai_credit_transactions
CREATE TABLE IF NOT EXISTS ai_credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- add ai_credits to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_credits NUMERIC(10,2) NOT NULL DEFAULT 0;

-- RLS for ai_credit_transactions
ALTER TABLE ai_credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent reads own ai_credit_transactions" ON ai_credit_transactions FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent inserts own ai_credit_transactions" ON ai_credit_transactions FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- trigger to update profile ai_credits
CREATE OR REPLACE FUNCTION update_profile_ai_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE profiles SET ai_credits = ai_credits + NEW.amount WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ai_credit_insert ON ai_credit_transactions;
CREATE TRIGGER on_ai_credit_insert
    AFTER INSERT ON ai_credit_transactions
    FOR EACH ROW EXECUTE FUNCTION update_profile_ai_credits();
