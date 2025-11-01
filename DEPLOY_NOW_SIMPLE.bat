@echo off
echo ========================================
echo   ONECHAIN DEPLOYMENT - ULTRA FAST
echo ========================================
echo.
echo Your wallet: 0xc466ea33ecaa82516709f677adcaf18ef4d40a4301525e9b9e7344a7a3a8c742
echo.
echo ========================================
echo   STEP 1: GET ONE TOKENS
echo ========================================
echo Opening OneChain Faucet...
start https://faucet.onelabs.cc/
timeout /t 3
echo.
echo ========================================
echo   STEP 2: DEPLOY CONTRACT
echo ========================================
echo Opening Sui Explorer (works with OneChain)...
start https://suiexplorer.com/
timeout /t 2
echo.
echo Opening contract file...
start notepad sources\property_nft.move
echo.
echo ========================================
echo   MANUAL STEPS (3 MINUTES):
echo ========================================
echo.
echo 1. In Sui Wallet extension:
echo    - Settings ^> Network
echo    - Add Custom RPC:
echo      Name: OneChain Testnet
echo      URL: https://rpc-testnet.onelabs.cc:443
echo    - Switch to OneChain Testnet
echo.
echo 2. Get tokens from faucet (paste your address)
echo.
echo 3. In Sui Explorer:
echo    - Connect Wallet
echo    - Click "Publish Package"
echo    - Upload property_nft.move
echo    - Approve transaction
echo    - COPY PACKAGE ID!
echo.
echo 4. Update .env.local:
echo    NEXT_PUBLIC_APP_MODE=blockchain
echo    NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
echo    NEXT_PUBLIC_RWA_PACKAGE_ID=YOUR_PACKAGE_ID
echo.
echo 5. Run: npm run dev
echo.
echo ========================================
pause
