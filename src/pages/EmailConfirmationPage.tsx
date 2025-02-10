import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function EmailConfirmationPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sikeres megerősítés!</CardTitle>
          <CardDescription>Az email címed sikeresen megerősítve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/login">Bejelentkezés</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}