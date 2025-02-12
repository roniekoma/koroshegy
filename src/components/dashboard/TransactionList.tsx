import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  receipt_url?: string | null;
}

interface User {
  id: string;
  name: string;
}

export interface TransactionListRef {
  refresh: () => void;
}

interface TransactionListProps {
  onTransactionDeleted?: () => void;
}

const TransactionList = forwardRef<TransactionListRef, TransactionListProps>(({ onTransactionDeleted }, ref) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserEmail(user?.email || null);
    };
    getCurrentUser();
  }, []);

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

  const loadTransactions = async () => {
    try {
      const { data: transactionsData, error } = await supabase
        .from("transactions")
        .select("id, date, amount, type, description, user_id, month, year, receipt_url")
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

      setTransactions(transactionsWithUserNames);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const handleDownload = async (receipt_url: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('expense-receipts')
        .download(receipt_url);
      
      if (error) throw error;

      // Fájl letöltése
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = receipt_url.split('/').pop() || 'receipt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      // Ha van csatolt fájl, először azt töröljük
      if (transactionToDelete.receipt_url) {
        // Csak a fájlnevet használjuk a path-ból
        const filePath = transactionToDelete.receipt_url;
        const { error: storageError } = await supabase.storage
          .from('expense-receipts')
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting file:", storageError);
          toast({
            title: "Figyelmeztetés",
            description: "A fájl törlése nem sikerült, de a tranzakció törölve lesz",
            variant: "destructive",
          });
        }
      }

      // Tranzakció törlése
      const { error: dbError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "Sikeres törlés",
        description: "A tranzakció sikeresen törölve",
        className: "bg-green-500 text-white",
      });

      loadTransactions(); // Lista újratöltése
      onTransactionDeleted?.(); // BalanceCard frissítése
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült törölni a tranzakciót",
        variant: "destructive",
      });
    } finally {
      setTransactionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({
    refresh: loadTransactions
  }));

  useEffect(() => {
    loadTransactions();
  }, [users]);

  return (
    <>
      <Card className="w-full h-[500px] bg-white p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Recent Transactions (last 10)
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
                  {transaction.receipt_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(transaction.receipt_url!)}
                      className="px-2"
                    >
                      <FileIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {currentUserEmail === "dankhazi.peter@webdream.hu" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                      className="px-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
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

      {currentUserEmail === "dankhazi.peter@webdream.hu" && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Biztosan törölni szeretnéd ezt a tranzakciót?</AlertDialogTitle>
              <AlertDialogDescription>
                Ez a művelet nem vonható vissza.
                {transactionToDelete?.receipt_url && " A csatolt fájl is törlésre kerül."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégsem</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                Törlés
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
});

export default TransactionList;
