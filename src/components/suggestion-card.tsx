
'use client';

import type { HangoutSuggestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, CheckCircle, Trash2, ThumbsUp, CalendarClock, Gift, Search, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { fetchScavengerHuntAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';

interface SuggestionCardProps {
  suggestion: HangoutSuggestion;
  onToggleSave: (id: string) => void;
  onMarkAsHappened: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SuggestionCard({ suggestion, onToggleSave, onMarkAsHappened, onDelete }: SuggestionCardProps) {
  const timeAgo = formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true });
  const [scavengerHuntSteps, setScavengerHuntSteps] = useState<string[] | null>(null);
  const [isGeneratingHunt, setIsGeneratingHunt] = useState(false);
  const { toast } = useToast();

  const handleGenerateScavengerHunt = useCallback(async () => {
    setIsGeneratingHunt(true);
    setScavengerHuntSteps(null);
    try {
      const result = await fetchScavengerHuntAction({ suggestionText: suggestion.text });
      if (result.steps && result.steps.length > 0) {
        setScavengerHuntSteps(result.steps);
        toast({ title: "Scavenger Hunt Ready!", description: "Your adventure awaits." });
      } else {
        toast({ title: "Hmm...", description: "Could not generate scavenger hunt steps.", variant: "default" });
      }
    } catch (error) {
      console.error("Failed to generate scavenger hunt:", error);
      toast({ title: "Error", description: "Could not create scavenger hunt. Please try again.", variant: "destructive" });
    }
    setIsGeneratingHunt(false);
  }, [suggestion.text, toast]);

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
        <p className="text-lg text-foreground mb-3">{suggestion.text}</p>
        {isGeneratingHunt && (
          <div className="my-4 p-3 bg-muted/50 rounded-md flex items-center justify-center">
            <Spinner size="sm" className="mr-2" />
            <p className="text-sm text-muted-foreground">Creating your hunt...</p>
          </div>
        )}
        {scavengerHuntSteps && scavengerHuntSteps.length > 0 && (
          <div className="my-4 p-4 bg-accent/30 rounded-lg border border-accent">
            <div className="flex items-center mb-2">
              <ListChecks className="w-5 h-5 mr-2 text-primary" />
              <h4 className="font-semibold text-primary">Scavenger Hunt:</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground pl-1">
              {scavengerHuntSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 p-4 border-t bg-background/50">
        {!suggestion.hasHappened && (
            <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateScavengerHunt}
                disabled={isGeneratingHunt}
                aria-label="Create scavenger hunt"
                className="w-full"
            >
                {isGeneratingHunt ? <Spinner size="sm" className="mr-2" /> : <Gift className="mr-2 h-4 w-4" />}
                {isGeneratingHunt ? 'Brewing Hunt...' : 'Create Scavenger Hunt'}
            </Button>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-2">
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
        </div>
      </CardFooter>
    </Card>
  );
}
