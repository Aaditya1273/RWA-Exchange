"use client";

import Dashboard from "@/components/dashboard/Dashboard";
import { WalletGuard } from "@/components/WalletGuard";

export default function DashboardPage() {
  return (
    <WalletGuard requireWallet={true}>
      <Dashboard />
    </WalletGuard>
  );
}
