import React, { useState } from 'react';
import { useWalletStandard } from '@/hooks/useWalletStandard';
import { Transaction } from '@mysten/sui/transactions';

export const WalletStandardDemo: React.FC = () => {
  const {
    account,
    isConnected,
    isLoading,
    error,
    balance,
    connect,
    disconnect,
    signTransaction,
    signAndExecuteTransaction,
    createTransaction,
    createRWAInvestmentTransaction,
    createSponsoredTransaction,
    refreshBalance,
    getOwnedObjects,
    isWalletAvailable,
  } = useWalletStandard();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setTransactionResult(null);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      // Create transaction using Wallet Standard pattern
      const tx = await createTransaction(recipient, amount);
      
      // Sign and execute transaction
      const result = await signAndExecuteTransaction(tx);
      setTransactionResult(result);
      
      // Clear form
      setRecipient('');
      setAmount('');
    } catch (err) {
      console.error('Transaction failed:', err);
      alert(`Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRWAInvestment = async () => {
    if (!projectAddress || !investmentAmount) {
      alert('Please enter project address and investment amount');
      return;
    }

    try {
      // Create RWA investment transaction
      const tx = await createRWAInvestmentTransaction(projectAddress, investmentAmount);
      
      // Sign and execute transaction
      const result = await signAndExecuteTransaction(tx);
      setTransactionResult(result);
      
      // Clear form
      setProjectAddress('');
      setInvestmentAmount('');
    } catch (err) {
      console.error('RWA investment failed:', err);
      alert(`RWA investment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSignOnly = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      // Create transaction
      const tx = await createTransaction(recipient, amount);
      
      // Sign transaction only (don't execute)
      const signResult = await signTransaction(tx);
      
      console.log('Transaction signed:', signResult);
      alert('Transaction signed successfully! Check console for details.');
    } catch (err) {
      console.error('Signing failed:', err);
      alert(`Signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCreateSponsoredTransaction = async () => {
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      // Create base transaction
      const baseTx = await createTransaction(recipient, amount);
      
      // Create sponsored transaction (example with dummy sponsor data)
      const sponsorAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const sponsorCoins = ['0xabcdef1234567890abcdef1234567890abcdef12'];
      
      const sponsoredTx = await createSponsoredTransaction(baseTx, sponsorAddress, sponsorCoins);
      
      console.log('Sponsored transaction created:', sponsoredTx);
      alert('Sponsored transaction created! Check console for details.');
    } catch (err) {
      console.error('Sponsored transaction creation failed:', err);
      alert(`Sponsored transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGetOwnedObjects = async () => {
    try {
      const objects = await getOwnedObjects();
      console.log('Owned objects:', objects);
      alert(`Found ${objects.length} owned objects. Check console for details.`);
    } catch (err) {
      console.error('Failed to get owned objects:', err);
    }
  };

  if (!isWalletAvailable) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          OneChain Wallet Not Available
        </h3>
        <p className="text-yellow-700">
          Please install the OneChain wallet browser extension to use this demo.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-6">OneChain Wallet Standard Demo</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="text-center">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect OneChain Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Connected Account</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Address:</strong> {account?.address}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Balance:</strong> {parseFloat(balance) / 1e9} OCT
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={refreshBalance}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Balance
              </button>
              <button
                onClick={handleGetOwnedObjects}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                Get Owned Objects
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Send Transaction */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Send Transaction</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Amount (in MIST)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSendTransaction}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Sign & Execute
                </button>
                <button
                  onClick={handleSignOnly}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Sign Only
                </button>
                <button
                  onClick={handleCreateSponsoredTransaction}
                  disabled={isLoading}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Create Sponsored
                </button>
              </div>
            </div>
          </div>

          {/* RWA Investment */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">RWA Investment</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project Address"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Investment Amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <button
                onClick={handleRWAInvestment}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Invest in RWA
              </button>
            </div>
          </div>

          {/* Transaction Result */}
          {transactionResult && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-green-800">Transaction Result</h3>
              <pre className="text-sm text-green-700 overflow-auto">
                {JSON.stringify(transactionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};