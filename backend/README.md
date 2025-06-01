
# MetaMind Backend

This directory contains the FastAPI backend for the MetaMind platform.

## Structure

```
backend/
├── main.py              # FastAPI application entry point
├── routes/              # API route handlers
│   ├── auth.py         # Authentication endpoints
│   ├── products.py     # Product management
│   ├── ai.py           # AI integration endpoints
│   └── blockchain.py   # Blockchain operations
├── services/           # Business logic services
│   ├── auth_service.py
│   ├── product_service.py
│   ├── ai_service.py
│   └── blockchain_service.py
├── models/             # Database models
├── middleware/         # Custom middleware
└── config/            # Configuration files
```

## Features

- User authentication and authorization
- Product creation and management
- AI-powered content generation
- Blockchain NFT minting
- Real-time notifications via Supabase
- API documentation with Swagger/OpenAPI

## Setup

1. Install dependencies:
   ```bash
   pip install fastapi uvicorn supabase python-multipart
   ```

2. Set environment variables:
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_KEY="your-supabase-anon-key"
   export OPENAI_API_KEY="your-openai-key"
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `POST /api/draft` - Generate AI draft
- `POST /api/render-pdf` - Render PDF with template
- `POST /api/mint-nft` - Mint NFT on blockchain
- `GET /api/stats/{user_id}` - User statistics
