import React from "react";
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
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch("/api/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to check user existence.");
      }

      const { exists } = await response.json();
      return exists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("Checking if email already exists...");

      const userExists = await checkUserExists(data.email);
      if (userExists) {
        alert("A regisztráció már folyamatban van. Kérlek, erősítsd meg az e-mail címed!");
        return;
      }

      console.log("Email is available, proceeding with registration...");

      // 🔹 Regisztráció Supabase Auth API-val
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            birthDate: data.birthDate,
          },
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        alert(signUpError.message);
        return;
      }

      alert("Sikeres regisztráció! Kérlek, ellenőrizd az e-mail fiókodat és erősítsd meg a regisztrációdat.");
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      alert("Váratlan hiba történt a regisztráció során.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <div>
          <Label htmlFor="name">Teljes név</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name", { required: "A név megadása kötelező" })}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">E-mail cím</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email", { required: "Az e-mail megadása kötelező" })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Jelszó</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "A jelszó megadása kötelező",
              minLength: { value: 8, message: "A jelszónak legalább 8 karakter hosszúnak kell lennie" },
            })}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="birthDate">Születési dátum</Label>
          <Input
            id="birthDate"
            type="date"
            {...register("birthDate", { required: "A születési dátum megadása kötelező" })}
          />
          {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Regisztráció folyamatban..." : "Regisztráció"}
        </Button>
      </div>

      <div className="text-center">
        <Button type="button" variant="link" className="text-sm" onClick={() => navigate("/login")}>
          Már van fiókod? Jelentkezz be!
        </Button>
      </div>
    </form>
  );
}
