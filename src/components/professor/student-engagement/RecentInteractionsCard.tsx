// src/components/professor/student-engagement/RecentInteractionsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { getInteractionTypeText, formatTimeAgo } from '@/lib/engagement-utils';
import type { RecentInteraction } from '@/hooks/useStudentEngagement';

interface RecentInteractionsCardProps {
  interactions: RecentInteraction[];
}

export function RecentInteractionsCard({ interactions }: RecentInteractionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          التفاعلات الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                interaction.needsResponse ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <MessageSquare className={`h-5 w-5 ${
                  interaction.needsResponse ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{interaction.studentName}</p>
                  <Badge variant={interaction.needsResponse ? 'destructive' : 'secondary'} className="text-xs">
                    {getInteractionTypeText(interaction.type)}
                  </Badge>
                  {interaction.needsResponse && (
                    <Badge variant="outline" className="text-xs text-red-600">
                      يحتاج رد
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">{interaction.courseName}</p>
                <p className="text-sm">{interaction.content}</p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-2">
                  {formatTimeAgo(interaction.timestamp)}
                </p>
                {interaction.needsResponse && (
                  <Button size="sm" variant="outline">
                    رد
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}