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
        console.log("Auth event:", event);

        if (event === "EMAIL_CONFIRMED") {
          navigate("/email-confirmation");
          return;
        }

        if (event === "SIGNED_IN") {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

          if (existingUser) {
            console.log("User exists, redirecting to home");
            navigate("/");
            return;
          }

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
            navigate("/");
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
