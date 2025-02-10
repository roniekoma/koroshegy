import { createClient } from "@supabase/supabase-js";

// 🔹 Az API végpont csak szerveren használható, ezért a Service Role Key itt van
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    // 🔹 Ellenőrizzük, hogy létezik-e a felhasználó az auth.users táblában
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to check user existence" }), { status: 500 });
    }

    const existingUser = usersData?.users.find((user) => user.email === email);

    return new Response(JSON.stringify({ exists: !!existingUser }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
