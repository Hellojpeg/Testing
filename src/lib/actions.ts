
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';
import { generateScavengerHunt, type GenerateScavengerHuntInput, type GenerateScavengerHuntOutput } from '@/ai/flows/generate-scavenger-hunt-flow';
import { generateMealSuggestions, type GenerateMealInput, type GenerateMealOutput } from '@/ai/flows/generate-meal-flow';
import { generatePmd, type GeneratePmdInput, type GeneratePmdOutput } from '@/ai/flows/generate-pmd-flow';

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

export async function fetchMealSuggestionsAction(
  input: GenerateMealInput
): Promise<GenerateMealOutput> {
  try {
    const result = await generateMealSuggestions(input);
    return result;
  } catch (error) {
    console.error('Error fetching meal suggestions:', error);
    // Consider more specific error handling or logging
    return { meals: [] };
  }
}

export async function fetchPmdAction(
  input: GeneratePmdInput
): Promise<GeneratePmdOutput> {
  try {
    const result = await generatePmd(input);
    return result;
  } catch (error) {
    console.error('Error generating PMD:', error);
    return { pmdContent: "Error: Could not connect to the AI service to generate the PMD. Please try again later." };
  }
}
