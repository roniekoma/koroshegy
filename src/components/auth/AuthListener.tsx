import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) return;

        const user = session.user;

        // Csak akkor kezeljük a megerősítést, ha ez egy EMAIL_CONFIRMED esemény
        if (event === "EMAIL_CONFIRMED") {
          navigate("/email-confirmation");
          return;
        }

        // SIGNED_IN eseménynél csak az users táblát kezeljük
        if (event === "SIGNED_IN") {
          // Ellenőrizzük, hogy már létezik-e a felhasználó a users táblában
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

          if (existingUser) {
            console.log("User already exists in users table, skipping insert.");
            return;
          }

          // Ha nem létezik, beszúrjuk a users táblába
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: user.id,
              name: user.user_metadata?.name || "Unknown",
              email: user.email,
              birth_date: user.user_metadata?.birthDate || null,
            },
          ]);

          if (profileError) {
            console.error("Profile creation error:", profileError);
          } else {
            console.log("Profile created successfully!");
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}
