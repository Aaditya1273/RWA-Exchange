# 🚀 ONECHAIN DEPLOYMENT GUIDE - REAL BLOCKCHAIN

## ⚡ QUICK DEPLOYMENT (5 MINUTES)

### ✅ STEP 1: Get ONE Tokens (1 min)

Your wallet: `0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742`

**Option A - OneChain Faucet:**
- Go to: https://faucet.onelabs.cc/
- Paste your address
- Request testnet ONE tokens

**Option B - Discord:**
- Join OneChain Discord
- Request tokens in faucet channel

---

### ✅ STEP 2: Deploy Contract (2 min)

**Using Sui CLI (OneChain compatible):**

```powershell
# Navigate to project
cd "c:\Users\Aditya\OneDrive\Desktop\New folder\RWA-Exchange"

# Deploy to OneChain testnet
sui client publish --gas-budget 100000000
```

**OR Use Web Interface:**
1. Go to OneChain Explorer
2. Connect wallet
3. Upload `sources/property_nft.move`
4. Deploy

**COPY THE PACKAGE ID!**

---

### ✅ STEP 3: Update Configuration (30 sec)

Edit `.env.local`:
```
NEXT_PUBLIC_APP_MODE=blockchain
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
```

---

### ✅ STEP 4: Restart App (30 sec)

```powershell
# Stop server (Ctrl+C)
npm run dev
```

---

## 🎯 TEST COMPLETE FLOW

### A. CREATE PROPERTY NFT
1. Go to: http://localhost:3000/create-property
2. Fill form with real data:
   - Name: "Luxury Apartment Mumbai"
   - Total Value: 1000000
   - Total Shares: 10000
   - Price Per Share: 100
3. Click "Create Property"
4. Approve transaction in wallet
5. **COPY TX HASH #1**
6. **COPY PROPERTY OBJECT ID**

### B. FRACTIONALIZATION (INVEST)
1. Go to: http://localhost:3000/collection
2. Click on your property
3. Click "Invest"
4. Enter shares to buy: 100
5. Approve transaction
6. **COPY TX HASH #2**
7. **COPY INVESTMENT OBJECT ID**

### C. LISTING/TRANSFER
1. Go to: http://localhost:3000/my-investments
2. Click "Transfer" on your investment
3. Enter recipient address
4. Approve transaction
5. **COPY TX HASH #3**

---

## 📦 PROOF PACK

Fill this template:

```
=== RWA EXCHANGE PROOF PACK ===

Network: OneChain Testnet
Package ID: [YOUR_PACKAGE_ID]

1. Property NFT Creation:
   - TX Hash: [TX_HASH_1]
   - Object ID: [PROPERTY_ID]
   - Explorer: https://explorer.onelabs.cc/tx/[TX_HASH_1]

2. Fractionalization (Investment):
   - TX Hash: [TX_HASH_2]
   - Object ID: [INVESTMENT_ID]
   - Shares: 100
   - Explorer: https://explorer.onelabs.cc/tx/[TX_HASH_2]

3. Listing/Transfer:
   - TX Hash: [TX_HASH_3]
   - Recipient: [ADDRESS]
   - Explorer: https://explorer.onelabs.cc/tx/[TX_HASH_3]
```

---

## ✅ WHAT'S BEEN REMOVED:

- ❌ ALL mock/fake data
- ❌ Database mode
- ❌ Demo properties
- ❌ Fake transactions

## ✅ WHAT'S NOW REAL:

- ✅ Real OneChain blockchain
- ✅ Real ONE token payments
- ✅ Real NFT creation
- ✅ Real fractionalization
- ✅ Real transfers
- ✅ Real on-chain storage

---

## 🚨 IMPORTANT:

- Everything is now REAL blockchain
- All transactions cost real gas (testnet ONE)
- All data is permanent on-chain
- No mock data anywhere

---

## 🎯 TOTAL TIME: 5 MINUTES
