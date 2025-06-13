/*
  # Enable Row Level Security and Create Policies

  1. Security
    - Enable RLS on all tables (if they exist)
    - Create appropriate access policies for each table
    - Ensure data can only be accessed by authorized users
*/

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on users table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on drafts table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drafts') THEN
    ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on ai_products table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_products') THEN
    ALTER TABLE ai_products ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on nft_mint_requests table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'nft_mint_requests') THEN
    ALTER TABLE nft_mint_requests ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on purchases table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchases') THEN
    ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on generation_jobs table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generation_jobs') THEN
    ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Enable RLS on analytics table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics') THEN
    ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
    
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
  END IF;
END $$;

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS check_table_exists(text);