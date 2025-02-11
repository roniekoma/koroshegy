import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/login';
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
      }
    };
    
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isChanging) return;

    if (newPassword !== confirmPassword) {
      setError("Az új jelszavak nem egyeznek meg");
      return;
    }

    setIsChanging(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess("A jelszó sikeresen megváltoztatva! Átirányítás...");
      
      // Várunk egy másodpercet hogy a felhasználó lássa a sikeres üzenetet
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          window.location.href = '/login';
        } catch (error) {
          console.error('Logout error:', error);
          window.location.href = '/login';
        }
      }, 1000);
      
    } catch (error: any) {
      setError(error.message);
      setIsChanging(false);
    }
  };

  if (!user || !userData) {
    return <div className="min-h-screen flex items-center justify-center">Betöltés...</div>;
  }

  return (
    <>
      <DashboardHeader
        userName={userData.name}
        userEmail={user.email || ''}
        onLogout={handleLogout}
      />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Felhasználói adatok</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Utoljára bejelentkezve:</strong> {new Date(user?.last_sign_in_at || "").toLocaleDateString("hu-HU")}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Jelszó módosítása</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Új jelszó</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isChanging}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Új jelszó megerősítése</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isChanging}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" disabled={isChanging}>
              {isChanging ? "Jelszó módosítása..." : "Jelszó módosítása"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}