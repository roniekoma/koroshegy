import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

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

interface User {
  id: string;
  name: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
}

export default function TransactionList({
  transactions = [],
}: TransactionListProps) {
  const [fetchedTransactions, setFetchedTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: usersData, error } = await supabase
          .from("users")
          .select("id, name");

        if (error) throw error;

        setUsers(usersData || []);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const { data: transactionsData, error } = await supabase
          .from("transactions")
          .select("id, date, amount, type, description, user_id, month, year")
          .order("date", { ascending: false })
          .limit(10);

        if (error) throw error;

        const transactionsWithUserNames = transactionsData.map(transaction => {
          const user = users.find(u => u.id === transaction.user_id);
          return {
            ...transaction,
            user: user ? user.name : "",
          };
        });

        setFetchedTransactions(transactionsWithUserNames);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, [users]);

  return (
    <Card className="w-full h-[500px] bg-white p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        Recent Transactions (last 10)
      </h2>
      <ScrollArea className="h-[420px] w-full rounded-md">
        <div className="space-y-4">
          {fetchedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {transaction.description || (transaction.type === "payment" ? "Havi befizetés" : "")}
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
                  {transaction.type === "payment" ? "Befizetés" : "Kiadás"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
