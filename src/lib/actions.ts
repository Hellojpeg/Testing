
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';
import { generateScavengerHunt, type GenerateScavengerHuntInput, type GenerateScavengerHuntOutput } from '@/ai/flows/generate-scavenger-hunt-flow';
import { generateMealSuggestions, type GenerateMealInput, type GenerateMealOutput } from '@/ai/flows/generate-meal-flow';
import { generatePmd, type GeneratePmdInput as GenerateStructuredPmdInput, type GeneratePmdOutput as GenerateStructuredPmdOutput } from '@/ai/flows/generate-pmd-flow';
import { generatePmdFromDescription, type GeneratePmdFromDescriptionInput, type GeneratePmdFromDescriptionOutput } from '@/ai/flows/generate-pmd-from-description-flow';

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

// This action uses the original structured PMD flow. It's kept for potential future use
// but the UI will primarily use fetchPmdFromDescriptionAction for the "Generate with AI" path.
export async function fetchPmdAction(
  input: GenerateStructuredPmdInput
): Promise<GenerateStructuredPmdOutput> {
  try {
    const result = await generatePmd(input);
    return result;
  } catch (error) {
    console.error('Error generating PMD (structured):', error);
    return { pmdContent: "Error: Could not connect to the AI service to generate the PMD using structured input. Please try again later." };
  }
}

export async function fetchPmdFromDescriptionAction(
  input: GeneratePmdFromDescriptionInput
): Promise<GeneratePmdFromDescriptionOutput> {
  try {
    const result = await generatePmdFromDescription(input);
    return result;
  } catch (error) {
    console.error('Error generating PMD from description:', error);
    return { pmdContent: "Error: Could not connect to the AI service to generate the PMD from your description. Please try again later." };
  }
}
