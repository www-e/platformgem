// src/components/profile/ProfileHeader.tsx
import { Award, BookMarked, Library, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client"; // Add this import at the top

const gradeMap = {
  FIRST_YEAR: "الصف الأول الثانوي",
  SECOND_YEAR: "الصف الثاني الثانوي",
  THIRD_YEAR: "الصف الثالث الثانوي",
};

interface ProfileHeaderProps {
  name: string;
  role: UserRole; // Add role
  enrollmentCount: number;
}

export default function ProfileHeader({ name, role, enrollmentCount }: ProfileHeaderProps) {
  return (
    <header className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              مرحباً، {name}
            </h1>
            <p className="text-lg text-muted-foreground">
              هنا ملخص رحلتك التعليمية.
            </p>
          </div>
        </div>
        <Button asChild className="btn-hover-effect shrink-0">
          <Link href="/dashboard">
            <Library className="ml-2 h-5 w-5" />
            تصفح جميع الدورات
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">مرحلتك الدراسية</p>
          <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1">
          <Award className="w-5 h-5 text-yellow-400" /> {role === 'STUDENT' ? 'طالب' : role}
          </p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">الدورات المسجلة</p>
          <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1">
            <BookMarked className="w-5 h-5 text-green-400" /> {enrollmentCount} دورات
          </p>
        </div>
      </div>
    </header>
  );
}