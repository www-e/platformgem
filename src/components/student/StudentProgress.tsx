// src/components/student/StudentProgress.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function StudentProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          تقدم التعلم
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          سيتم إضافة تفاصيل تقدم التعلم قريباً...
        </p>
      </CardContent>
    </Card>
  );
}