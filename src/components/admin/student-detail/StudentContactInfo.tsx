// src/components/admin/student-detail/StudentContactInfo.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar } from 'lucide-react';

interface StudentContactInfoProps {
  student: {
    email: string | null;
    phone: string;
    createdAt: Date;
  };
}

/**
 * Renders a card displaying the student's contact information.
 */
export function StudentContactInfo({ student }: StudentContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">
                {student.email || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone Number</p>
              <p className="text-muted-foreground" dir="ltr">
                {student.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Registration Date</p>
              <p className="text-muted-foreground">
                {new Date(student.createdAt).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}