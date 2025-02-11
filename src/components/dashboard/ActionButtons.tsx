import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import PaymentModal from "./PaymentModal";

interface ActionButtonsProps {
  onExpense?: () => void;
  disabled?: boolean;
}

const ActionButtons = ({
  onExpense = () => console.log("Expense clicked"),
  disabled = false,
}: ActionButtonsProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center gap-4 shadow-lg z-10">
        <Button
          onClick={() => setIsPaymentModalOpen(true)}
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
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
};

export default ActionButtons;
