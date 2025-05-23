
'use server';
/**
 * @fileOverview Generates hangout suggestions based on various factors.
 *
 * - generateHangoutSuggestions - A function that generates hangout suggestions.
 * - GenerateHangoutSuggestionsInput - The input type for the generateHangoutSuggestions function.
 * - GenerateHangoutSuggestionsOutput - The return type for the generateHangoutSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHangoutSuggestionsInputSchema = z.object({
  currentTime: z.string().describe('The current time.'),
  weather: z.string().describe('The current weather conditions.'),
  trendingSocialActivities: z.string().describe('Trending social activities.'),
  pastHangoutHistory: z.string().describe('The user\'s past hangout history.'),
  userQuery: z.string().optional().describe('A specific request or theme for the hangout suggestions from the user.'),
});
export type GenerateHangoutSuggestionsInput = z.infer<typeof GenerateHangoutSuggestionsInputSchema>;

const GenerateHangoutSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of hangout suggestions.'),
});
export type GenerateHangoutSuggestionsOutput = z.infer<typeof GenerateHangoutSuggestionsOutputSchema>;

export async function generateHangoutSuggestions(input: GenerateHangoutSuggestionsInput): Promise<GenerateHangoutSuggestionsOutput> {
  return generateHangoutSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHangoutSuggestionsPrompt',
  input: {schema: GenerateHangoutSuggestionsInputSchema},
  output: {schema: GenerateHangoutSuggestionsOutputSchema},
  prompt: `Suggest some hangout ideas based on the following information:
{{#if userQuery}}
User's specific request: {{{userQuery}}}
{{/if}}
Current Time: {{{currentTime}}}
Weather: {{{weather}}}
Trending Social Activities: {{{trendingSocialActivities}}}
Past Hangout History: {{{pastHangoutHistory}}}

Suggestions:`,
});

const generateHangoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateHangoutSuggestionsFlow',
    inputSchema: GenerateHangoutSuggestionsInputSchema,
    outputSchema: GenerateHangoutSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
