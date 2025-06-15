/*
  # Fix RLS Policies

  1. Security
    - Safely enable RLS on tables that don't have it enabled
    - Add policies for tables that need them
    - Check for existing policies before creating new ones
*/

-- Function to check if a policy exists
CREATE OR REPLACE FUNCTION policy_exists(
  policy_name text,
  table_name text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM pg_policies 
    WHERE policyname = policy_name
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on tables if not already enabled
DO $$ 
BEGIN
  -- Users table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'users' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Drafts table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'drafts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
  END IF;

  -- AI Products table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'ai_products' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE ai_products ENABLE ROW LEVEL SECURITY;
  END IF;

  -- NFT Mint Requests table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'nft_mint_requests' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE nft_mint_requests ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Purchases table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'purchases' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Generation Jobs table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'generation_jobs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Analytics table
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'analytics' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for users table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Users can read their own data', 'users') THEN
    CREATE POLICY "Users can read their own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT policy_exists('Users can update their own data', 'users') THEN
    CREATE POLICY "Users can update their own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create policies for drafts table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Users can read their own drafts', 'drafts') THEN
    CREATE POLICY "Users can read their own drafts"
      ON drafts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can insert their own drafts', 'drafts') THEN
    CREATE POLICY "Users can insert their own drafts"
      ON drafts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can update their own drafts', 'drafts') THEN
    CREATE POLICY "Users can update their own drafts"
      ON drafts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can delete their own drafts', 'drafts') THEN
    CREATE POLICY "Users can delete their own drafts"
      ON drafts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for ai_products table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Anyone can read active products', 'ai_products') THEN
    CREATE POLICY "Anyone can read active products"
      ON ai_products
      FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT policy_exists('Creators can read all their products', 'ai_products') THEN
    CREATE POLICY "Creators can read all their products"
      ON ai_products
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Creators can insert their own products', 'ai_products') THEN
    CREATE POLICY "Creators can insert their own products"
      ON ai_products
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Creators can update their own products', 'ai_products') THEN
    CREATE POLICY "Creators can update their own products"
      ON ai_products
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Creators can delete their own products', 'ai_products') THEN
    CREATE POLICY "Creators can delete their own products"
      ON ai_products
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for nft_mint_requests table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Users can read their own mint requests', 'nft_mint_requests') THEN
    CREATE POLICY "Users can read their own mint requests"
      ON nft_mint_requests
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can insert their own mint requests', 'nft_mint_requests') THEN
    CREATE POLICY "Users can insert their own mint requests"
      ON nft_mint_requests
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for purchases table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Buyers can read their own purchases', 'purchases') THEN
    CREATE POLICY "Buyers can read their own purchases"
      ON purchases
      FOR SELECT
      TO authenticated
      USING (auth.uid() = buyer_id);
  END IF;

  IF NOT policy_exists('Sellers can read purchases of their products', 'purchases') THEN
    CREATE POLICY "Sellers can read purchases of their products"
      ON purchases
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM ai_products
        WHERE ai_products.id = purchases.ai_product_id
        AND ai_products.user_id = auth.uid()
      ));
  END IF;

  IF NOT policy_exists('Buyers can insert their own purchases', 'purchases') THEN
    CREATE POLICY "Buyers can insert their own purchases"
      ON purchases
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = buyer_id);
  END IF;
END $$;

-- Create policies for generation_jobs table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Users can read their own generation jobs', 'generation_jobs') THEN
    CREATE POLICY "Users can read their own generation jobs"
      ON generation_jobs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can insert their own generation jobs', 'generation_jobs') THEN
    CREATE POLICY "Users can insert their own generation jobs"
      ON generation_jobs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for analytics table if they don't exist
DO $$ 
BEGIN
  IF NOT policy_exists('Users can read their own analytics', 'analytics') THEN
    CREATE POLICY "Users can read their own analytics"
      ON analytics
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Users can insert their own analytics', 'analytics') THEN
    CREATE POLICY "Users can insert their own analytics"
      ON analytics
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT policy_exists('Creators can read analytics for their products', 'analytics') THEN
    CREATE POLICY "Creators can read analytics for their products"
      ON analytics
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM ai_products
        WHERE ai_products.id = analytics.ai_product_id
        AND ai_products.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS policy_exists(text, text);