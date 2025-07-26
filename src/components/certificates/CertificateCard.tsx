// src/components/certificates/CertificateCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';
import { CertificateData } from '@/lib/certificate';
import { formatDate } from '@/lib/utils';

interface CertificateCardProps {
  certificate: CertificateData;
  onDownload?: (certificate: CertificateData) => void;
  onShare?: (certificate: CertificateData) => void;
}

export function CertificateCard({ 
  certificate, 
  onDownload, 
  onShare 
}: CertificateCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsLoading(true);
    try {
      await onDownload(certificate);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(certificate);
    }
  };

  const isExpired = certificate.validUntil && new Date(certificate.validUntil) < new Date();

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Certificate Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                شهادة إتمام الدورة
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                رمز الشهادة: {certificate.certificateCode}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isExpired ? (
              <Badge variant="destructive">منتهية الصلاحية</Badge>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                صالحة
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">{certificate.courseName}</p>
              <p className="text-sm text-muted-foreground">
                {certificate.courseCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">
                <span className="font-medium">المدرب:</span> {certificate.professorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">
                <span className="font-medium">تاريخ الإكمال:</span>{' '}
                {formatDate(certificate.completionDate)}
              </p>
            </div>
          </div>

          {certificate.validUntil && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">صالحة حتى:</span>{' '}
                  {formatDate(certificate.validUntil)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {certificate.totalLessons}
            </p>
            <p className="text-xs text-muted-foreground">درس</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {Math.round(certificate.courseDuration)}
            </p>
            <p className="text-xs text-muted-foreground">دقيقة</p>
          </div>
        </div>

        {certificate.finalScore && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                النتيجة النهائية
              </span>
              <span className="text-lg font-bold text-green-600">
                {certificate.finalScore.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex-1"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'جاري التحميل...' : 'تحميل الشهادة'}
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            مشاركة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}