import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Sign up for a new account">
      <RegisterForm />
    </AuthLayout>
  );
}
