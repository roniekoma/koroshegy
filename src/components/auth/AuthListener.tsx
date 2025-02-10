import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthListener() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, inserting into users table...");

          const user = session.user;
          if (!user) return;

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
  }, []);

  return null;
}
