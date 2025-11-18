# 🚀 Vercel Environment Variables Setup

## 📋 Required Environment Variables

Your RWA Exchange needs these environment variables in Vercel:

### 1. OneChain RPC URL (REQUIRED)
```
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
```
**What it does**: Connects your app to OneChain testnet blockchain

### 2. RWA Package ID (REQUIRED)
```
NEXT_PUBLIC_RWA_PACKAGE_ID=0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a
```
**What it does**: Points to your deployed Move smart contract
**Note**: Replace with YOUR actual package ID from deployment

### 3. OneChain Mainnet RPC (Optional)
```
NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL=https://rpc-mainnet.onelabs.cc:443
```
**What it does**: For future mainnet deployment

---

## 🔧 How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Add each variable:

#### Variable 1:
- **Key**: `NEXT_PUBLIC_ONECHAIN_RPC_URL`
- **Value**: `https://rpc-testnet.onelabs.cc:443`
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 2:
- **Key**: `NEXT_PUBLIC_RWA_PACKAGE_ID`
- **Value**: `0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a`
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 3 (Optional):
- **Key**: `NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL`
- **Value**: `https://rpc-mainnet.onelabs.cc:443`
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

5. **Redeploy** your application for changes to take effect

### Method 2: Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_ONECHAIN_RPC_URL
# Enter: https://rpc-testnet.onelabs.cc:443
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_RWA_PACKAGE_ID
# Enter: 0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## 📝 Your Current Values

Based on your `.env.local` file:

```env
# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_RWA_PACKAGE_ID=0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a

# Optional (for future mainnet)
NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL=https://rpc-mainnet.onelabs.cc:443
```

---

## ✅ Verification Steps

After adding environment variables to Vercel:

### 1. Trigger Redeploy
- Go to **Deployments** tab
- Click the **...** menu on latest deployment
- Click **Redeploy**
- Check **Use existing Build Cache** (optional)
- Click **Redeploy**

### 2. Check Build Logs
- Watch the build logs for any errors
- Look for: `✓ Compiled successfully`

### 3. Test on Vercel
Once deployed:
1. Open your Vercel URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `console.log(process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL)`
5. Should show: `https://rpc-testnet.onelabs.cc:443`

### 4. Test Wallet Connection
1. Connect your OneChain wallet
2. Try creating a property
3. Check if Sign button is enabled
4. Verify gas fees display correctly

---

## 🔍 Troubleshooting

### Issue: Environment variables not working

**Solution 1**: Redeploy after adding variables
```bash
# In Vercel dashboard, go to Deployments → Redeploy
```

**Solution 2**: Check variable names
- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Check for typos in variable names

**Solution 3**: Clear build cache
- When redeploying, uncheck "Use existing Build Cache"

### Issue: Wrong Package ID

**Symptom**: Transactions fail with "Package not found"

**Solution**: Update `NEXT_PUBLIC_RWA_PACKAGE_ID` with your actual package ID:
1. Find your package ID from Move deployment
2. Update in Vercel environment variables
3. Redeploy

### Issue: RPC connection fails

**Symptom**: "Failed to fetch" or network errors

**Solution**: Verify RPC URL is correct:
```
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
```
Note: Must include `https://` and port `:443`

---

## 📊 Environment Variable Summary

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_ONECHAIN_RPC_URL` | ✅ Yes | `https://rpc-testnet.onelabs.cc:443` | OneChain testnet RPC endpoint |
| `NEXT_PUBLIC_RWA_PACKAGE_ID` | ✅ Yes | Your package ID | Your deployed Move contract |
| `NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL` | ❌ No | `https://rpc-mainnet.onelabs.cc:443` | For future mainnet use |

---

## 🎯 Quick Copy-Paste for Vercel

Copy these exact values to add in Vercel dashboard:

### Variable 1:
```
Name: NEXT_PUBLIC_ONECHAIN_RPC_URL
Value: https://rpc-testnet.onelabs.cc:443
```

### Variable 2:
```
Name: NEXT_PUBLIC_RWA_PACKAGE_ID
Value: 0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a
```

### Variable 3 (Optional):
```
Name: NEXT_PUBLIC_ONECHAIN_MAINNET_RPC_URL
Value: https://rpc-mainnet.onelabs.cc:443
```

---

## 🚀 After Setup

Once environment variables are added:

1. ✅ Redeploy your application
2. ✅ Wait for build to complete
3. ✅ Test wallet connection
4. ✅ Test creating property
5. ✅ Verify Sign button works
6. ✅ Verify transactions execute

---

## 📝 Notes

- **NEXT_PUBLIC_** prefix is required for browser access
- Variables are read at **build time**, not runtime
- Must **redeploy** after changing variables
- Use **testnet** for development/testing
- Switch to **mainnet** only when ready for production

---

## ✅ Checklist

- [ ] Added `NEXT_PUBLIC_ONECHAIN_RPC_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_RWA_PACKAGE_ID` to Vercel
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Triggered redeploy
- [ ] Verified build succeeded
- [ ] Tested wallet connection on Vercel URL
- [ ] Tested creating property
- [ ] Verified Sign button works

---

**That's it!** Your Vercel deployment should now work properly with the correct environment variables. 🎉
