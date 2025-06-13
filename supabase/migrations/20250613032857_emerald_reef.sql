/*
  # Create Initial Schema for MetaMind

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `ai_products` - AI-generated knowledge products
    - `nft_mint_requests` - Requests to mint products as NFTs
    - `purchases` - Product purchase records
    - `generation_jobs` - AI content generation job tracking
    - `analytics` - User and product analytics events
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'buyer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_url text,
  preview_image text,
  price numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nft_mint_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS nft_mint_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_product_id uuid NOT NULL REFERENCES ai_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status mint_status DEFAULT 'pending',
  txn_hash text,
  metadata_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_product_id uuid NOT NULL REFERENCES ai_products(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create generation_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  status text DEFAULT 'pending',
  result jsonb,
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_product_id uuid REFERENCES ai_products(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create drafts table if it doesn't exist
CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version integer NOT NULL,
  content text NOT NULL,
  title text,
  chapters text[],
  word_count integer,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anyone can view public user info"
  ON users
  FOR SELECT
  USING (true);

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