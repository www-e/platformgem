// src/components/admin/student-detail/CertificateList.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Eye } from 'lucide-react';

interface CertificateListProps {
  certificates: any[];
}

export function CertificateList({ certificates }: CertificateListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الشهادات ({certificates.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificates.length > 0 ? (
            certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{certificate.course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    رمز الشهادة: {certificate.certificateCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    تاريخ الإصدار:{' '}
                    {new Date(certificate.issuedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      certificate.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                  >
                    {certificate.status === 'ACTIVE' ? 'نشطة' : 'غير نشطة'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 ml-1" />
                    عرض
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد شهادات</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}