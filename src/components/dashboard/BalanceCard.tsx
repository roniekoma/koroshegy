import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent } from "../ui/card";
import { supabase } from "@/lib/supabase";

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
  currency?: string;
}

export interface BalanceCardRef {
  refresh: () => void;
}

const calculateMonthsSince2025 = () => {
  const start = new Date(2025, 0, 1);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1; // +1 a mostani hónapot is beleszámoljuk
  return Math.max(0, months);
};

const BalanceCard = forwardRef<BalanceCardRef, BalanceCardProps>(({
  currency = "HUF",
}, ref) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserBalance[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch total balance (unchanged logic)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount')
        .throwOnError();

      if (transactionsError) throw transactionsError;

      const total = transactionsData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;
      setBalance(total);

      // Fetch users with monthly fees
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, monthly_fee')
        .throwOnError();

      if (usersError) throw usersError;

      // Fetch all payment transactions for all users with month and year
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('transactions')
        .select('user_id, amount, date, month, year')
        .eq('type', 'payment')
        .order('date', { ascending: false })
        .throwOnError();

      if (paymentsError) throw paymentsError;

      const monthsSince2025 = calculateMonthsSince2025();

      const userBalances = usersData.map(user => {
        const userPayments = paymentsData.filter(payment => payment.user_id === user.id);
        const totalPayments = userPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const expectedPayments = monthsSince2025 * user.monthly_fee;
        const balance = expectedPayments - totalPayments;
        
        const lastPayment = userPayments[0];
        const lastPaidMonth = lastPayment && lastPayment.month && lastPayment.year ? {
          month: parseInt(lastPayment.month),
          year: parseInt(lastPayment.year)
        } : undefined;

        return {
          id: user.id,
          name: user.name,
          balance,
          monthlyFee: user.monthly_fee,
          lastPaidMonth
        };
      });

      setUsers(userBalances);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchData
  }));

  useEffect(() => {
    fetchData();
  }, []);

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
              {loading ? (
                "Loading..."
              ) : error ? (
                <span className="text-red-500 text-sm">Error loading balance</span>
              ) : (
                new Intl.NumberFormat("hu-HU", {
                  style: "currency",
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(balance)
              )}
            </div>
          </div>

          {/* User Balances Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              User Balances
            </h3>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col space-y-1 py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                      <span
                        className={`text-sm font-medium ${user.balance > 0 ? "text-red-600" : "text-green-600"}`}
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
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default BalanceCard;
