// src/components/certificates/CertificateGenerator.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Loader2
} from 'lucide-react';
import { CertificateData } from '@/lib/certificate';

interface CertificateGeneratorProps {
  courseId: string;
  courseName: string;
  completionRate: number;
  onCertificateGenerated?: (certificate: CertificateData) => void;
}

interface EligibilityData {
  eligible: boolean;
  reason?: string;
  completionRate: number;
  requiredRate: number;
}

export function CertificateGenerator({
  courseId,
  courseName,
  completionRate,
  onCertificateGenerated
}: CertificateGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/certificates/generate?courseId=${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في التحقق من الأهلية');
      }

      setEligibility(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء الشهادة');
      }

      setCertificate(data.certificate);
      if (onCertificateGenerated) {
        onCertificateGenerated(data.certificate);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    
    // Create a simple certificate download (you can enhance this with PDF generation)
    const certificateText = `
شهادة إتمام الدورة

هذا يشهد أن ${certificate.studentName}
قد أكمل بنجاح دورة: ${certificate.courseName}
في تاريخ: ${new Date(certificate.completionDate).toLocaleDateString('ar-SA')}

المدرب: ${certificate.professorName}
التصنيف: ${certificate.courseCategory}
رمز الشهادة: ${certificate.certificateCode}

${certificate.finalScore ? `النتيجة النهائية: ${certificate.finalScore}%` : ''}
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

  // If certificate already generated, show it
  if (certificate) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="h-5 w-5" />
            تم إنشاء الشهادة بنجاح!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2">تفاصيل الشهادة</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">رمز الشهادة:</span> {certificate.certificateCode}</p>
              <p><span className="font-medium">الدورة:</span> {certificate.courseName}</p>
              <p><span className="font-medium">تاريخ الإكمال:</span> {new Date(certificate.completionDate).toLocaleDateString('ar-SA')}</p>
              {certificate.finalScore && (
                <p><span className="font-medium">النتيجة:</span> {certificate.finalScore}%</p>
              )}
            </div>
          </div>
          
          <Button onClick={downloadCertificate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            تحميل الشهادة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          شهادة إتمام الدورة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Display */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>التقدم في الدورة</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            يتطلب إكمال 90% من الدورة للحصول على الشهادة
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Eligibility Display */}
        {eligibility && (
          <Alert variant={eligibility.eligible ? "default" : "destructive"}>
            {eligibility.eligible ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {eligibility.eligible 
                ? 'مؤهل للحصول على الشهادة!' 
                : eligibility.reason || 'غير مؤهل للحصول على الشهادة'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!eligibility ? (
            <Button 
              onClick={checkEligibility} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              التحقق من الأهلية
            </Button>
          ) : eligibility.eligible ? (
            <Button 
              onClick={generateCertificate} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              إنشاء الشهادة
            </Button>
          ) : (
            <Button disabled className="w-full">
              غير مؤهل للشهادة
            </Button>
          )}
        </div>

        {/* Requirements Info */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">متطلبات الحصول على الشهادة:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• إكمال 90% على الأقل من دروس الدورة</li>
            <li>• مشاهدة جميع الفيديوهات المطلوبة</li>
            <li>• إنهاء جميع الأنشطة والتقييمات</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}