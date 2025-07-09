// src/app/(auth)/signup/page.tsx

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signup } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating Account..." : "Create Account"}
    </Button>
  );
}

export default function SignupPage() {
  const [errorMessage, dispatch] = useActionState(signup, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-brand-cream">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-brand-dark-blue">
            Create an Account
          </CardTitle>
          <CardDescription className="text-brand-mid-blue">
            Join the platform to start learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="bg-brand-cream"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="123456"
                  required
                  className="bg-brand-cream"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="010..."
                  required
                  className="bg-brand-cream"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent’s Phone Number</Label>
                <Input
                  id="parentPhone"
                  name="parentPhone"
                  type="tel"
                  placeholder="011..."
                  required
                  className="bg-brand-cream"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select name="grade" required>
                <SelectTrigger className="w-full bg-brand-cream">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST_YEAR">الصف الأول الثانوي</SelectItem>
                  <SelectItem value="SECOND_YEAR">الصف الثاني الثانوي</SelectItem>
                  <SelectItem value="THIRD_YEAR">الصف الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
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
        <CardFooter className="flex justify-center">
          <p className="text-sm text-brand-mid-blue">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-dark-blue hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
