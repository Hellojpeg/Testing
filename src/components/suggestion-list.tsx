
'use client';

import type { HangoutSuggestion } from '@/lib/types';
import { SuggestionCard } from './suggestion-card';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface SuggestionListProps {
  title: string;
  suggestions: HangoutSuggestion[];
  onToggleSave: (id: string) => void;
  onMarkAsHappened: (id: string) => void;
  onDelete: (id: string) => void;
  emptyStateMessage: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function SuggestionList({ title, suggestions, onToggleSave, onMarkAsHappened, onDelete, emptyStateMessage, icon, isLoading = false }: SuggestionListProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full shadow-md">
              <CardContent className="p-6 h-48 animate-pulse bg-muted rounded-lg"></CardContent>
            </Card>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-10 px-6 ">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{emptyStateMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onToggleSave={onToggleSave}
              onMarkAsHappened={onMarkAsHappened}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
