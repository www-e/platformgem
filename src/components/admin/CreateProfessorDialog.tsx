// src/components/admin/CreateProfessorDialog.tsx
"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProfessor } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Eye, EyeOff } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          جاري الإنشاء...
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          إنشاء حساب الأستاذ
        </>
      )}
    </Button>
  );
}

export function CreateProfessorDialog() {
  const [state, dispatch] = useActionState(createProfessor, undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Close dialog on success
  if (state?.success && isOpen) {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4" />
          إضافة أستاذ جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إنشاء حساب أستاذ جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات الأستاذ الجديد. سيتمكن من إنشاء وإدارة الدورات التعليمية.
          </DialogDescription>
        </DialogHeader>

        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prof-name">الاسم الكامل</Label>
            <Input 
              id="prof-name" 
              name="name" 
              placeholder="د. أحمد محمد" 
              required 
              className="h-11" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prof-phone">رقم الهاتف</Label>
              <Input 
                id="prof-phone" 
                name="phone" 
                type="tel" 
                placeholder="01012345678" 
                required 
                className="h-11" 
                dir="ltr" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prof-email">البريد الإلكتروني</Label>
              <Input 
                id="prof-email" 
                name="email" 
                type="email" 
                placeholder="professor@example.com" 
                className="h-11" 
                dir="ltr" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-bio">نبذة تعريفية</Label>
            <Textarea 
              id="prof-bio" 
              name="bio" 
              placeholder="أستاذ في التربية البدنية مع خبرة 10 سنوات..." 
              className="min-h-[80px]" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-expertise">مجالات الخبرة</Label>
            <Input 
              id="prof-expertise" 
              name="expertise" 
              placeholder="التربية البدنية, التغذية, السباحة" 
              className="h-11" 
            />
            <p className="text-sm text-muted-foreground">
              اكتب المجالات مفصولة بفواصل
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-password">كلمة المرور</Label>
            <div className="relative">
              <Input 
                id="prof-password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="h-11 pr-12" 
                placeholder="كلمة مرور قوية (8 أحرف على الأقل)" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-md">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md">
              {state.success}
            </div>
          )}

          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}