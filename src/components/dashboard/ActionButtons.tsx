import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";

interface ActionButtonsProps {
  onPayment?: () => void;
  onExpense?: () => void;
  disabled?: boolean;
}

const ActionButtons = ({
  onPayment = () => console.log("Payment clicked"),
  onExpense = () => console.log("Expense clicked"),
  disabled = false,
}: ActionButtonsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center gap-4 shadow-lg z-10">
      <Button
        onClick={onPayment}
        disabled={disabled}
        className="w-40 bg-green-600 hover:bg-green-700 text-white"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Payment
      </Button>
      <Button
        onClick={onExpense}
        disabled={disabled}
        variant="destructive"
        className="w-40"
      >
        <MinusCircle className="mr-2 h-4 w-4" />
        Expense
      </Button>
    </div>
  );
};

export default ActionButtons;
