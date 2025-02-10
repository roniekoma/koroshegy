import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const testInsert = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: "018e0c81-a587-7432-9d6e-f057a7c424ec",
            name: "Test User",
            email: "test@test.com",
            birth_date: "2000-01-01",
          },
        ])
        .select();

      if (error) {
        console.error("Insert error:", error);
        alert("Error: " + error.message);
      } else {
        console.log("Insert success:", data);
        alert("Test row inserted successfully!");
      }
    } catch (e) {
      console.error("Exception:", e);
      alert("Exception: " + e.message);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <LoginForm />
      <div className="mt-4">
        <Button onClick={testInsert} variant="outline" className="w-full">
          Test Insert Row
        </Button>
      </div>
    </AuthLayout>
  );
}
