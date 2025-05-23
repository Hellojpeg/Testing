
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCheck, History, Trophy } from 'lucide-react';

interface PastHangoutsListProps {
  hangouts: string[];
}

export function PastHangoutsList({ hangouts }: PastHangoutsListProps) {
  return (
    <Card className="shadow-lg border-t-4 border-primary">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <Trophy className="w-7 h-7 text-primary" />
        <CardTitle className="text-2xl font-semibold tracking-tight">Past Adventures</CardTitle>
      </CardHeader>
      <CardContent>
        {hangouts.length === 0 ? (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hangouts marked as completed yet. <br/> Time to make some memories!</p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {hangouts.map((hangout, index) => (
              <li key={index} className="flex items-start p-3 bg-card border rounded-lg shadow-sm hover:bg-secondary/50 transition-colors">
                <CheckCheck className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-foreground">{hangout}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
