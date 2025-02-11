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
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nem vagy bejelentkezve!");
      if (!amount) throw new Error("Add meg az összeget!");
      if (!description) throw new Error("Add meg a leírást!");

      let fileUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        fileUrl = uploadData?.path;
      }

      const { error } = await supabase.from("transactions").insert({
        amount: -Math.abs(parseInt(amount)),
        date: date,
        type: "expense",
        description: description.trim(),
        created_by: user.id,
        receipt_url: fileUrl
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
      setDate(new Date().toISOString().split('T')[0]);
      setFile(null);
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Hiba",
        description: error instanceof Error ? error.message : "Nem sikerült rögzíteni a kiadást",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
            <Label htmlFor="date">Dátum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
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

          <div className="space-y-2">
            <Label htmlFor="receipt">Számla vagy bizonylat (opcionális)</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
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
