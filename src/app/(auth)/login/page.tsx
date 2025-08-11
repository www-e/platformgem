// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error === "CredentialsSignin") {
      setErrorMessage("معرف الملتحق أو رقم الهاتف أو كلمة المرور غير صحيحة.");
    } else if (error) {
      setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    }
  }, [error]);

  if (!errorMessage) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-3 rounded-md text-center">
      {errorMessage}
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      
      // Use signIn with redirect: false to handle the redirect manually
      const result = await signIn("credentials", {
        login: formData.get("login"),
        password: formData.get("password"),
        redirect: false
      });

      if (result?.error) {
        console.error('Login error:', result.error);
        setIsLoading(false);
        return;
      }

      // If login successful, get user session and redirect based on role
      console.log('Login successful, getting user session...');
      
      // Get the updated session to determine role-based redirect
      const session = await fetch('/api/auth/session').then(res => res.json());
      console.log('User session after login:', session);
      
      if (session?.user?.role) {
        // Import the redirect utility
        const { getRoleBasedRedirectUrl } = await import('@/lib/auth-redirects');
        const redirectUrl = getRoleBasedRedirectUrl(session.user.role);
        console.log('Redirecting to role-based URL:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        // Fallback to dashboard
        console.log('No role found, redirecting to dashboard');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Suspense>
      <AuroraBackground>
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary"><Sparkles className="w-8 h-8 text-primary" /></div></div>
              <CardTitle className="text-3xl text-foreground">مرحباً بعودتك</CardTitle>
              <CardDescription className="text-muted-foreground text-lg pt-2">ادخل بياناتك للوصول إلى دوراتك التعليمية.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorDisplay />
                <div className="space-y-2">
                  <Label htmlFor="login">معرف الملتحق أو رقم الهاتف</Label>
                  <Input id="login" name="login" type="text" placeholder="مثال: 12345 أو 010..." required className="h-12 bg-input/80 border-border/60 text-lg text-center" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required className="h-12 bg-input/80 border-border/60 text-lg text-center pr-12" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground btn-hover-effect" disabled={isLoading}>
                  {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>{isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}</span>
                </Button>
              </form>
              <div className="text-center pt-6"><p className="text-muted-foreground">ليس لديك حساب؟ <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline">إنشاء حساب جديد</Link></p></div>
            </CardContent>
          </Card>
        </div>
      </AuroraBackground>
    </Suspense>
  );
}