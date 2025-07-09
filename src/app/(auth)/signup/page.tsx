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
import { Eye, EyeOff, UserPlus, GraduationCap } from "lucide-react";
import { useState } from "react";
import { FloatingParticles } from "@/components/ui/floating-particles";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          جاري إنشاء الحساب...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          إنشاء حساب جديد
        </div>
      )}
    </Button>
  );
}

export default function SignupPage() {
  const [errorMessage, dispatch] = useActionState(signup, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Client-Only Floating Particles */}
      <FloatingParticles count={25} />

      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            انضم إلى المنصة وابدأ رحلتك التعليمية
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form action={dispatch} className="space-y-6">
            {/* Name and Student ID Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="أحمد محمد"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-white font-medium">
                  معرف الطالب
                </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="123456"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Phone Numbers Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-medium">
                  رقم هاتفك
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01012345678"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="text-white font-medium">
                  رقم هاتف ولي الأمر
                </Label>
                <Input
                  id="parentPhone"
                  name="parentPhone"
                  type="tel"
                  placeholder="01123456789"
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Grade Selection */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-white font-medium">
                الصف الدراسي
              </Label>
              <Select name="grade" required>
                <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm">
                  <SelectValue placeholder="اختر صفك الدراسي" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="FIRST_YEAR" className="text-white hover:bg-slate-700">
                    الصف الأول الثانوي
                  </SelectItem>
                  <SelectItem value="SECOND_YEAR" className="text-white hover:bg-slate-700">
                    الصف الثاني الثانوي
                  </SelectItem>
                  <SelectItem value="THIRD_YEAR" className="text-white hover:bg-slate-700">
                    الصف الثالث الثانوي
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm pr-12"
                  placeholder="أدخل كلمة مرور قوية"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                {errorMessage}
              </div>
            )}

            <SubmitButton />
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-4">
          <p className="text-gray-300">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="text-green-400 hover:text-green-300 font-semibold transition-colors hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
