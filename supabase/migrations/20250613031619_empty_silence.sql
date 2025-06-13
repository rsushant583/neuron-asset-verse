/*
  # Enable Row Level Security

  1. Security
    - Enable RLS on all tables
    - Add policies for each table
    - Set up proper access control
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on drafts table
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ai_products table
ALTER TABLE ai_products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on nft_mint_requests table
ALTER TABLE nft_mint_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on purchases table
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Enable RLS on generation_jobs table
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on analytics table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for drafts table
CREATE POLICY "Users can read their own drafts"
  ON drafts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
  ON drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON drafts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON drafts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for ai_products table
CREATE POLICY "Anyone can read active products"
  ON ai_products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators can read all their products"
  ON ai_products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can insert their own products"
  ON ai_products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their own products"
  ON ai_products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can delete their own products"
  ON ai_products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for nft_mint_requests table
CREATE POLICY "Users can read their own mint requests"
  ON nft_mint_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mint requests"
  ON nft_mint_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for purchases table
CREATE POLICY "Buyers can read their own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can read purchases of their products"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ai_products
    WHERE ai_products.id = purchases.ai_product_id
    AND ai_products.user_id = auth.uid()
  ));

CREATE POLICY "Buyers can insert their own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Create policies for generation_jobs table
CREATE POLICY "Users can read their own generation jobs"
  ON generation_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation jobs"
  ON generation_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for analytics table
CREATE POLICY "Users can read their own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can read analytics for their products"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ai_products
    WHERE ai_products.id = analytics.ai_product_id
    AND ai_products.user_id = auth.uid()
  ));