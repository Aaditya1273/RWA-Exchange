@echo off
echo ========================================
echo   ULTRA-FAST DEPLOYMENT SCRIPT
echo ========================================
echo.

echo Step 1: Opening Sui Faucet...
start https://faucet.sui.io/

echo Step 2: Opening Sui Explorer for Deployment...
start https://suiexplorer.com/?network=testnet

echo Step 3: Opening deployment file...
start notepad sources\property_nft_deploy.move

echo.
echo ========================================
echo   MANUAL STEPS (5 MINUTES):
echo ========================================
echo 1. Get testnet tokens from faucet
echo 2. In Sui Explorer, click "Publish Package"
echo 3. Upload property_nft_deploy.move
echo 4. Approve transaction
echo 5. COPY PACKAGE ID
echo 6. Update .env.local with Package ID
echo 7. Run: npm run dev
echo ========================================
pause
