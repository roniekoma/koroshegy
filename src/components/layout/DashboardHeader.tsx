import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

const DashboardHeader = ({
  userName,
  userEmail,
  onLogout,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Kőröshegy (Petőfi Sándor u. 59) költségnyilvántartás
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <User className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
