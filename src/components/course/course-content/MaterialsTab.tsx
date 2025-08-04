// src/components/course/course-content/MaterialsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function MaterialsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          مواد الدورة
        </CardTitle>
        <CardDescription>
          الملفات والمواد المساعدة للدورة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">لا توجد مواد متاحة</h3>
          <p className="text-muted-foreground">
            لم يتم رفع أي مواد إضافية لهذه الدورة حتى الآن
          </p>
        </div>
      </CardContent>
    </Card>
  );
}