// src/components/profile/ExamHistory.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Target } from "lucide-react";
import { JsonValue } from "@prisma/client/runtime/library";

interface ExamHistoryProps {
  examHistory: JsonValue;
}

export default function ExamHistory({ examHistory }: ExamHistoryProps) {
  const exams = Array.isArray(examHistory) ? examHistory : [];

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardCheck className="w-6 h-6 text-primary" />
          <span>نتائج الإمتحانات</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exams.length > 0 ? (
            exams.map((exam: any, index: number) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                </div>
                <span className="text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{exam.score}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Target className="mx-auto w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">لا توجد نتائج امتحانات مسجلة.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}