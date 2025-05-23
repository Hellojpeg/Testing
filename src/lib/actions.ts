
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';

export async function fetchHangoutSuggestionsAction(
  input: GenerateHangoutSuggestionsInput
): Promise<GenerateHangoutSuggestionsOutput> {
  try {
    // The AI flow already has input validation with Zod, so no need to re-validate here.
    const suggestions = await generateHangoutSuggestions(input);
    return suggestions;
  } catch (error) {
    console.error('Error fetching hangout suggestions:', error);
    // In a real app, you might want to throw a more specific error or handle it differently.
    return { suggestions: [] }; // Return empty on error to prevent crash, UI should handle this.
  }
}
