// src/components/student/StudentCertificates.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export function StudentCertificates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          الشهادات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          سيتم عرض شهاداتك المكتسبة هنا...
        </p>
      </CardContent>
    </Card>
  );
}