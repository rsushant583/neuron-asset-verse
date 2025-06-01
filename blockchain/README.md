
# MetaMind Blockchain Module

This directory contains blockchain integration for NFT minting and Web3 functionality.

## Structure

```
blockchain/
├── mint_nft.py           # NFT minting logic
├── web3_config.js        # Web3 configuration
├── contracts/            # Smart contracts
│   ├── MetaMindNFT.sol  # ERC-721 NFT contract
│   └── Marketplace.sol   # Marketplace contract
├── metadata/             # NFT metadata templates
└── utils/               # Blockchain utilities
```

## Features

- **NFT Minting**: Mint digital products as NFTs on Polygon
- **Metadata Management**: IPFS storage for NFT metadata
- **Wallet Integration**: Web3Modal for wallet connections
- **Marketplace**: Smart contract for product trading
- **Ownership Verification**: Blockchain-based ownership proof

## Smart Contracts

### MetaMindNFT Contract
- ERC-721 compliant NFT contract
- Deployed on Polygon mainnet
- Supports product metadata and royalties

### Marketplace Contract
- Decentralized marketplace for trading
- Built-in royalty distribution
- Creator earnings tracking

## Setup

1. Install dependencies:
   ```bash
   npm install web3 @web3modal/react ipfs-http-client
   pip install web3.py brownie
   ```

2. Configure environment:
   ```bash
   export POLYGON_RPC_URL="https://polygon-rpc.com"
   export PRIVATE_KEY="your-wallet-private-key"
   export IPFS_PROJECT_ID="your-infura-ipfs-id"
   ```

3. Deploy contracts:
   ```bash
   brownie run deploy --network polygon-main
   ```

## Usage Examples

### Mint NFT
```python
from mint_nft import mint_product_nft

metadata = {
    "name": "Life Lessons eBook",
    "description": "Wisdom from 40 years in business",
    "image": "ipfs://QmHash...",
    "attributes": [...]
}

transaction = mint_product_nft(
    to_address="0x...",
    metadata=metadata,
    product_id="prod_123"
)
```

### Verify Ownership
```javascript
import { verifyOwnership } from './utils/ownership';

const isOwner = await verifyOwnership(
    userAddress,
    tokenId
);
```

## Network Configuration

- **Polygon Mainnet**: Production deployment
- **Polygon Mumbai**: Testing environment
- **IPFS**: Metadata and asset storage
- **The Graph**: Indexing and queries
