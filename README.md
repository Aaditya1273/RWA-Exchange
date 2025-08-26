
<div align="center">

  <h1>OneRWA Marketplace</h1>
  
  <p><strong>A decentralized marketplace for tokenized Real-World Assets (RWA) with NFT fractionalization capabilities.</strong></p>
  
  <p><strong>🚀 This hackathon demo runs fully on OneChain - the next-generation blockchain for real-world asset tokenization.</strong></p>
  
  <p>
    <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://hardhat.org/" target="_blank"><img src="https://img.shields.io/badge/Hardhat-3-FFEA00?logo=ethereum&logoColor=black" alt="Hardhat" /></a>
    <a href="https://chakra-ui.com/" target="_blank"><img src="https://img.shields.io/badge/Chakra%20UI-2-319795?logo=chakraui&logoColor=white" alt="Chakra UI" /></a>
    <a href="https://thirdweb.com/" target="_blank"><img src="https://img.shields.io/badge/thirdweb-5-2D2D2D?logo=web3.js&logoColor=white" alt="thirdweb" /></a>
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
<img width="1893" height="909" alt="Screenshot 2025-08-19 010205" src="https://github.com/user-attachments/assets/290fc772-35c8-4882-8b99-4b444a4c1d21" />
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

### 💳 **Enhanced Wallet Integration**
- **Universal Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Seamless Connection**: One-click wallet connection with automatic chain switching
- **Mobile Optimized**: Perfect wallet integration for mobile devices
- **Security First**: Secure transaction handling with user confirmations

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

## 🏗️ Smart Contracts

This project includes three core smart contracts for RWA tokenization and fractionalization:

### **PropertyNFT.sol**
- ERC721 contract for minting property-backed NFTs
- Owner-controlled minting with metadata URI support
- Represents unique real-world assets as non-fungible tokens

### **Fractionalizer.sol**
- Core contract for fractionalizing PropertyNFTs into ERC20 tokens
- Allows NFT owners to split ownership into tradeable fractions
- Enables redemption when all fractions are collected by one owner

### **Fraction.sol**
- ERC20 token representing fractional ownership of an NFT
- Minted by the Fractionalizer contract
- Burnable tokens for NFT redemption process

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

- **Blockchain**: OneChain Network (Primary), Multi-chain support
- **Frontend**: Next.js 14, React 18, TypeScript, Chakra UI
- **Web3 SDK**: thirdweb v5 with OneChain integration
- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin v5.4.0, Hardhat v3
- **RWA Contracts**: PropertyNFT, Fractionalizer, Fraction ERC20
- **State Management**: @tanstack/react-query
- **Styling**: Framer Motion, Chakra UI with custom themes

## Supported Networks

### Primary Network
- **OneChain Testnet** (Chain ID: 1001) - Default active network
- **OneChain Mainnet** (Chain ID: 1000) - Production network

### Legacy Networks (Secondary Support)
- Avalanche Fuji Testnet (Chain ID: 43113)
- Polygon Amoy Testnet (Chain ID: 80002)  
- Sepolia Testnet (Chain ID: 11155111)

## OneChain Contract Addresses

### Testnet (Chain ID: 1001)
```
PropertyNFT:    0x0000000000000000000000000000000000000000  # Update after deployment
Fractionalizer: 0x0000000000000000000000000000000000000000  # Update after deployment
Marketplace:    0x0000000000000000000000000000000000000000  # Update after deployment
```

### Mainnet (Chain ID: 1000)
```
PropertyNFT:    0x0000000000000000000000000000000000000000  # Update after deployment
Fractionalizer: 0x0000000000000000000000000000000000000000  # Update after deployment
Marketplace:    0x0000000000000000000000000000000000000000  # Update after deployment
```

> **Note**: Replace the placeholder addresses (0x000...) with actual deployed contract addresses after running the deployment scripts.


## OneChain Integration Flow

```mermaid
flowchart TD
  subgraph OneChain[OneChain RWA Ecosystem]
    A[Real-World Asset] --> B[Property NFT Minting]
    B --> C[Asset Verification & Compliance]
    C --> D[OneChain Marketplace Listing]
    D --> E{Investment Options}
    
    E --> F[Direct Purchase]
    E --> G[Fractionalization]
    
    G --> H[ERC20 Fraction Tokens]
    H --> I[Secondary Trading]
    I --> J[Liquidity Pool]
    
    F --> K[Full Asset Ownership]
    J --> L{Collect All Fractions?}
    L -- Yes --> M[Asset Redemption]
    L -- No --> N[Continue Trading]
    
    M --> K
    N --> I
    
    K --> O[Asset Management]
    O --> P[Yield Generation]
    P --> Q[Profit Distribution]
  end

  subgraph Tech[Technical Implementation]
    R[PropertyNFT.sol] --> S[Fractionalizer.sol]
    S --> T[Fraction.sol ERC20]
    T --> U[Marketplace V3]
    U --> V[OneChain Network]
  end

  subgraph User[User Journey]
    W[Connect Wallet] --> X[Browse RWA Assets]
    X --> Y[Select Investment Amount]
    Y --> Z[Purchase Fractions]
    Z --> AA[Track Portfolio]
    AA --> BB[Trade or Redeem]
  end
```

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

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file and configure your thirdweb client ID:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your thirdweb client ID:
```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID="your_thirdweb_client_id_here"
```

You can get a client ID from the [thirdweb dashboard](https://thirdweb.com/dashboard/settings/api-keys).

### 3. Configure OneChain Network
Add OneChain network configuration to your `.env.local`:
```bash
# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
NEXT_PUBLIC_ONECHAIN_TESTNET_RPC_URL=https://testnet-rpc.onechain.network
NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL=https://rpc.onechain.network
NEXT_PUBLIC_ONECHAIN_TESTNET_EXPLORER=https://testnet-explorer.onechain.network
NEXT_PUBLIC_ONECHAIN_MAINNET_EXPLORER=https://explorer.onechain.network
```

### 4. Deploy Smart Contracts to OneChain (Optional)
If you want to deploy your own contracts:
```bash
# Deploy to OneChain testnet
npm run deploy:onechain-testnet

# Deploy to OneChain mainnet
npm run deploy:onechain-mainnet
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### 4. Connect Your Wallet
- The application supports multiple wallet types through Thirdweb
- Click "Connect Wallet" in the navigation bar
- Choose from MetaMask, WalletConnect, Coinbase Wallet, and more
- For mobile users, use the hamburger menu to access wallet connection

### 5. Explore Features
- **Homepage**: Overview of available assets and platform statistics
- **Landing Page**: Detailed information about OneRWA platform
- **Marketplace**: Browse and search all available tokenized assets
- **Dashboard**: View your portfolio, holdings, and investment analytics

### Quick Start (All-in-One)

```bash
# 1) Install
npm install

# 2) Configure env
cp .env.example .env.local  # then edit .env.local

# 3) Run
npm run dev
```

## Customize Your Marketplace

### 1. Supported Networks
Deploy a [MarketplaceV3 contract](https://thirdweb.com/thirdweb.eth/MarketplaceV3) on each network you want to support. Add the desired chains to [`./src/consts/chains.ts`](./src/consts/chains.ts).

[Learn more about thirdweb Chains](https://portal.thirdweb.com/typescript/v5/chain).

### 2. Marketplace Contracts
Add your deployed MarketplaceV3 contract addresses and their corresponding chains to [`/src/consts/marketplace_contracts.ts`](/src/consts/marketplace_contract.ts).

### 3. Supported Currencies
Configure the ERC20 tokens you want to support for payments in [`./src/consts/supported_tokens.ts`](./src/consts/supported_tokens.ts).

## Learn More

To learn more about thirdweb, take a look at the following resources:

- [thirdweb Documentation](https://portal.thirdweb.com/) - learn about thirdweb features and API.
- [thirdweb Discord](https://discord.gg/thirdweb) - join our community for support and questions.

## Security

If you discover a security vulnerability, please report it by emailing `security@thirdweb.com`.


## Project Structure

- `contracts/` — Solidity contracts (`Fraction.sol`, `Fractionalizer.sol`, `PropertyNFT.sol`).
- `scripts/deploy.ts` — Hardhat deployment script(s).
- `src/` — Next.js app and components.
  - `src/app/` — Next.js routes (e.g., `landing/page.tsx`).
  - `src/components/` — UI components (e.g., `token-page/*`, `shared/*`).
  - `src/consts/` — Chain, contract, and token configuration.

## Scripts

From `package.json`:

```bash
npm run dev      # start Next.js dev server
npm run build    # build production bundle
npm run start    # start production server
npm run lint     # run Next.js lint
```

Hardhat (typical usage):

```bash
npx hardhat compile
npx hardhat test
# Deploy (example):
npx hardhat run scripts/deploy.ts --network <network>
```

## Environment

Create `.env.local` at repo root:

```
NEXT_PUBLIC_TW_CLIENT_ID="<your-thirdweb-client-id>"
```

You can obtain a client ID from the [thirdweb dashboard](https://thirdweb.com/dashboard/settings/api-keys).

## Workflow

1) Install dependencies: `npm install`

2) Configure environment: create `.env.local` with your Thirdweb client ID.

3) (Optional) Develop/compile/deploy contracts with Hardhat.

4) Update frontend configs:
   - Chains: `src/consts/chains.ts`
   - Marketplace contracts: `src/consts/marketplace_contract.ts`
   - Supported tokens: `src/consts/supported_tokens.ts`

5) Run the app: `npm run dev` and open http://localhost:3000

6) Connect wallet (OneWallet via navbar) and interact with marketplace pages.


## Troubleshooting

### Common Issues

#### Wallet Connection Issues
- **OneChain Network**: Ensure your wallet is configured for OneChain network (Chain ID: 1001 for testnet, 1000 for mainnet)
- **Auto Network Switch**: The app will prompt you to switch to OneChain automatically
- **Desktop**: Ensure you have MetaMask, Coinbase Wallet, or another supported wallet extension installed
- **Mobile**: Use WalletConnect or the built-in browser of your mobile wallet
- **Connection Fails**: Try refreshing the page and reconnecting
- **Wrong Network**: The app prioritizes OneChain but supports legacy testnets as fallback

#### OneChain-Specific Issues
- **RPC Connection**: If OneChain RPC is slow, check your network configuration
- **Contract Interactions**: Ensure you have sufficient ONE tokens for gas fees
- **Fractionalization Fails**: Verify you own the NFT and have approved the Fractionalizer contract
- **Asset Not Loading**: Check if the asset exists on the correct OneChain network (testnet vs mainnet)

#### Build/Runtime Errors
- **Module not found errors**: Run `npm install` to ensure all dependencies are installed
- **Environment variable errors**: Ensure `.env.local` exists with valid `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- **Next.js fails to start**: Clear `.next/` folder and retry: `rm -rf .next && npm run dev` (Windows: delete `.next` folder manually)
- **Scrypt compilation errors**: The project includes webpack configuration to handle this automatically

#### Performance Issues
- **Slow loading**: The app fetches real NFT metadata which may take time
- **Network timeouts**: Switch to a different OneChain RPC endpoint if needed
- **Low gas fees**: OneChain offers significantly lower fees compared to Ethereum mainnet
- **Development**: Use OneChain testnet for development and testing

### Getting Help
- Check the [thirdweb documentation](https://portal.thirdweb.com/)
- Join the [thirdweb Discord](https://discord.gg/thirdweb) for community support
- Review contract addresses in `src/consts/` if using custom deployments

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

