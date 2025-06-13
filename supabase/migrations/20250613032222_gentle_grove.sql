/*
  # RLS and Policy Setup Migration

  1. Security
     - Enable Row Level Security (RLS) on all tables
     - Create appropriate policies for each table
  
  This migration is idempotent - it checks if tables exist before enabling RLS
  and checks if policies exist before creating them.
*/

-- Enable RLS on users table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for users table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read their own data') THEN
      CREATE POLICY "Users can read their own data"
        ON users
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own data') THEN
      CREATE POLICY "Users can update their own data"
        ON users
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id);
    END IF;
  END IF;
END $$;

-- Enable RLS on drafts table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drafts') THEN
    ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for drafts table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drafts' AND policyname = 'Users can read their own drafts') THEN
      CREATE POLICY "Users can read their own drafts"
        ON drafts
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drafts' AND policyname = 'Users can insert their own drafts') THEN
      CREATE POLICY "Users can insert their own drafts"
        ON drafts
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drafts' AND policyname = 'Users can update their own drafts') THEN
      CREATE POLICY "Users can update their own drafts"
        ON drafts
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'drafts' AND policyname = 'Users can delete their own drafts') THEN
      CREATE POLICY "Users can delete their own drafts"
        ON drafts
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Enable RLS on ai_products table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_products') THEN
    ALTER TABLE ai_products ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for ai_products table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_products' AND policyname = 'Anyone can read active products') THEN
      CREATE POLICY "Anyone can read active products"
        ON ai_products
        FOR SELECT
        USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_products' AND policyname = 'Creators can read all their products') THEN
      CREATE POLICY "Creators can read all their products"
        ON ai_products
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_products' AND policyname = 'Creators can insert their own products') THEN
      CREATE POLICY "Creators can insert their own products"
        ON ai_products
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_products' AND policyname = 'Creators can update their own products') THEN
      CREATE POLICY "Creators can update their own products"
        ON ai_products
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_products' AND policyname = 'Creators can delete their own products') THEN
      CREATE POLICY "Creators can delete their own products"
        ON ai_products
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Enable RLS on nft_mint_requests table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'nft_mint_requests') THEN
    ALTER TABLE nft_mint_requests ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for nft_mint_requests table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'nft_mint_requests' AND policyname = 'Users can read their own mint requests') THEN
      CREATE POLICY "Users can read their own mint requests"
        ON nft_mint_requests
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'nft_mint_requests' AND policyname = 'Users can insert their own mint requests') THEN
      CREATE POLICY "Users can insert their own mint requests"
        ON nft_mint_requests
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Enable RLS on purchases table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchases') THEN
    ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for purchases table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Buyers can read their own purchases') THEN
      CREATE POLICY "Buyers can read their own purchases"
        ON purchases
        FOR SELECT
        TO authenticated
        USING (auth.uid() = buyer_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Sellers can read purchases of their products') THEN
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

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'purchases' AND policyname = 'Buyers can insert their own purchases') THEN
      CREATE POLICY "Buyers can insert their own purchases"
        ON purchases
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = buyer_id);
    END IF;
  END IF;
END $$;

-- Enable RLS on generation_jobs table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generation_jobs') THEN
    ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for generation_jobs table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'generation_jobs' AND policyname = 'Users can read their own generation jobs') THEN
      CREATE POLICY "Users can read their own generation jobs"
        ON generation_jobs
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'generation_jobs' AND policyname = 'Users can insert their own generation jobs') THEN
      CREATE POLICY "Users can insert their own generation jobs"
        ON generation_jobs
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Enable RLS on analytics table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics') THEN
    ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for analytics table if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'Users can read their own analytics') THEN
      CREATE POLICY "Users can read their own analytics"
        ON analytics
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'Users can insert their own analytics') THEN
      CREATE POLICY "Users can insert their own analytics"
        ON analytics
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'analytics' AND policyname = 'Creators can read analytics for their products') THEN
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
  END IF;
END $$;