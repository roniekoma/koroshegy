import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        setUser(user);

        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserData({ name: userData.name });
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };
    
    getUser();
  }, [navigate]);

  if (!user || !userData) {
    return null; // Nem jelenítünk meg semmit betöltés közben
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-gray-100"
          >
            <Home className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Kőröshegy (Petőfi Sándor u. 59) költségnyilvántartás
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-sm font-medium text-gray-900">{userData.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
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
            onClick={() => navigate('/logout')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
