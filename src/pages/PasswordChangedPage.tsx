import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";

export default function PasswordChangedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Először kijelentkeztetjük a felhasználót
    const logout = async () => {
      await supabase.auth.signOut();
      // Kis késleltetés után átirányítjuk a login oldalra
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    };
    
    logout();

    return () => {};
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Jelszó sikeresen módosítva!</h1>
        <p className="text-gray-600">Átirányítás a bejelentkezési oldalra...</p>
      </div>
    </div>
  );
}