import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nem vagy bejelentkezve!");

      const { error } = await supabase.from("transactions").insert({
        amount: -Math.abs(parseInt(amount)), // Mindig negatív szám
        date: new Date().toISOString(),
        type: "expense",
        description: description.trim(),
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sikeres kiadás rögzítés",
        description: "A tranzakció sikeresen rögzítve",
        className: "bg-green-500 text-white",
      });

      onSuccess?.();
      onClose();
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült rögzíteni a kiadást",
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
          <DialogTitle>Új kiadás rögzítése</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

          <div className="space-y-2">
            <Label htmlFor="description">Megjegyzés</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pl.: Villanyszerelés"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Mégsem
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? "Mentés..." : "Mentés"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
