
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';
import { generateScavengerHunt, type GenerateScavengerHuntInput, type GenerateScavengerHuntOutput } from '@/ai/flows/generate-scavenger-hunt-flow';

export async function fetchHangoutSuggestionsAction(
  input: GenerateHangoutSuggestionsInput
): Promise<GenerateHangoutSuggestionsOutput> {
  try {
    const suggestions = await generateHangoutSuggestions(input);
    return suggestions;
  } catch (error) {
    console.error('Error fetching hangout suggestions:', error);
    return { suggestions: [] }; 
  }
}

export async function fetchScavengerHuntAction(
  input: GenerateScavengerHuntInput
): Promise<GenerateScavengerHuntOutput> {
  try {
    const hunt = await generateScavengerHunt(input);
    return hunt;
  } catch (error) {
    console.error('Error fetching scavenger hunt:', error);
    return { steps: ["Sorry, couldn't generate a scavenger hunt right now. Please try again."] };
  }
}
