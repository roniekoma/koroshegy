import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "payment" | "expense";
  description: string;
  user?: string;
  month?: number;
  year?: number;
}

interface TransactionListProps {
  transactions?: Transaction[];
}

export default function TransactionList({
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
}: TransactionListProps) {
  return (
    <Card className="w-full h-[500px] bg-white p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        Recent Transactions
      </h2>
      <ScrollArea className="h-[420px] w-full rounded-md">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {transaction.description}
                  {transaction.type === "payment" && transaction.user && (
                    <span className="text-sm text-gray-500 ml-1">
                      - {transaction.user}
                      {transaction.month && transaction.year && (
                        <span>
                          {" "}
                          (
                          {new Date(
                            transaction.year,
                            transaction.month - 1,
                          ).toLocaleDateString("hu-HU", {
                            year: "numeric",
                            month: "long",
                          })}
                          )
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.amount >= 0 ? "+" : ""}
                  {transaction.amount.toLocaleString()} Ft
                </span>
                <Badge
                  variant={
                    transaction.type === "payment" ? "default" : "destructive"
                  }
                  className="capitalize"
                >
                  {transaction.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
