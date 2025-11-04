'use client';

import React from 'react';
import { WalletStandardDemo } from '@/components/WalletStandardDemo';
import { OneChainWalletConnect } from '@/components/OneChainWalletConnect';

export default function WalletDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            OneChain Wallet Standard Integration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This demo showcases the integration with OneChain wallet browser extension 
            using the Wallet Standard interface. Connect your wallet to test various 
            transaction types including basic transfers, RWA investments, and sponsored transactions.
          </p>
          
          {/* Simple Wallet Connect */}
          <div className="mt-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Connect</h2>
            <OneChainWalletConnect />
          </div>
        </div>
        
        <WalletStandardDemo />
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Integration Features
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✅ Wallet Standard compliant connection</li>
            <li>✅ Transaction serialization using tx.serialize()</li>
            <li>✅ Sign-only and sign-and-execute patterns</li>
            <li>✅ RWA investment transaction support</li>
            <li>✅ Sponsored transaction creation</li>
            <li>✅ Balance and object queries</li>
            <li>✅ Proper error handling and user feedback</li>
            <li>✅ Connection persistence across sessions</li>
          </ul>
        </div>
        
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-900 mb-3">
            Prerequisites
          </h2>
          <ul className="space-y-2 text-yellow-800">
            <li>• OneChain wallet browser extension installed</li>
            <li>• Wallet funded with OCT tokens for gas fees</li>
            <li>• Valid recipient addresses for testing transfers</li>
            <li>• RWA project addresses for investment testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}