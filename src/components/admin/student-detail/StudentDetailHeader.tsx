// src/components/admin/student-detail/StudentDetailHeader.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, XCircle, CheckCircle, Trash2 } from 'lucide-react';

interface StudentDetailHeaderProps {
  student: {
    name: string;
    studentId: string | null;
    isActive: boolean;
    createdAt: Date;
  };
  onToggleStatus: () => void;
  onDelete: () => void;
}

export function StudentDetailHeader({
  student,
  onToggleStatus,
  onDelete,
}: StudentDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {student.name}
          {student.isActive ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              نشط
            </Badge>
          ) : (
            <Badge variant="destructive">غير نشط</Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          معرف الطالب: {student.studentId || 'غير محدد'} | تاريخ التسجيل:{' '}
          {new Date(student.createdAt).toLocaleDateString('ar-SA')}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            إجراءات
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleStatus}>
            {student.isActive ? (
              <>
                <XCircle className="h-4 w-4 ml-2" />
                <span>إلغاء التفعيل</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 ml-2" />
                <span>تفعيل</span>
              </>
            )}
          </DropdownMenuItem>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onSelect={(e: React.SyntheticEvent) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                <span>حذف الطالب</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الطالب وجميع بياناته بشكل نهائي. هذا الإجراء لا يمكن
                  التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}