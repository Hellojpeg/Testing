
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';
import { generateScavengerHunt, type GenerateScavengerHuntInput, type GenerateScavengerHuntOutput } from '@/ai/flows/generate-scavenger-hunt-flow';
import { generateMealSuggestions, type GenerateMealInput, type GenerateMealOutput } from '@/ai/flows/generate-meal-flow';
import { generatePmd, type GeneratePmdInput as GenerateStructuredPmdInput, type GeneratePmdOutput as GenerateStructuredPmdOutput } from '@/ai/flows/generate-pmd-flow';
import { generatePmdFromDescription, type GeneratePmdFromDescriptionInput, type GeneratePmdFromDescriptionOutput } from '@/ai/flows/generate-pmd-from-description-flow';
import { chatWithYoutubeVideo, type ChatWithYoutubeVideoInput, type ChatWithYoutubeVideoOutput } from '@/ai/flows/chat-with-youtube-video-flow';

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

export async function fetchYoutubeChatResponseAction(
  input: ChatWithYoutubeVideoInput
): Promise<ChatWithYoutubeVideoOutput> {
  try {
    // In a real app, you might have a separate step here to fetch/process the youtubeUrl
    // For now, the videoTranscript is expected to be passed in directly (e.g., placeholder or user-supplied)
    const result = await chatWithYoutubeVideo(input);
    return result;
  } catch (error) {
    console.error('Error fetching YouTube chat response:', error);
    return { aiResponse: "Sorry, an error occurred while trying to get a response. Please try again." };
  }
}
