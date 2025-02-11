import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";

export default function AuthListener() {
  const location = useLocation();

  useEffect(() => {
    // Első betöltéskor ellenőrizzük a session-t
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Ha nincs session és nem login/register oldalon vagyunk, átirányítunk
      if (!session && !isAuthPage(location.pathname)) {
        window.location.href = '/login';
      }
    };
    
    checkSession();

    // Auth változások figyelése
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, "Session:", session ? "exists" : "null");

      // Csak a kijelentkezést kezeljük itt
      if ((event === "SIGNED_OUT" || !session) && !isAuthPage(location.pathname)) {
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  return null;
}

// Segédfüggvény az auth oldalak ellenőrzésére
function isAuthPage(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register' || pathname === '/password-changed';
}
