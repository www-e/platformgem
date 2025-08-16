import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full mb-2" />
            <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Card>
            <CardContent className="p-6">
                <Skeleton className="h-7 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}