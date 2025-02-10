import React from "react";
import { Card, CardContent } from "../ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface UserBalance {
  id: string;
  name: string;
  balance: number;
  monthlyFee: number;
  lastPaidMonth?: {
    month: number;
    year: number;
  };
}

interface BalanceCardProps {
  balance?: number;
  currency?: string;
  lastTransaction?: {
    type: "income" | "expense";
    amount: number;
    date: string;
  };
  users?: UserBalance[];
}

const BalanceCard = ({
  balance = 150000,
  currency = "HUF",
  lastTransaction = {
    type: "income",
    amount: 25000,
    date: "2024-03-20",
  },
  users = [
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
  ],
}: BalanceCardProps) => {
  return (
    <Card className="w-full max-w-[800px] mx-auto bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Balance Section */}
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              Current Balance
            </h2>
            <div className="text-4xl font-bold text-gray-900">
              {new Intl.NumberFormat("hu-HU", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(balance)}
            </div>
          </div>

          {/* User Balances Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              User Balances
            </h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col space-y-1 py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                    <span
                      className={`text-sm font-medium ${user.balance < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {new Intl.NumberFormat("hu-HU", {
                        style: "currency",
                        currency: currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(user.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex gap-2">
                      <span>
                        Monthly fee: {user.monthlyFee.toLocaleString()} Ft
                      </span>
                      {user.lastPaidMonth && (
                        <span>
                          • Last paid:{" "}
                          {new Date(
                            user.lastPaidMonth.year,
                            user.lastPaidMonth.month - 1,
                          ).toLocaleDateString("hu-HU", {
                            year: "numeric",
                            month: "long",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Transaction Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Last Transaction
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastTransaction.type === "income" ? (
                  <ArrowUpCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {new Date(lastTransaction.date).toLocaleDateString("hu-HU")}
                </span>
              </div>
              <span
                className={`font-medium ${lastTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {lastTransaction.type === "income" ? "+" : "-"}
                {new Intl.NumberFormat("hu-HU", {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(lastTransaction.amount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
