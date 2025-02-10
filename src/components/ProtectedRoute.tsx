import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        // Check if user exists in the users table
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setAuthenticated(!!userProfile);
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setAuthenticated(!!userProfile);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
