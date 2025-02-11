import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        // Hiba esetén is átirányítunk
      } finally {
        // Mindenképp átirányítunk a login oldalra, még hiba esetén is
        navigate('/login');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Kijelentkezés...</h1>
        <p className="text-gray-600">Átirányítás folyamatban</p>
      </div>
    </div>
  );
}
