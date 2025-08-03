// src/components/admin/CategoryDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCategory, updateCategory } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Link, Image } from "lucide-react";
import { Category } from "@/lib/api/categories";

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          {isEdit ? "جاري التحديث..." : "جاري الإنشاء..."}
        </>
      ) : (
        <>
          {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isEdit ? "تحديث الفئة" : "إنشاء الفئة"}
        </>
      )}
    </Button>
  );
}

interface CategoryDialogProps {
  category?: Category;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CategoryDialog({
  category,
  trigger,
  onSuccess,
}: CategoryDialogProps) {
  const isEdit = !!category;
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEdit);

  // Create bound action for edit mode
  const boundUpdateAction = category
    ? updateCategory.bind(null, category.id)
    : null;

  const [state, dispatch] = useActionState(
    (prevState: any, formData: FormData) => createCourse(prevState, formData),
    undefined
  );

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/[ة]/g, "ه")
        .replace(/[ى]/g, "ي")
        .replace(/[^\u0600-\u06FF\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 50);
      setSlug(generatedSlug);
    }
  }, [name, autoGenerateSlug]);

  // Close dialog on success
  useEffect(() => {
    if (state?.success && isOpen) {
      setIsOpen(false);
      onSuccess?.();
      // Reset form for create mode
      if (!isEdit) {
        setName("");
        setSlug("");
        setAutoGenerateSlug(true);
      }
    }
  }, [state?.success, isOpen, isEdit, onSuccess]);

  const defaultTrigger = (
    <Button
      variant={isEdit ? "outline" : "default"}
      size={isEdit ? "sm" : "default"}
    >
      {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      {isEdit ? "تعديل" : "إضافة فئة جديدة"}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل الفئة" : "إنشاء فئة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل بيانات الفئة أدناه."
              : "أدخل بيانات الفئة الجديدة. ستتمكن من تنظيم الدورات تحت هذه الفئة."}
          </DialogDescription>
        </DialogHeader>

        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">اسم الفئة</Label>
            <Input
              id="category-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="التربية البدنية واللياقة"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">وصف الفئة</Label>
            <Textarea
              id="category-description"
              name="description"
              defaultValue={category?.description || ""}
              placeholder="دورات التربية البدنية واللياقة البدنية للمبتدئين والمتقدمين"
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category-slug">الرابط المختصر</Label>
              {!isEdit && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="auto-slug"
                    checked={autoGenerateSlug}
                    onCheckedChange={setAutoGenerateSlug}
                  />
                  <Label
                    htmlFor="auto-slug"
                    className="text-sm text-muted-foreground"
                  >
                    توليد تلقائي
                  </Label>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                id="category-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoGenerateSlug(false);
                }}
                placeholder="pt-fitness"
                required
                className="h-11 pl-10"
                dir="ltr"
                disabled={autoGenerateSlug && !isEdit}
              />
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              يُستخدم في الروابط. أحرف إنجليزية صغيرة وأرقام وشرطات فقط.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-icon">رابط الأيقونة (اختياري)</Label>
            <div className="relative">
              <Input
                id="category-icon"
                name="iconUrl"
                defaultValue={category?.iconUrl || ""}
                placeholder="https://example.com/icon.png"
                className="h-11 pl-10"
                dir="ltr"
                type="url"
              />
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="category-active"
                name="isActive"
                defaultChecked={category?.isActive}
              />
              <Label htmlFor="category-active">الفئة نشطة</Label>
            </div>
          )}

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
            <SubmitButton isEdit={isEdit} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
