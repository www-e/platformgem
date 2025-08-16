import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton for the "Quick Access" card
export function QuickAccessCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

// Skeleton for the "Enrolled Courses" list
export function EnrolledCoursesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Skeleton for the "My Certificates" card
export function MyCertificatesSkeleton() {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

// Skeleton for the "Exam History" card
export function ExamHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}