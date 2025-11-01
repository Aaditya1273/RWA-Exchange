# 🚀 ULTRA-FAST DEPLOYMENT GUIDE (5 MINUTES)

## ⚡ STEP 1: Use Sui Wallet Extension (1 min)

1. Open browser with Sui Wallet extension
2. Make sure you're on **TESTNET**
3. Your address: `0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742`

## ⚡ STEP 2: Get Testnet Tokens (30 seconds)

Go to: https://faucet.sui.io/
- Paste your address
- Click "Request"
- Wait 10 seconds

## ⚡ STEP 3: Deploy via Sui Explorer (2 min)

1. Go to: https://suiexplorer.com/?network=testnet
2. Click "Publish Package"
3. Upload your `sources/property_nft.move` file
4. Click "Publish"
5. Approve in wallet
6. **COPY PACKAGE ID**

## ⚡ STEP 4: Update Frontend (30 seconds)

Edit `.env.local`:
```
NEXT_PUBLIC_APP_MODE=blockchain
NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://fullnode.testnet.sui.io:443
```

## ⚡ STEP 5: Remove Fake Data (30 seconds)

Already done - just switch mode!

## ⚡ STEP 6: Test Flow (1 min)

1. Restart: `npm run dev`
2. Create property → Get TX hash #1
3. Invest in property → Get TX hash #2
4. Transfer shares → Get TX hash #3

## 📦 PROOF PACK

- Package ID: [From deployment]
- Object ID: [From property creation]
- TX Hash 1: [Property creation]
- TX Hash 2: [Investment]
- TX Hash 3: [Transfer]

## 🎯 TOTAL TIME: 5 MINUTES
