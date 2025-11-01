// Application configuration
// Switch between SQLite database and blockchain

export const APP_CONFIG = {
  // Set to 'database' for SQLite, 'blockchain' for Sui/OneChain
  MODE: process.env.NEXT_PUBLIC_APP_MODE || 'database',
  
  // Database mode - instant functionality, no deployment needed
  USE_DATABASE: process.env.NEXT_PUBLIC_APP_MODE !== 'blockchain',
  
  // Blockchain configuration
  BLOCKCHAIN: {
    RPC_URL: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://fullnode.testnet.sui.io:443',
    PACKAGE_ID: process.env.NEXT_PUBLIC_RWA_PACKAGE_ID || '',
  },
};

// Helper to get the correct service
export function getPropertyService() {
  if (APP_CONFIG.USE_DATABASE) {
    return import('@/services/propertyContractDB').then(m => m.propertyContractDBService);
  } else {
    return import('@/services/propertyContract').then(m => m.propertyContractService);
  }
}
