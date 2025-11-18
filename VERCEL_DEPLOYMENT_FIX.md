# 🔧 Vercel Deployment Fix - Works Locally But Not on Vercel

## 🎯 The Problem

- ✅ Works on localhost
- ❌ Doesn't work on Vercel
- Transaction shows all null gas data on Vercel

## 🔍 Root Cause

Vercel is using **cached build** or **old dependencies**. The new code isn't being deployed.

## ✅ Solution: Force Clean Vercel Build

### Step 1: Clear Vercel Build Cache

In Vercel Dashboard:
1. Go to **Settings** tab
2. Scroll to **Build & Development Settings**
3. Find **Build Cache**
4. Click **Clear Build Cache**

### Step 2: Add Environment Variables

Go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
NEXT_PUBLIC_RWA_PACKAGE_ID=0x7df89a7822e3ab90aab72de31cdecaf44886483b88770bbda1375a5dae3c2a3a
```

Select **all environments** (Production, Preview, Development)

### Step 3: Force Redeploy

Go to **Deployments** tab:
1. Click **...** menu on latest deployment
2. Click **Redeploy**
3. **UNCHECK** "Use existing Build Cache" ✅ (IMPORTANT!)
4. Click **Redeploy**

### Step 4: Watch Build Logs

Monitor the build and look for:
```
✓ Compiled successfully
✓ Linting and checking validity of types
```

## 🚀 Alternative: Git Force Push

```bash
# Commit all changes
git add .
git commit -m "fix: Force clean build for Vercel"

# Force push to trigger new build
git push origin main --force-with-lease
```

## ✅ Verification

After redeployment:
1. Open Vercel URL
2. Connect wallet
3. Create property
4. Check transaction JSON - should show owner address
5. Sign button should be enabled

## 📝 Checklist

- [ ] Clear Vercel build cache
- [ ] Add environment variables
- [ ] Redeploy WITHOUT build cache
- [ ] Test on Vercel URL
- [ ] Verify Sign button works

This will fix the Vercel deployment! 🎉
