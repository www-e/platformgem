// src/components/admin/student-detail/EnrollmentList.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface EnrollmentListProps {
  enrollments: any[];
}

export function EnrollmentList({ enrollments }: EnrollmentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الدورات المسجل بها ({enrollments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={enrollment.course.thumbnailUrl}
                  alt={enrollment.course.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{enrollment.course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    الأستاذ: {enrollment.course.professor.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>التقدم: {enrollment.progressPercent}%</span>
                    <span>
                      وقت المشاهدة: {Math.round(enrollment.totalWatchTime / 60)}{" "}
                      دقيقة
                    </span>
                    <span>
                      تاريخ التسجيل:{" "}
                      {new Date(enrollment.enrolledAt).toLocaleDateString(
                        "ar-SA"
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {enrollment.course.price != null ? (
                    <p className="font-semibold">
                      {formatCurrency(enrollment.course.price)}
                    </p>
                  ) : (
                    <Badge variant="outline">مجاني</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لم يسجل في أي دورات بعد</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
