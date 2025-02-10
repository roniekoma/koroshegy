import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  avatar?: FileList;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("Starting registration process...");
  
      // 1. Felhasználó regisztrációja Supabase Authentication-ben
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
  
      if (signUpError) {
        console.error("Signup error:", signUpError);
        alert(signUpError.message);
        return;
      }
  
      // 2. Ellenőrizd, hogy van-e felhasználói ID
      const userId = authData.user?.id;
      if (!userId) {
        console.error("No user ID received from Supabase");
        alert("Registration failed - no user ID received");
        return;
      }
  
      console.log("Auth signup successful, user ID:", userId);
  
      // 3. A `users` tábla feltöltése a kapott user ID-val
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: userId, // Az `auth.users` táblából kapott ID kell ide
          name: data.name,
          email: data.email,
          birth_date: data.birthDate,
        },
      ]);
  
      if (profileError) {
        console.error("Profile creation error:", profileError);
        alert("Error creating user profile: " + profileError.message);
        return;
      }
  
      console.log("Profile created successfully");
      alert("Registration successful! Please check your email to confirm your account.");
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      alert("An unexpected error occurred during registration");
    }
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input
            id="birthDate"
            type="date"
            {...register("birthDate", { required: "Birth date is required" })}
          />
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.birthDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm"
          onClick={() => navigate("/login")}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </form>
  );
}
