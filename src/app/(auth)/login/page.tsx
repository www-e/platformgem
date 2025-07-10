// src/app/(auth)/login/page.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background"; // Import new background

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground btn-hover-effect"
      disabled={pending}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          <span>جاري تسجيل الدخول...</span>
        </>
      ) : (
        <>
          <LogIn className="w-5 h-5" />
          <span>تسجيل الدخول</span>
        </>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [errorState, dispatch] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (errorState?.error) {
      toast.error("فشل تسجيل الدخول", { description: errorState.error });
    }
  }, [errorState]);

  return (
    <AuroraBackground>
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl text-foreground">مرحباً بعودتك</CardTitle>
            <CardDescription className="text-muted-foreground text-lg pt-2">
              ادخل بياناتك للوصول إلى دوراتك التعليمية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login">معرف الطالب أو رقم الهاتف</Label>
                <Input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="مثال: 12345 أو 010..."
                  required
                  className="h-12 bg-input/80 border-border/60 text-lg text-center"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-12 bg-input/80 border-border/60 text-lg text-center pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <SubmitButton />
            </form>
            <div className="text-center pt-6">
              <p className="text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}