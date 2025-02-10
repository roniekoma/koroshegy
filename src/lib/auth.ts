import { supabase } from "./supabase";

export async function handleAuthStateChange(event: string, session: any) {
  console.log("Auth state change event:", event);
  console.log("Session:", session);
  console.log("User ID:", session?.user?.id);
  console.log("Auth state change:", { event, session });
  if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
    try {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // If no profile exists, create one
      if (!profile) {
        const { error } = await supabase.from("users").insert([
          {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email,
            email: session.user.email,
            birth_date: session.user.user_metadata.birth_date,
            avatar_url: session.user.user_metadata.avatar_url,
          },
        ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error in handleAuthStateChange:", error);
    }
  }
}
