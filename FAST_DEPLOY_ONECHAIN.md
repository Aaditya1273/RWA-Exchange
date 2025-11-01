# ⚡ FASTEST ONECHAIN DEPLOYMENT (NO CLI NEEDED)

## 🚀 METHOD 1: Use Sui Wallet + OneChain RPC (FASTEST - 2 MIN)

### Step 1: Install Sui Wallet Extension
- Chrome: https://chrome.google.com/webstore/detail/sui-wallet
- Already have it? Skip to Step 2

### Step 2: Configure for OneChain
1. Open Sui Wallet
2. Click Settings → Network
3. Add Custom RPC:
   - Name: `OneChain Testnet`
   - RPC URL: `https://rpc-testnet.onelabs.cc:443`
4. Switch to OneChain Testnet

### Step 3: Get ONE Tokens
Your address: `0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742`

**Get tokens:**
- OneChain Faucet: https://faucet.onelabs.cc/
- OR Discord: https://discord.gg/onechain

### Step 4: Deploy via Sui Explorer (Works with OneChain!)
1. Go to: https://suiexplorer.com/
2. Click "Connect Wallet"
3. Select your network (OneChain Testnet)
4. Click "Publish Package"
5. Upload: `sources/property_nft.move`
6. Approve transaction
7. **COPY PACKAGE ID!**

---

## 🚀 METHOD 2: Use OneChain CLI (If available)

```powershell
# Install OneChain CLI
npm install -g @onechain/cli

# Deploy
onechain deploy sources/property_nft.move --network testnet
```

---

## 🚀 METHOD 3: Manual Deployment Script

I'll create a deployment script for you:

```powershell
# Run this
node deploy-onechain.js
```

---

## ⚡ RECOMMENDED: METHOD 1 (Sui Wallet)

**Why?**
- ✅ No CLI installation needed
- ✅ Works immediately
- ✅ Visual interface
- ✅ 2 minutes total

**DO THIS NOW:**
1. Open Sui Wallet extension
2. Add OneChain RPC
3. Get tokens from faucet
4. Deploy via Sui Explorer
5. Done!

---

## 📝 AFTER DEPLOYMENT:

Update `.env.local`:
```env
NEXT_PUBLIC_APP_MODE=blockchain
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
```

Then:
```powershell
npm run dev
```

---

## 🎯 TOTAL TIME: 3 MINUTES
