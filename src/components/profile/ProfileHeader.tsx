// src/components/profile/ProfileHeader.tsx
import { Award, BookMarked, User } from "lucide-react";
import { UserRole } from "@prisma/client"; // Add this import at the top

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">
              Welcome, {name}
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's a summary of your educational journey.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Academic Level</p>
          <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1">
          <Award className="w-5 h-5 text-yellow-400" /> {role === 'STUDENT' ? 'Enrolled' : role}
          </p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Enrolled Courses</p>
          <p className="font-semibold text-foreground flex items-center justify-center gap-2 pt-1">
            <BookMarked className="w-5 h-5 text-green-400" /> {enrollmentCount} Courses
          </p>
        </div>
      </div>
    </header>
  );
}