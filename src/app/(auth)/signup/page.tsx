// src/app/(auth)/signup/page.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signupStudent } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, GraduationCap } from "lucide-react";
import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background"; // Import new background

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground btn-hover-effect"
      disabled={pending}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></div>
          <span>جاري إنشاء الحساب...</span>
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          <span>إنشاء حساب جديد</span>
        </>
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [errorMessage, dispatch] = useActionState(signupStudent, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuroraBackground showRadialGradient={false}>
      <div className="relative z-10 w-full max-w-lg px-4 py-20">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center border-2 border-secondary">
                <GraduationCap className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-muted-foreground text-lg pt-2">
              انضم إلى المنصة وابدأ رحلتك التعليمية.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={dispatch} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" name="name" placeholder="أحمد محمد" required className="h-11 bg-input/80 border-border/60" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم هاتفك</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="01012345678" required className="h-11 bg-input/80 border-border/60" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                    <Input id="email" name="email" type="email" placeholder="ahmed@example.com" className="h-11 bg-input/80 border-border/60" dir="ltr" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">معرف الطالب (اختياري)</Label>
                    <Input id="studentId" name="studentId" placeholder="123456" className="h-11 bg-input/80 border-border/60" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">رقم هاتف ولي الأمر (اختياري)</Label>
                    <Input id="parentPhone" name="parentPhone" type="tel" placeholder="01123456789" className="h-11 bg-input/80 border-border/60" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} required className="h-11 bg-input/80 border-border/60 pr-12" placeholder="أدخل كلمة مرور قوية" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {errorMessage?.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-md">
                  {errorMessage.error}
                </div>
              )}
              {errorMessage?.success && (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md">
                  {errorMessage.success}
                </div>
              )}

              <div className="pt-4">
                <SubmitButton />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pt-6">
            <p className="text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-secondary hover:text-secondary/80 font-semibold transition-colors hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </AuroraBackground>
  );
}