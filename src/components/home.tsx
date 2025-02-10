import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "./layout/DashboardHeader";
import BalanceCard from "./dashboard/BalanceCard";
import TransactionList from "./dashboard/TransactionList";
import ActionButtons from "./dashboard/ActionButtons";

interface HomeProps {
  user?: {
    name: string;
    email: string;
    isAdmin: boolean;
  };
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
  transactions?: Array<{
    id: string;
    date: string;
    amount: number;
    type: "payment" | "expense";
    description: string;
    user?: string;
    month?: number;
    year?: number;
  }>;
}

export default function Home({
  user = {
    name: "John Doe",
    email: "john@example.com",
    isAdmin: false,
  },
  balance = 150000,
  lastTransaction = {
    type: "income",
    amount: 25000,
    date: "2024-03-20",
  },
  transactions = [
    {
      id: "1",
      date: "2024-03-20",
      amount: 50000,
      type: "payment",
      description: "Monthly maintenance fee",
      user: "John Doe",
      month: 3,
      year: 2024,
    },
    {
      id: "2",
      date: "2024-03-19",
      amount: -15000,
      type: "expense",
      description: "Utility bills",
    },
    {
      id: "3",
      date: "2024-03-18",
      amount: -25000,
      type: "expense",
      description: "Building repairs",
    },
  ],
}: HomeProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAdminPanelClick = () => {
    console.log("Admin panel clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  const handlePayment = () => {
    console.log("Payment clicked");
  };

  const handleExpense = () => {
    console.log("Expense clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        userName={user.name}
        userEmail={user.email}
        isAdmin={user.isAdmin}
        onLogout={handleLogout}
        onAdminPanelClick={handleAdminPanelClick}
        onProfileClick={handleProfileClick}
      />
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
        <TransactionList transactions={transactions} />
      </main>
      <ActionButtons onPayment={handlePayment} onExpense={handleExpense} />
    </div>
  );
}
