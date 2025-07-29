// src/app/certificates/verify/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search,
  Award,
  User,
  BookOpen,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import { CertificateData } from '@/lib/certificate';
import { formatDate } from '@/lib/utils';

export default function CertificateVerificationPage() {
  const [certificateCode, setCertificateCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const verifyCertificate = async () => {
    if (!certificateCode.trim()) {
      setError('يرجى إدخال رمز الشهادة');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCertificate(null);
    setIsValid(null);

    try {
      const response = await fetch(`/api/certificates/verify?code=${encodeURIComponent(certificateCode.trim())}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setCertificate(data.certificate);
        setIsValid(true);
      } else {
        setError(data.error || 'شهادة غير صالحة');
        setIsValid(false);
      }
    } catch {
      setError('خطأ في التحقق من الشهادة');
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCertificate();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">التحقق من صحة الشهادة</h1>
        <p className="text-muted-foreground">
          أدخل رمز الشهادة للتحقق من صحتها وصلاحيتها
        </p>
      </div>

      {/* Verification Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث عن الشهادة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificateCode">رمز الشهادة</Label>
            <Input
              id="certificateCode"
              placeholder="مثال: CERT-ABC123-XYZ789"
              value={certificateCode}
              onChange={(e) => setCertificateCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center font-mono"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك العثور على رمز الشهادة في أعلى الشهادة الأصلية
            </p>
          </div>

          <Button 
            onClick={verifyCertificate} 
            disabled={isLoading || !certificateCode.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            التحقق من الشهادة
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Invalid Certificate */}
      {isValid === false && !error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            الشهادة غير صالحة أو غير موجودة
          </AlertDescription>
        </Alert>
      )}

      {/* Valid Certificate Display */}
      {certificate && isValid && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              شهادة صالحة ومعتمدة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Certificate Badge */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-100">
                <Award className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">اسم الطالب</p>
                    <p className="text-lg font-bold text-green-800">
                      {certificate.studentName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">اسم الدورة</p>
                    <p className="text-lg font-bold">
                      {certificate.courseName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {certificate.courseCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">المدرب</p>
                    <p className="text-lg font-semibold">
                      {certificate.professorName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">تاريخ الإكمال</p>
                    <p className="text-lg font-semibold">
                      {formatDate(certificate.completionDate)}
                    </p>
                  </div>
                </div>

                {certificate.validUntil && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">صالحة حتى</p>
                      <p className="text-lg font-semibold">
                        {formatDate(certificate.validUntil)}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.finalScore && (
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="font-medium text-green-800">النتيجة النهائية</p>
                    <p className="text-2xl font-bold text-green-600">
                      {certificate.finalScore.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Statistics */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-green-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {certificate.totalLessons}
                </p>
                <p className="text-sm text-muted-foreground">درس مكتمل</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(certificate.courseDuration)}
                </p>
                <p className="text-sm text-muted-foreground">دقيقة تدريب</p>
              </div>
            </div>

            {/* Certificate Code */}
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <p className="font-medium text-center text-green-800">
                رمز الشهادة: {certificate.certificateCode}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>معلومات مهمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• جميع الشهادات الصادرة من منصتنا معتمدة ومؤرخة</p>
            <p>• يمكن التحقق من صحة أي شهادة باستخدام الرمز الفريد</p>
            <p>• الشهادات صالحة لمدة سنتين من تاريخ الإصدار</p>
            <p>• في حالة وجود أي استفسار، يرجى التواصل مع فريق الدعم</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}