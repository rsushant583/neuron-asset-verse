/*
  # Create Enum Types for MetaMind

  1. New Types
    - `mint_status` - Status of NFT minting requests
    - `user_role` - User roles in the system
*/

-- Create mint_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mint_status') THEN
    CREATE TYPE mint_status AS ENUM ('pending', 'minted', 'failed');
  END IF;
END $$;

-- Create user_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('creator', 'buyer');
  END IF;
END $$;