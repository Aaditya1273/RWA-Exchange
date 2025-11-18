
<div align="center">

  <h1>🏠 OneRWA Marketplace</h1>
  
  <p><strong>A decentralized marketplace for tokenized Real-World Assets (RWA) with fractional ownership on OneChain.</strong></p>
  
  <p><strong>🚀 Built on OneChain - the Sui-based blockchain optimized for real-world asset tokenization.</strong></p>
  
  <p>
    <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://chakra-ui.com/" target="_blank"><img src="https://img.shields.io/badge/Chakra%20UI-2-319795?logo=chakraui&logoColor=white" alt="Chakra UI" /></a>
    <a href="https://sui.io/" target="_blank"><img src="https://img.shields.io/badge/Move-Language-4DA2FF?logo=sui&logoColor=white" alt="Move" /></a>
    <a href="https://onechain.network/" target="_blank"><img src="https://img.shields.io/badge/OneChain-Testnet-00D4AA?logo=blockchain&logoColor=white" alt="OneChain" /></a>
  </p>
</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Environment](#environment)
- [Workflow](#workflow)
- [Mermaid Flowchart (Dev + User Flow)](#mermaid-flowchart-dev--user-flow)
- [Demo](#demo)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
## Gallery
<img width="1898" height="909" alt="Screenshot 2025-08-29 093347" src="https://github.com/user-attachments/assets/31fc7089-66f2-4ff1-8efa-f2d639adc248" />
<img width="1891" height="916" alt="Screenshot 2025-08-19 010358" src="https://github.com/user-attachments/assets/3859a78f-323f-416d-801e-e2c76bc32e17" />
<img width="1899" height="917" alt="Screenshot 2025-08-19 010918" src="https://github.com/user-attachments/assets/9f0a939e-93fb-4890-9ef0-dc2fe6f1bf7c" />
<img width="1896" height="921" alt="Screenshot 2025-08-19 011112" src="https://github.com/user-attachments/assets/3ce77519-82ba-4cce-84a7-81d507285ceb" />
<img width="1894" height="912" alt="Screenshot 2025-08-19 011343" src="https://github.com/user-attachments/assets/153cdf65-8723-4700-8c57-382727d4753c" />
<img width="1901" height="917" alt="Screenshot 2025-08-19 011845" src="https://github.com/user-attachments/assets/6ebd26e8-951a-425c-938f-d92f8c2b424e" />
<img width="1890" height="918" alt="Screenshot 2025-08-19 012229" src="https://github.com/user-attachments/assets/22d984d6-e42f-4875-bc98-eb8ebf880803" />


## ✨ Enhanced Features

### 🎨 **Professional UI/UX**
- **Custom Typography**: Outfit for headings, Inter for body text, Space Grotesk for code
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Modern Design**: Gradient backgrounds, glass morphism effects, and professional layouts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🛒 **Complete Trading System**
- **Advanced Buy Interface**: Modal-based purchase system with quantity selection
- **Real-time Pricing**: Dynamic price calculations and total cost display
- **Transaction Management**: Comprehensive error handling and success notifications
- **Multi-token Support**: Native tokens and ERC20 token payments

### 💳 **OneChain Wallet Integration**
- **OneWallet Support**: Native integration with OneChain Wallet via Wallet Standard
- **Seamless Connection**: One-click wallet connection with account detection
- **Transaction Signing**: Secure transaction signing with gas fee display
- **Security First**: All transactions require user approval in wallet popup

### 🔍 **Advanced Marketplace**
- **Smart Search**: Real-time search with filtering by asset type and category
- **Professional Cards**: Enhanced asset cards with pricing, APY, and investment details
- **Category Filtering**: Filter by Real Estate, Carbon Credits, and more
- **Investment Analytics**: Expected returns and investment minimums displayed

### 📊 **Comprehensive Dashboard**
- **Portfolio Analytics**: Track your investments with visual charts and statistics
- **Asset Categorization**: Organized view of your holdings by asset type
- **Performance Metrics**: ROI tracking and investment history
- **Multi-chain Portfolio**: Unified view across all supported networks

## 🏗️ Smart Contracts (Move Language)

This project uses Move smart contracts deployed on OneChain:

### **property_nft.move**
- **PropertyNFT Object**: Represents unique real-world properties as NFTs
- **Built-in Fractionalization**: Properties have `totalShares` and `availableShares` fields
- **Investment Function**: Users can buy fractional shares directly from the property
- **Investment NFT**: Each investment creates an Investment object tracking shares owned

### **Key Features**
- **create_property**: Mint a new PropertyNFT with metadata and share configuration
- **invest**: Buy fractional shares by paying OCT tokens
- **transfer_investment**: Transfer Investment NFTs to other users
- **No separate fractionalization step**: Shares are built into the PropertyNFT structure

## 🔗 OneChain Integration Benefits

### **Why OneChain for RWA?**
- **Optimized for Real-World Assets**: Purpose-built blockchain for tokenizing physical assets
- **Low Transaction Costs**: Minimal fees for fractionalization and trading operations
- **Fast Settlement**: Quick confirmation times for asset transactions
- **Regulatory Compliance**: Built-in compliance features for asset tokenization
- **Interoperability**: Seamless integration with traditional financial systems

### **OneChain-Specific Features**
- **🏠 Property Tokenization**: Direct integration with real estate verification systems
- **🌱 Carbon Credit Trading**: Native support for environmental asset tokenization
- **⚡ Instant Fractionalization**: Split assets into tradeable fractions in seconds
- **🔄 Seamless Redemption**: Collect fractions to redeem complete asset ownership
- **📊 Real-time Analytics**: Live tracking of asset performance and trading volume
- **🛡️ Compliance Badges**: Automated verification and compliance checking

## Tech Stack

- **Blockchain**: OneChain Testnet (Sui-based)
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Library**: Chakra UI with custom themes
- **Web3 SDK**: @mysten/sui for OneChain interactions
- **Smart Contracts**: Move language (property_nft.move)
- **Wallet Integration**: Wallet Standard protocol for OneWallet
- **State Management**: React hooks and context
- **File Storage**: IPFS via Pinata for NFT metadata
- **Styling**: Chakra UI components with responsive design

## Supported Network

### OneChain Testnet
- **RPC URL**: https://rpc-testnet.onelabs.cc:443
- **Chain Identifier**: `onechain:testnet`
- **Native Token**: OCT (OneChain Token)
- **Gas Coin Type**: `0x2::oct::OCT`
- **Explorer**: https://onescan.cc/testnet/home
- **Faucet**: https://faucet-testnet.onelabs.cc

## Move Package Deployment

Your deployed Move package address should be set in `.env.local`:

```env
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
```

To deploy your own package:
```bash
one move build
one client publish --gas-budget 100000000
```

The package ID will be displayed in the output after successful deployment.


## 🏗️ Property NFT Creation → Fractionalization → Listing Flow

### Complete Workflow

```mermaid
flowchart TD
    Start[Start: Real-World Asset] --> Create[1. Create Property NFT]
    
    Create --> CreateDetails[Property Details:<br/>- Name & Description<br/>- Location & Type<br/>- Total Value<br/>- Total Shares<br/>- Price per Share OCT<br/>- Rental Yield]
    
    CreateDetails --> Mint[2. Mint Property NFT]
    Mint --> MintTx[Transaction on OneChain<br/>PropertyNFT Object Created]
    
    MintTx --> Fractional[3. Automatic Fractionalization]
    Fractional --> FracDetails[Fractional Shares:<br/>- Total Shares: 10,000<br/>- Available: 10,000<br/>- Price: 0.001 OCT/share<br/>- Stored On-Chain]
    
    FracDetails --> List[4. Auto-Listed in Marketplace]
    List --> ListDetails[Marketplace Listing:<br/>- Visible to all users<br/>- Real-time availability<br/>- Instant investment ready]
    
    ListDetails --> Invest[5. Users Can Invest]
    Invest --> InvestOptions{Investment Options}
    
    InvestOptions --> BuyShares[Buy Fractional Shares]
    BuyShares --> ShareDetails[Purchase Details:<br/>- Min: 1 share<br/>- Max: Available shares<br/>- Payment in OCT<br/>- Gas: ~0.05 OCT]
    
    ShareDetails --> InvestNFT[Investment NFT Created]
    InvestNFT --> InvestRecord[Investment Record:<br/>- Property ID<br/>- Shares Owned<br/>- Investment Amount<br/>- Timestamp]
    
    InvestRecord --> Portfolio[6. Track in Portfolio]
    Portfolio --> PortfolioView[My Investments Page:<br/>- Total Invested<br/>- Total Shares<br/>- Properties Owned<br/>- Real-time Updates]
    
    PortfolioView --> Transfer[7. Transfer Shares Optional]
    Transfer --> TransferTx[Transfer Investment NFT<br/>to Another User]
    
    TransferTx --> End[End: Complete Ownership Cycle]
    
    style Create fill:#9f7aea,stroke:#805ad5,color:#fff
    style Fractional fill:#38b2ac,stroke:#319795,color:#fff
    style List fill:#ed8936,stroke:#dd6b20,color:#fff
    style Invest fill:#48bb78,stroke:#38a169,color:#fff
    style Portfolio fill:#4299e1,stroke:#3182ce,color:#fff
```

### Technical Implementation

```mermaid
flowchart LR
    subgraph Creation[Property Creation]
        A[User Input] --> B[CreatePropertyForm]
        B --> C[propertyContract.createProperty]
        C --> D[Move: create_property]
        D --> E[PropertyNFT Object]
    end
    
    subgraph Fractionalization[Built-in Fractionalization]
        E --> F[totalShares: 10000]
        F --> G[availableShares: 10000]
        G --> H[pricePerShare: OCT]
        H --> I[Stored in PropertyNFT]
    end
    
    subgraph Listing[Marketplace Integration]
        I --> J[getAllProperties]
        J --> K[Collection Page]
        K --> L[Display Cards]
        L --> M[Investment Modal]
    end
    
    subgraph Investment[Investment Process]
        M --> N[User Selects Shares]
        N --> O[propertyContract.invest]
        O --> P[Move: invest function]
        P --> Q[Investment NFT Created]
        Q --> R[Shares Deducted]
    end
    
    subgraph Portfolio[Portfolio Tracking]
        R --> S[getUserInvestments]
        S --> T[My Investments Page]
        T --> U[Real-time Balance]
        U --> V[Transfer Option]
    end
    
    style Creation fill:#e6f7ff
    style Fractionalization fill:#f0f5ff
    style Listing fill:#fff7e6
    style Investment fill:#f6ffed
    style Portfolio fill:#fff0f6
```

### Key Features

#### 1️⃣ **Property NFT Creation**
- **Input**: Property details (name, location, value, shares, price)
- **Output**: Unique PropertyNFT object on OneChain
- **Gas**: ~0.01 OCT
- **Time**: ~3-5 seconds

#### 2️⃣ **Automatic Fractionalization**
- **Built-in**: No separate fractionalization step needed
- **Shares**: Defined at creation (e.g., 10,000 shares)
- **Price**: Set in OCT (e.g., 0.001 OCT per share)
- **Flexible**: Users can buy 1 to all available shares

#### 3️⃣ **Instant Marketplace Listing**
- **Auto-listed**: Property appears immediately in marketplace
- **Real-time**: Updates as shares are purchased
- **Searchable**: Filterable by type, location, price
- **Transparent**: All details visible to investors

#### 4️⃣ **Investment Process**
- **Simple**: Select shares → Confirm → Sign transaction
- **Fast**: Investment completes in seconds
- **Secure**: Blockchain-verified ownership
- **Tracked**: Investment NFT created for each purchase

#### 5️⃣ **Portfolio Management**
- **Dashboard**: View all investments in one place
- **Real-time**: Live updates of share counts
- **Transferable**: Send Investment NFTs to others
- **Analytics**: Track total invested, shares owned

### Smart Contract Functions

```move
// 1. Create Property NFT
public entry fun create_property(
    name: String,
    description: String,
    image_url: String,
    location: String,
    property_type: String,
    total_value: u64,
    total_shares: u64,
    price_per_share: u64,
    rental_yield: String,
    ctx: &mut TxContext
)

// 2. Invest in Property (Buy Shares)
public entry fun invest(
    property: &mut PropertyNFT,
    payment: Coin<OCT>,
    shares_to_buy: u64,
    ctx: &mut TxContext
)

// 3. Transfer Investment
public entry fun transfer_investment(
    investment: Investment,
    recipient: address,
    _ctx: &mut TxContext
)
```

### Example Usage

#### Create Property
```bash
one client call \
  --package YOUR_PACKAGE_ID \
  --module property_nft \
  --function create_property \
  --args "Sunset Villa" "Luxury beachfront property" \
         "https://example.com/villa.jpg" "Miami Beach" \
         "Residential" 1000000 10000 100 "8.5%" \
  --gas-budget 50000000
```

#### Invest in Property
```bash
one client call \
  --package YOUR_PACKAGE_ID \
  --module property_nft \
  --function invest \
  --args [PROPERTY_OBJECT_ID] [COIN_OBJECT_ID] 100 \
  --gas-budget 50000000
```

> **Note**: Replace `YOUR_PACKAGE_ID` with your deployed package ID, and use actual object IDs for property and coin.

### Benefits

✅ **Simplified**: No separate fractionalization step  
✅ **Efficient**: One-time property creation  
✅ **Flexible**: Any number of shares (1 to total)  
✅ **Transparent**: All data on-chain  
✅ **Instant**: Immediate marketplace visibility  
✅ **Secure**: Blockchain-verified ownership  
✅ **Transferable**: Investment NFTs can be traded  

---

## OneChain Integration Flow

## Dev + User Flow

```mermaid
flowchart TD
  subgraph Dev[Developer Workflow]
    A[Clone Repo] --> B[Install Deps]
    B --> C[Create .env.local\nNEXT_PUBLIC_TW_CLIENT_ID]
    C --> D{Deploy to OneChain?}
    D -- Yes --> E[Configure OneChain RPC]
    E --> F[Deploy RWA Contracts]
    F --> G[Deploy Marketplace]
    D -- No --> H[Use Testnet]
    G --> I[Update Contract Addresses]
    H --> I
    I --> J[Run: npm run dev]
  end

  subgraph User[End-User Flow on OneChain]
    K[Open App / Landing] --> L[Connect Wallet to OneChain]
    L --> M{Connected to OneChain?}
    M -- Yes --> N[Browse RWA Marketplace]
    M -- No --> O[Switch to OneChain Network]
    O --> N
    N --> P[View Property/Asset Details]
    P --> Q{Investment Action}
    Q -- Buy Fractions --> R[Purchase ERC20 Tokens]
    Q -- Buy Full Asset --> S[Purchase Complete NFT]
    Q -- List Asset --> T[Create Marketplace Listing]
    Q -- Fractionalize --> U[Split into ERC20 Tokens]
    
    R --> V[Track Fractional Ownership]
    S --> W[Full Asset Management]
    U --> X[Enable Secondary Trading]
    V --> Y{Collect All Fractions?}
    Y -- Yes --> Z[Redeem Full Asset]
    Y -- No --> AA[Continue Trading]
  end

  J --> K
```

## 🚀 Quick Start - OneChain Testnet

### Prerequisites
- **Node.js 18+** and npm installed
- **OneChain CLI** installed (for Move contract deployment)
  - Install from: https://docs.onechain.network
- **OneWallet** browser extension
  - Install from OneChain official website
- **OCT Tokens** for gas fees
  - Get from faucet: https://faucet-testnet.onelabs.cc

### Deploy and Run in 5 Minutes

#### 1. Clone and Install
```bash
git clone https://github.com/Aaditya1273/RWA-Exchange.git
cd RWA-Exchange
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```env
# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID

# Pinata IPFS (for image uploads)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_url
```

> **Important**: For Vercel deployment, add these environment variables in the Vercel dashboard under Settings → Environment Variables.

#### 3. Deploy Move Package (If Needed)
```bash
# Build Move package
one move build

# Deploy to OneChain testnet
one client publish --gas-budget 100000000

# Save the Package ID from output
```


#### 4. Create a Property NFT
```bash
one client call \
  --package  \
  --module property_nft \
  --function create_property YOUR_PACKAGE_ID\
  --args "Sunset Villa Estate" "Luxury beachfront property" \
         "https://example.com/villa.jpg" "Miami Beach, FL" \
         "Residential" 1000000 10000 100 "8.5%" \
  --gas-budget 10000000
```

#### 5. Invest in Property (Fractionalization)
```bash
one client call \
  --package YOUR_PACKAGE_ID \
  --module property_nft \
  --function invest \
  --args [PROPERTY_OBJECT_ID] [COIN_OBJECT_ID] 100 \
  --gas-budget 10000000
```

#### 6. Run Frontend
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

### Verify Deployment
- **Package Explorer**: https://onescan.cc/testnet/object/YOUR_PACKAGE_ID
- **Check Objects**: `one client objects`
- **View Transaction**: `one client tx-block [TX_HASH]`
- **OneScan Explorer**: https://onescan.cc/testnet/home

---

## ⚠️ Feature Caveats & Limitations

### Current Limitations

#### Testnet Only
- ⚠️ **Not Audited**: Smart contracts have not been professionally audited
- ⚠️ **Demo Purpose**: This is a hackathon/demo project, not production-ready
- ⚠️ **No Real Funds**: Do not use with real money on mainnet

#### Technical Limitations
- **OneWallet Only**: Currently only supports OneWallet browser extension
- **Manual Gas Selection**: Gas coins must be manually selected for transactions
- **Transaction Confirmation**: May take 5-10 seconds for finality on testnet
- **RPC Timeouts**: OneChain testnet RPC may occasionally timeout, retry if needed
- **Network Fee Display**: Requires building transaction before passing to wallet

#### Feature Gaps
- **Dividend Distribution**: Manual process, not automated
- **KYC Integration**: Placeholder only, not enforced in current version
- **Secondary Market**: Fraction trading not yet implemented
- **Multi-signature**: Property management requires single owner only
- **Mobile Wallet**: Limited mobile wallet support

### Known Issues

#### Frontend
- Balance refresh requires manual trigger
- Some wallet connections may require page refresh
- Explorer links may not work if testnet is down

#### Smart Contracts (Move)
- Investment NFTs are non-transferable by default (requires custom transfer function)
- No refund mechanism if property investment fails
- Rental yield distribution not automated (manual process)
- Share price is fixed at creation (no dynamic pricing)

#### Network
- OneChain testnet may have occasional downtime
- Gas estimation may be inaccurate
- Event indexing may lag behind transactions

### Security Disclaimers

⚠️ **IMPORTANT SECURITY WARNINGS**:

1. **Wallet Security**: Always verify transaction details in OneWallet before signing
2. **No Audit**: Move smart contracts have not been audited by security professionals
3. **Test Tokens Only**: Only use testnet OCT tokens, never mainnet funds
4. **No Insurance**: No protection against bugs or exploits in smart contracts
5. **Experimental**: This is experimental software for educational purposes only
6. **Gas Fees**: Always ensure you have sufficient OCT for gas fees (~0.05 OCT per transaction)

### Recommended Use Cases

✅ **Good For**:
- Learning about RWA tokenization
- Testing fractional ownership concepts
- Demonstrating blockchain use cases
- Hackathon submissions
- Educational purposes

❌ **Not Suitable For**:
- Production deployments
- Real financial transactions
- Storing valuable assets
- Regulatory compliance
- Enterprise use without modifications

### Future Improvements

**Planned Enhancements**:
- Professional security audit
- Automated dividend distribution
- Real KYC/AML integration
- Secondary marketplace for fractions
- Multi-signature property management
- Mobile app support
- Advanced analytics dashboard
- Integration with real estate APIs
- Regulatory compliance features
- Insurance mechanisms

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section below
2. Visit OneChain documentation: https://docs.onechain.network
3. Check OneChain faucet for OCT tokens: https://faucet-testnet.onelabs.cc
4. Open an issue on GitHub

---

## 🔧 Technical Deep Dive: Wallet Integration

### Challenge: OneWallet Sign Button Disabled

During development, we encountered a critical issue where the OneWallet Sign button remained disabled when creating NFTs. Here's how we solved it:

#### Root Causes Identified:
1. **Missing Gas Owner**: The `gasData.owner` field was null
2. **Zero Network Fee**: Wallet couldn't calculate gas fees
3. **Transaction Format**: Wallet expected specific transaction structure

#### Solution Implemented:
```typescript
// 1. Manually fetch and set gas payment coins
const gasCoins = await client.getCoins({
  owner: address,
  coinType: '0x2::oct::OCT'
});

transaction.setGasPayment(gasCoins.data.map(coin => ({
  objectId: coin.coinObjectId,
  version: coin.version,
  digest: coin.digest
})));

// 2. Explicitly set gas owner
transaction.setGasOwner(address);

// 3. Build transaction to populate gas data
await transaction.build({ client });

// 4. Pass Transaction object (not bytes) to wallet
await wallet.signAndExecuteTransaction({
  transaction: transaction,  // Has toJSON() method
  account: connectedAccount,
  chain: 'onechain:testnet'
});
```

#### Key Learnings:
- OneWallet requires the **Transaction object** (not bytes) because it needs the `toJSON()` method
- Gas data must be **populated before** passing to wallet (via `build()`)
- Gas owner must be **explicitly set** to match the sender address
- Chain identifier must be `'onechain:testnet'` (not `'sui:testnet'`)

This implementation ensures the wallet can properly display transaction details and calculate network fees.

```




## Project Structure

- `sources/` — Move smart contracts (`property_nft.move`).
- `scripts/` — Deployment scripts for OneChain.
- `src/` — Next.js app and components.
  - `src/app/` — Next.js routes (e.g., `collection/`, `create-property/`, `my-investments/`).
  - `src/components/` — UI components (e.g., `PropertyCreationForm.tsx`, `InvestmentModal.tsx`).
  - `src/services/` — Blockchain services (e.g., `propertyContract.ts`, `onechain.ts`).
  - `src/consts/` — Configuration constants.

## Scripts

From `package.json`:

```bash
npm run dev      # start Next.js dev server
npm run build    # build production bundle
npm run start    # start production server
npm run lint     # run Next.js lint
```

OneChain CLI (Move contract deployment):

```bash
one move build                    # compile Move contracts
one move test                     # test Move contracts
one client publish --gas-budget 100000000  # deploy to OneChain
one client call --package <PKG_ID> --module property_nft --function create_property  # interact with contracts
```

## Environment

Create `.env.local` at repo root:

```env
# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID
```

## Workflow

1) Install dependencies: `npm install`

2) Configure environment: create `.env.local` with OneChain configuration.

3) (Optional) Develop/compile/deploy Move contracts with OneChain CLI:
   ```bash
   one move build
   one client publish --gas-budget 100000000
   ```

4) Update package ID in `.env.local` with your deployed contract address.

5) Run the app: `npm run dev` and open http://localhost:3000

6) Connect wallet (OneChain Wallet via navbar) and interact with the marketplace.


## Troubleshooting

### Common Issues

#### Wallet Connection Issues
- **OneChain Wallet**: Install OneChain Wallet extension from the official website
- **Wallet Standard**: The app uses Wallet Standard interface for OneChain integration
- **Connection Fails**: Try refreshing the page and reconnecting
- **No Wallet Detected**: Ensure OneChain Wallet extension is installed and unlocked
- **Wrong Network**: Make sure you're connected to OneChain Testnet

#### OneChain-Specific Issues
- **RPC Connection**: If OneChain RPC is slow, check your network configuration at `https://rpc-testnet.onelabs.cc:443`
- **Contract Interactions**: Ensure you have sufficient **OCT tokens** for gas fees (not ONE)
- **Transaction Fails**: Check transaction on OneScan: `https://onescan.cc/testnet/home`
- **Property Not Loading**: Verify the property exists on OneChain testnet
- **Investment Fails**: Ensure you have enough OCT for both the investment amount and gas fees

#### Build/Runtime Errors
- **Module not found errors**: Run `npm install` to ensure all dependencies are installed
- **Environment variable errors**: Ensure `.env.local` exists with valid OneChain configuration
- **Next.js fails to start**: Clear `.next/` folder and retry: `rm -rf .next && npm run dev` (Windows: delete `.next` folder manually)
- **TypeScript errors**: Run `npm run build` to check for type errors before deploying

#### Performance Issues
- **Slow loading**: The app fetches real blockchain data which may take time
- **Network timeouts**: OneChain testnet may have occasional delays
- **Low gas fees**: OneChain offers significantly lower fees compared to Ethereum mainnet (~0.01-0.05 OCT per transaction)
- **Development**: Always use OneChain testnet for development and testing

### Getting Help
- Check the [OneChain documentation](https://docs.onechain.network)
- Visit [OneScan Explorer](https://onescan.cc/testnet/home) to verify transactions
- Review contract addresses in `.env.local` if using custom deployments
- Open an issue on GitHub for project-specific problems

## Demo

- Screenshots or GIFs
  - Landing Page: `src/app/landing/page.tsx`
  - Token Page and Listing Flow: `src/components/token-page/*`
  
Add your media under `public/` and embed here:

```md
![Landing](public/landing.png)
![Marketplace](public/marketplace.png)
```

## Contributing

Contributions are welcome! Please:

- Fork the repo and create a feature branch.
- Follow existing code style and run `npm run lint`.
- Open a PR with a clear description and screenshots if UI changes.

## License

MIT ©  Contributors

