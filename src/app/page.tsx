
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchHangoutSuggestionsAction } from '@/lib/actions';
import type { HangoutSuggestion } from '@/lib/types';
import { SuggestionList } from '@/components/suggestion-list';
import { PastHangoutsList } from '@/components/past-hangouts-list';
import { Spinner } from '@/components/ui/spinner';
import { Lightbulb, Bookmark, Wand2, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const MAX_PAST_HANGOUTS_FOR_AI = 5;

export default function HangoutHelperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<HangoutSuggestion[]>([]);
  const [savedSuggestions, setSavedSuggestions] = useState<HangoutSuggestion[]>([]);
  const [pastHangouts, setPastHangouts] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isClient, setIsClient] = useState(false); // For hydration fix

  const { toast } = useToast();

  // Load from localStorage on mount and set isClient to true
  useEffect(() => {
    setIsClient(true);
    try {
      const storedSaved = localStorage.getItem('hangoutHelper_savedSuggestions');
      if (storedSaved) {
        setSavedSuggestions(JSON.parse(storedSaved));
      }
      const storedPast = localStorage.getItem('hangoutHelper_pastHangouts');
      if (storedPast) {
        setPastHangouts(JSON.parse(storedPast));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      // Ensure toast is called only after mount if it relies on context/providers
      // This useEffect guarantees mount, so toast here should be safe.
      toast({ title: "Error", description: "Could not load saved data.", variant: "destructive" });
    }
  }, [toast]);

  // Save savedSuggestions to localStorage
  useEffect(() => {
    if (isClient) { // Only run on client
      try {
        localStorage.setItem('hangoutHelper_savedSuggestions', JSON.stringify(savedSuggestions));
      } catch (error) {
        console.error("Error saving to localStorage (savedSuggestions):", error);
      }
    }
  }, [savedSuggestions, isClient]);

  // Save pastHangouts to localStorage
  useEffect(() => {
    if (isClient) { // Only run on client
      try {
        localStorage.setItem('hangoutHelper_pastHangouts', JSON.stringify(pastHangouts));
      } catch (error) {
        console.error("Error saving to localStorage (pastHangouts):", error);
      }
    }
  }, [pastHangouts, isClient]);

  const handleGetSuggestions = useCallback(async () => {
    setIsLoading(true);
    setAiSuggestions([]); 
    try {
      // These values are generated on the client when the function is called.
      // This is fine as long as the function call itself is deferred past initial hydration
      // for any auto-triggered calls.
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const weather = "Pleasant, " + (Math.floor(Math.random() * 15) + 15) + "°C"; 
      const trendingSocialActivities = ["Local market exploration", "Park picnic", "New cafe visit", "Board game night", "Street art tour"].sort(() => 0.5 - Math.random()).slice(0,2).join(', ');
      
      const pastHangoutHistory = pastHangouts.slice(-MAX_PAST_HANGOUTS_FOR_AI).join('; ') || "None recently";

      const result = await fetchHangoutSuggestionsAction({
        currentTime,
        weather,
        trendingSocialActivities,
        pastHangoutHistory,
        userQuery: userQuery.trim() !== '' ? userQuery.trim() : undefined,
      });

      if (result.suggestions && result.suggestions.length > 0) {
        const newSuggestions = result.suggestions.map((text, index) => ({
          id: `ai-${Date.now()}-${index}`, // Date.now() here is fine as it's for a new ID post-interaction
          text,
          isSaved: savedSuggestions.some(s => s.text === text),
          hasHappened: false,
          createdAt: new Date().toISOString(),
        }));
        setAiSuggestions(newSuggestions);
        toast({ title: "Fresh Ideas!", description: `${newSuggestions.length} new hangout suggestions generated.` });
      } else {
        setAiSuggestions([]);
        toast({ title: "Hmm...", description: "No new suggestions at the moment. Try again!", variant: "default" });
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      toast({ title: "Error", description: "Could not fetch suggestions. Please try again.", variant: "destructive" });
      setAiSuggestions([]);
    }
    setIsLoading(false);
  }, [pastHangouts, savedSuggestions, toast, userQuery]);

  const handleToggleSave = useCallback((suggestionId: string) => {
    setAiSuggestions(prev => prev.map(s => {
      if (s.id === suggestionId) {
        const nowSaved = !s.isSaved;
        if (nowSaved) {
          setSavedSuggestions(currentSaved => {
            if (currentSaved.find(saved => saved.id === s.id)) return currentSaved; 
            return [{ ...s, isSaved: true }, ...currentSaved];
          });
        } else {
          setSavedSuggestions(currentSaved => currentSaved.filter(saved => saved.id !== s.id));
        }
        return { ...s, isSaved: nowSaved };
      }
      return s;
    }));
    
    setSavedSuggestions(prev => {
        const targetSuggestion = prev.find(s => s.id === suggestionId);
        if (targetSuggestion) { 
            // If it was saved and now we are unsaving, remove it.
            // If it wasn't saved and now we are saving, this logic is handled by the setAiSuggestions effect.
            // This specific block addresses removing from savedSuggestions if it was toggled off from an AI suggestion card
            // that was previously saved.
             if (targetSuggestion.isSaved === false) { // Explicitly check if it's marked as unsaved from AI list
                 return prev.filter(s => s.id !== suggestionId);
             }
        }
        // This handles removing a saved suggestion directly from the saved list
        const aiSuggestion = aiSuggestions.find(s => s.id === suggestionId);
        if (!aiSuggestion || !aiSuggestion.isSaved) {
             return prev.filter(s => s.id !== suggestionId);
        }
        return prev; 
    });

  }, [aiSuggestions]);

  const handleMarkAsHappened = useCallback((suggestionId: string) => {
    let suggestionText = "";

    const updateAndFindText = (s: HangoutSuggestion) => {
      if (s.id === suggestionId) {
        suggestionText = s.text;
        return { ...s, hasHappened: true, isSaved: false }; // Also unsave when marked as happened
      }
      return s;
    };
    
    setAiSuggestions(prev => prev.map(updateAndFindText));
    setSavedSuggestions(prev => prev.filter(s => s.id !== suggestionId)); 

    if (suggestionText && !pastHangouts.includes(suggestionText)) {
      setPastHangouts(prev => [suggestionText, ...prev].slice(0, 50)); // Limit past hangouts stored
      toast({ title: "Awesome!", description: `Marked "${suggestionText.substring(0,30)}..." as happened.`});
    }
  }, [pastHangouts, toast]);

  const handleDeleteSuggestion = useCallback((suggestionId: string) => {
    let deletedText = "";
    setAiSuggestions(prev => prev.filter(s => {
      if (s.id === suggestionId) deletedText = s.text;
      return s.id !== suggestionId;
    }));
    setSavedSuggestions(prev => prev.filter(s => {
      if (s.id === suggestionId && !deletedText) deletedText = s.text; // Ensure text is captured if deleted from saved list
      return s.id !== suggestionId;
    }));
    if (deletedText) {
        toast({ title: "Removed", description: `Suggestion "${deletedText.substring(0,30)}..." deleted.`, variant: "default" });
    }
  }, [toast]);

  // Fetch initial suggestions if everything is empty, only after client has mounted
  useEffect(() => {
    if (isClient) {
      if (aiSuggestions.length === 0 && savedSuggestions.length === 0 && pastHangouts.length === 0 && !isLoading) {
        handleGetSuggestions();
      }
    }
  }, [isClient, aiSuggestions.length, savedSuggestions.length, pastHangouts.length, handleGetSuggestions, isLoading]);


  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Wand2 className="mx-auto h-16 w-16 text-primary mb-4" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">Ready for an Adventure?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Let our AI help you discover exciting hangout ideas. <br/> Optionally, type a theme below, then hit the button!
        </p>
        <Input
          type="text"
          placeholder="e.g., 'something artsy' or 'a relaxing day out'"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="max-w-lg mx-auto mb-6 border-input focus:border-primary shadow-sm"
          aria-label="Custom adventure theme"
        />
        <Button size="lg" onClick={handleGetSuggestions} disabled={isLoading} className="min-w-[200px]">
          {isLoading ? <Spinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-5 w-5" />}
          {isLoading ? 'Conjuring Ideas...' : 'Get New Suggestions'}
        </Button>
      </section>

      <SuggestionList
        title="Fresh Ideas"
        suggestions={aiSuggestions.filter(s => !s.hasHappened)}
        onToggleSave={handleToggleSave}
        onMarkAsHappened={handleMarkAsHappened}
        onDelete={handleDeleteSuggestion}
        emptyStateMessage={isLoading && !aiSuggestions.length ? "Loading..." : "No new suggestions right now. Click the button above to generate some!"}
        icon={<Lightbulb className="w-8 h-8" />}
        isLoading={isLoading && !aiSuggestions.length} // Show skeletons only when loading and no suggestions yet
      />

      {isClient && savedSuggestions.filter(s => !s.hasHappened).length > 0 && (
        <>
          <Separator />
          <SuggestionList
            title="Saved for Later"
            suggestions={savedSuggestions.filter(s => !s.hasHappened)}
            onToggleSave={handleToggleSave} 
            onMarkAsHappened={handleMarkAsHappened}
            onDelete={handleDeleteSuggestion}
            emptyStateMessage="You haven't saved any suggestions yet. Find an idea you like and save it!"
            icon={<Bookmark className="w-8 h-8" />}
          />
        </>
      )}
      
      {isClient && (pastHangouts.length > 0 || aiSuggestions.some(s => s.hasHappened)) && (
         <>
          <Separator />
          <PastHangoutsList hangouts={[
              ...pastHangouts, 
              ...aiSuggestions.filter(s => s.hasHappened && !pastHangouts.includes(s.text)).map(s => s.text)
            ].filter((value, index, self) => self.indexOf(value) === index)} 
          />
         </>
      )}
    </div>
  );
}
