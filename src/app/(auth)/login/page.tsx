// src/app/(auth)/login/page.tsx

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(login, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-cream">
      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-brand-dark-blue">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-brand-mid-blue">
            Enter your credentials to access your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Student ID or Phone Number</Label>
              <Input
                id="login"
                name="login"
                type="text"
                placeholder="e.g., 12345 or 010..."
                required
                className="bg-brand-cream"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-brand-cream"
              />
            </div>
            {errorMessage && (
              <div className="text-sm font-medium text-red-500">
                {errorMessage}
              </div>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
