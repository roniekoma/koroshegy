import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id: string;
  name: string;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Felhasználók betöltése
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data: usersData, error } = await supabase
          .from("users")
          .select("id, name")
          .order("name");

        if (error) throw error;

        if (usersData) {
          setUsers(usersData);
          // Ha van bejelentkezett felhasználó, állítsuk be alapértelmezettként
          if (user) {
            setSelectedUserId(user.id);
          }
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Hiba",
          description: "Nem sikerült betölteni a felhasználókat",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        amount: parseInt(amount),
        date: new Date().toISOString(),
        type: "payment",
        user_id: selectedUserId,
        month: parseInt(month),
        year: parseInt(year),
        created_by: currentUser?.id,
      });

      if (error) throw error;

      toast({
        title: "Sikeres befizetés",
        description: "A tranzakció sikeresen rögzítve",
        className: "bg-green-500 text-white",
      });

      onClose();
      setAmount("");
      setMonth((new Date().getMonth() + 1).toString());
      setYear(new Date().getFullYear().toString());
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült létrehozni a befizetést",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Új befizetés rögzítése</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="user">Felhasználó</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz felhasználót" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Év</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Hónap</Label>
              <Input
                id="month"
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                min="1"
                max="12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Összeg (Ft)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25000"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Mégsem
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mentés..." : "Mentés"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
