import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        setError('email', { 
          type: 'manual',
          message: 'Hibás email cím vagy jelszó'
        });
        return; // Ne dobjuk el a hibát, csak térjünk vissza
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError('email', { 
        type: 'manual',
        message: 'Váratlan hiba történt a bejelentkezés során'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <div>
          <Label htmlFor="email">Email cím</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email", { required: "Az email cím megadása kötelező" })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Jelszó</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password", { required: "A jelszó megadása kötelező" })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}
        </Button>
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm"
          onClick={() => navigate("/register")}
        >
          Nincs még fiókja? Regisztráljon!
        </Button>
      </div>
    </form>
  );
}
