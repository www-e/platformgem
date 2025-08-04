// src/components/admin/course-management/ManagementHeader.tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ManagementHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">إدارة الدورات</h2>
        <p className="text-muted-foreground">
          إدارة محتوى الدورات والموافقة على النشر
        </p>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        إضافة دورة
      </Button>
    </div>
  );
}