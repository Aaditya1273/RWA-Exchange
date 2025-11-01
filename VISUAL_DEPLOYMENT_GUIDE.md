# 🎯 VISUAL DEPLOYMENT GUIDE - ONECHAIN

## ⚡ 3-MINUTE DEPLOYMENT (NO CLI NEEDED!)

---

## 📱 STEP 1: Configure Sui Wallet for OneChain (1 min)

### A. Install Sui Wallet Extension
- Chrome: https://chrome.google.com/webstore/detail/sui-wallet
- **Already installed?** Skip to B

### B. Add OneChain Network
1. Open Sui Wallet extension
2. Click **⚙️ Settings**
3. Click **Network**
4. Click **+ Add Custom RPC**
5. Fill in:
   ```
   Network Name: OneChain Testnet
   RPC URL: https://rpc-testnet.onelabs.cc:443
   ```
6. Click **Add**
7. **Switch to "OneChain Testnet"** in dropdown

✅ **Done!** Your wallet now connects to OneChain!

---

## 💰 STEP 2: Get ONE Tokens (30 seconds)

### Your Wallet Address:
```
0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742
```

### Get Tokens:
1. Go to: **https://faucet.onelabs.cc/**
2. Paste your address
3. Click **"Request Tokens"**
4. Wait 10 seconds

✅ **Done!** You have testnet ONE tokens!

---

## 🚀 STEP 3: Deploy Contract (1 min)

### A. Open Sui Explorer
Go to: **https://suiexplorer.com/**

### B. Connect Wallet
1. Click **"Connect Wallet"** (top right)
2. Select **Sui Wallet**
3. Approve connection
4. **Verify:** Should show "OneChain Testnet" network

### C. Publish Package
1. Click **"Publish Package"** button
2. Click **"Upload File"**
3. Select: `sources/property_nft.move`
4. Click **"Publish"**
5. **Approve transaction** in wallet popup
6. Wait 10-20 seconds

### D. Copy Package ID
After success, you'll see:
```
✅ Package Published Successfully!
Package ID: 0xABC123...
```

**COPY THIS PACKAGE ID!** 📋

✅ **Done!** Contract deployed to OneChain!

---

## ⚙️ STEP 4: Configure Frontend (30 seconds)

### A. Create .env.local File
In your project root, create `.env.local`:

```env
NEXT_PUBLIC_APP_MODE=blockchain
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_RWA_PACKAGE_ID=PASTE_YOUR_PACKAGE_ID_HERE
```

**Replace `PASTE_YOUR_PACKAGE_ID_HERE` with your actual Package ID!**

### B. Start App
```powershell
npm run dev
```

✅ **Done!** App is running on real blockchain!

---

## 🎯 STEP 5: Test Complete Flow (2 min)

### A. Create Property NFT
1. Go to: **http://localhost:3000/create-property**
2. Fill form:
   ```
   Name: Luxury Apartment Mumbai
   Description: Premium 3BHK in Bandra
   Location: Mumbai, India
   Property Type: Residential
   Total Value: 1000000
   Total Shares: 10000
   Price Per Share: 100
   Rental Yield: 8.5
   Image URL: https://images.unsplash.com/photo-1560518883-ce09059eeffa
   ```
3. Click **"Create Property"**
4. **Approve transaction** in wallet
5. **COPY TX HASH #1** ✅
6. **COPY PROPERTY OBJECT ID** ✅

### B. Invest (Fractionalize)
1. Go to: **http://localhost:3000/collection**
2. You should see your property!
3. Click **"Invest"**
4. Enter shares: `100`
5. **Approve transaction**
6. **COPY TX HASH #2** ✅
7. **COPY INVESTMENT OBJECT ID** ✅

### C. Transfer
1. Go to: **http://localhost:3000/my-investments**
2. You should see your investment!
3. Click **"Transfer"**
4. Enter recipient address (use a test address)
5. **Approve transaction**
6. **COPY TX HASH #3** ✅

---

## 📦 PROOF PACK

Fill this with your data:

```
=== RWA EXCHANGE - ONECHAIN DEPLOYMENT ===

Network: OneChain Testnet
RPC URL: https://rpc-testnet.onelabs.cc:443
Deployer: 0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742

Package ID: [PASTE_HERE]

1. Property NFT Creation:
   TX Hash: [PASTE_HERE]
   Object ID: [PASTE_HERE]
   Explorer: https://suiexplorer.com/txblock/[TX_HASH]?network=testnet

2. Fractionalization (Investment):
   TX Hash: [PASTE_HERE]
   Object ID: [PASTE_HERE]
   Shares: 100
   Explorer: https://suiexplorer.com/txblock/[TX_HASH]?network=testnet

3. Transfer:
   TX Hash: [PASTE_HERE]
   Recipient: [ADDRESS]
   Explorer: https://suiexplorer.com/txblock/[TX_HASH]?network=testnet

✅ All transactions verifiable on-chain
✅ 100% real blockchain - NO MOCK DATA
✅ OneChain Testnet deployment
```

---

## ✅ CHECKLIST

- [ ] Sui Wallet installed
- [ ] OneChain RPC added to wallet
- [ ] Testnet ONE tokens received
- [ ] Contract deployed
- [ ] Package ID copied
- [ ] .env.local created
- [ ] App started
- [ ] Property created (TX #1)
- [ ] Investment made (TX #2)
- [ ] Transfer done (TX #3)
- [ ] Proof pack filled

---

## 🎉 TOTAL TIME: 5 MINUTES

You now have:
✅ Real blockchain deployment
✅ Real NFT creation
✅ Real fractionalization
✅ Real transfers
✅ Complete proof pack
✅ Production-ready app

**CONGRATULATIONS! 🚀**
