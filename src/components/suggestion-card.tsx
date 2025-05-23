
'use client';

import type { HangoutSuggestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, CheckCircle, Trash2, ThumbsUp, CalendarClock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: HangoutSuggestion;
  onToggleSave: (id: string) => void;
  onMarkAsHappened: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SuggestionCard({ suggestion, onToggleSave, onMarkAsHappened, onDelete }: SuggestionCardProps) {
  const timeAgo = formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true });

  return (
    <Card className={cn(
        "w-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col",
        suggestion.hasHappened && "opacity-70 bg-secondary/30"
      )}>
      <CardHeader className="pb-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarClock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          Suggested {timeAgo}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-lg text-foreground">{suggestion.text}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 p-4 border-t bg-background/50">
        {!suggestion.hasHappened && (
          <Button
            variant={suggestion.isSaved ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSave(suggestion.id)}
            aria-label={suggestion.isSaved ? "Unsave suggestion" : "Save suggestion"}
            className={cn(suggestion.isSaved && "bg-accent text-accent-foreground hover:bg-accent/90")}
          >
            <Heart className={cn("mr-2 h-4 w-4", suggestion.isSaved ? 'fill-accent-foreground' : '')} />
            {suggestion.isSaved ? 'Saved' : 'Save'}
          </Button>
        )}
        {!suggestion.hasHappened && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAsHappened(suggestion.id)}
            aria-label="Mark as happened"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Did It!
          </Button>
        )}
        {suggestion.hasHappened && (
           <Badge variant="outline" className="border-green-500 text-green-600 font-medium">
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Completed!
          </Badge>
        )}
         <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(suggestion.id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete suggestion"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
      </CardFooter>
    </Card>
  );
}
