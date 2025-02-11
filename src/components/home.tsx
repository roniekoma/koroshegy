import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "./layout/DashboardHeader";
import BalanceCard from "./dashboard/BalanceCard";
import TransactionList, { TransactionListRef } from "./dashboard/TransactionList";
import ActionButtons from "./dashboard/ActionButtons";
import { User } from "@supabase/supabase-js";

interface HomeProps {
  balance?: number;
  users?: Array<{
    id: string;
    name: string;
    balance: number;
    monthlyFee: number;
  }>;
  lastTransaction?: {
    type: "income" | "expense";
    amount: number;
    date: string;
  };
}

export default function Home({
  balance = 150000,
  lastTransaction = {
    type: "income",
    amount: 25000,
    date: "2024-03-20",
  },
}: HomeProps) {
  const navigate = useNavigate();
  const transactionListRef = useRef<TransactionListRef>(null);

  const handlePayment = () => {
    console.log("Payment clicked");
  };

  const handleExpense = () => {
    console.log("Expense clicked");
  };

  const handleTransactionComplete = () => {
    transactionListRef.current?.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 pt-24 pb-32 space-y-8">
        <BalanceCard
          balance={balance}
          currency="HUF"
          lastTransaction={lastTransaction}
          users={[
            {
              id: "1",
              name: "John Doe",
              balance: -25000,
              monthlyFee: 25000,
              lastPaidMonth: { month: 2, year: 2024 },
            },
            {
              id: "2",
              name: "Jane Smith",
              balance: 0,
              monthlyFee: 25000,
              lastPaidMonth: { month: 3, year: 2024 },
            },
            {
              id: "3",
              name: "Bob Johnson",
              balance: -50000,
              monthlyFee: 25000,
              lastPaidMonth: { month: 1, year: 2024 },
            },
          ]}
        />
        <TransactionList ref={transactionListRef} />
      </main>
      <ActionButtons 
        onPayment={handlePayment} 
        onExpense={handleExpense}
        onTransactionComplete={handleTransactionComplete}
      />
    </div>
  );
}
