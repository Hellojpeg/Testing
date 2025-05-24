
'use server';

import { generateHangoutSuggestions, type GenerateHangoutSuggestionsInput, type GenerateHangoutSuggestionsOutput } from '@/ai/flows/generate-hangout-suggestions';
import { generateScavengerHunt, type GenerateScavengerHuntInput, type GenerateScavengerHuntOutput } from '@/ai/flows/generate-scavenger-hunt-flow';
import { generateMealSuggestions, type GenerateMealInput, type GenerateMealOutput } from '@/ai/flows/generate-meal-flow';
import { generatePmd, type GeneratePmdInput as GenerateStructuredPmdInput, type GeneratePmdOutput as GenerateStructuredPmdOutput } from '@/ai/flows/generate-pmd-flow';
import { generatePmdFromDescription, type GeneratePmdFromDescriptionInput, type GeneratePmdFromDescriptionOutput } from '@/ai/flows/generate-pmd-from-description-flow';
import { chatWithYoutubeVideo, type ChatWithYoutubeVideoInput, type ChatWithYoutubeVideoOutput } from '@/ai/flows/chat-with-youtube-video-flow';
import { YoutubeTranscript } from 'youtube-transcript';
import { generateLessonPlan, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan-flow';
import { generateStudyGuide, type GenerateStudyGuideInput, type GenerateStudyGuideOutput } from '@/ai/flows/generate-study-guide-flow';
import { chatWithLinkContent, type ChatWithLinkContentInput, type ChatWithLinkContentOutput } from '@/ai/flows/chat-with-link-content-flow';

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

export async function getVideoTranscriptAction(
  videoUrl: string
): Promise<{ transcript?: string; error?: string }> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
    if (!transcriptItems || transcriptItems.length === 0) {
      return { error: 'No transcript found for this video, or the video is private/unavailable.' };
    }
    const transcriptText = transcriptItems.map((item) => item.text).join(' ');
    return { transcript: transcriptText };
  } catch (error: any) {
    console.error(`Error fetching transcript for ${videoUrl}:`, error);
    if (error.message && error.message.includes('subtitles are disabled')) {
        return { error: 'Subtitles are disabled for this video. A transcript cannot be fetched.' };
    }
    if (error.message && error.message.includes('video is private')) {
        return { error: 'This video is private. A transcript cannot be fetched.'};
    }
    return { error: 'Could not fetch transcript. The video might not have one, or an unexpected error occurred.' };
  }
}

export async function fetchYoutubeChatResponseAction(
  input: ChatWithYoutubeVideoInput
): Promise<ChatWithYoutubeVideoOutput> {
  try {
    const result = await chatWithYoutubeVideo(input);
    return result;
  } catch (error) {
    console.error('Error fetching YouTube chat response:', error);
    return { aiResponse: "Sorry, an error occurred while trying to get a response. Please try again." };
  }
}

export async function fetchLessonPlanAction(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput> {
  try {
    const result = await generateLessonPlan(input);
    return result;
  } catch (error) {
    console.error('Error fetching lesson plan:', error);
    // Provide a more informative error message if possible
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { lessonPlanMarkdown: `# Error Generating Lesson Plan\n\nAn error occurred: ${errorMessage}\n\nPlease try again. If the problem persists, the content or request might be too complex for the AI model.` };
  }
}

export async function fetchStudyGuideAction(
  input: GenerateStudyGuideInput
): Promise<GenerateStudyGuideOutput> {
  try {
    const result = await generateStudyGuide(input);
    return result;
  } catch (error) {
    console.error('Error generating study guide:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { 
      studyGuideMarkdown: `# Error Generating Study Guide\n\nAn error occurred: ${errorMessage}\n\nPlease try again. If the problem persists, the content or request might be too complex for the AI model.`,
      flashcards: [],
      definitions: [],
      practiceQuestions: []
    };
  }
}

// Actions for Link Chat App
export async function fetchLinkContentAction(
  url: string
): Promise<{ content?: string; title?: string; error?: string }> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'LinkChatApp/1.0' } }); // Basic User-Agent
    if (!response.ok) {
      return { error: `Failed to fetch URL: ${response.status} ${response.statusText}` };
    }
    const htmlContent = await response.text();
    
    // Basic title extraction (can be improved)
    let titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : url;

    return { content: htmlContent, title: title };
  } catch (error: any) {
    console.error(`Error fetching content from ${url}:`, error);
    return { error: `Could not fetch content from the URL. Error: ${error.message}` };
  }
}

export async function fetchLinkChatResponseAction(
  input: ChatWithLinkContentInput
): Promise<ChatWithLinkContentOutput> {
  try {
    const result = await chatWithLinkContent(input);
    return result;
  } catch (error) {
    console.error('Error fetching Link Chat response:', error);
    return { aiResponse: "Sorry, an error occurred while trying to get a response for this link. Please try again." };
  }
}

    