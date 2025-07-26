// src/components/profile/MyCertificates.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CertificateCard } from '@/components/certificates/CertificateCard';
import { 
  Award, 
  Download, 
  Share2, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CertificateData } from '@/lib/certificate';
import Link from 'next/link';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates/my-certificates');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحميل الشهادات');
      }

      setCertificates(data.certificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCertificate = (certificate: CertificateData) => {
    // Create a simple text certificate (you can enhance this with PDF generation)
    const certificateText = `
شهادة إتمام الدورة

هذا يشهد أن ${certificate.studentName}
قد أكمل بنجاح دورة: ${certificate.courseName}
في تاريخ: ${new Date(certificate.completionDate).toLocaleDateString('ar-SA')}

المدرب: ${certificate.professorName}
التصنيف: ${certificate.courseCategory}
رمز الشهادة: ${certificate.certificateCode}

${certificate.finalScore ? `النتيجة النهائية: ${certificate.finalScore}%` : ''}

للتحقق من صحة هذه الشهادة، يرجى زيارة:
${window.location.origin}/certificates/verify
    `;

    const blob = new Blob([certificateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificate.certificateCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareCertificate = (certificate: CertificateData) => {
    const shareText = `حصلت على شهادة إتمام دورة "${certificate.courseName}" من منصتنا التعليمية!\\n\\nرمز الشهادة: ${certificate.certificateCode}\\n\\nيمكنك التحقق من صحة الشهادة على: ${window.location.origin}/certificates/verify`;
    
    if (navigator.share) {
      navigator.share({
        title: 'شهادة إتمام الدورة',
        text: shareText,
        url: `${window.location.origin}/certificates/verify?code=${certificate.certificateCode}`
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('تم نسخ رابط الشهادة إلى الحافظة');
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            شهاداتي
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري تحميل الشهادات...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            شهاداتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            شهاداتي ({certificates.length})
          </CardTitle>
          
          <Link href="/certificates/verify">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              التحقق من شهادة
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="font-semibold mb-2">لا توجد شهادات بعد</h3>
            <p className="text-muted-foreground text-sm mb-4">
              أكمل دوراتك للحصول على الشهادات
            </p>
            <p className="text-xs text-muted-foreground">
              يتطلب إكمال 90% من الدورة للحصول على الشهادة
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onDownload={handleDownloadCertificate}
                onShare={handleShareCertificate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}