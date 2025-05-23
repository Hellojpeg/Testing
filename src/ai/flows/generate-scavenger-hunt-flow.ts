'use server';
/**
 * @fileOverview Generates a scavenger hunt based on a suggestion.
 *
 * - generateScavengerHunt - A function that generates scavenger hunt steps.
 * - GenerateScavengerHuntInput - The input type for the generateScavengerHunt function.
 * - GenerateScavengerHuntOutput - The return type for the generateScavengerHunt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScavengerHuntInputSchema = z.object({
  suggestionText: z.string().describe('The hangout suggestion text to base the scavenger hunt on.'),
});
export type GenerateScavengerHuntInput = z.infer<typeof GenerateScavengerHuntInputSchema>;

const GenerateScavengerHuntOutputSchema = z.object({
  steps: z.array(z.string()).describe('An array of scavenger hunt steps.'),
});
export type GenerateScavengerHuntOutput = z.infer<typeof GenerateScavengerHuntOutputSchema>;

export async function generateScavengerHunt(input: GenerateScavengerHuntInput): Promise<GenerateScavengerHuntOutput> {
  return generateScavengerHuntFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScavengerHuntPrompt',
  input: {schema: GenerateScavengerHuntInputSchema},
  output: {schema: GenerateScavengerHuntOutputSchema},
  prompt: `Based on the following hangout suggestion, create a fun and engaging scavenger hunt with 3-5 steps.
The steps should be creative and directly related to the suggestion.

Hangout Suggestion: {{{suggestionText}}}

Scavenger Hunt Steps:`,
});

const generateScavengerHuntFlow = ai.defineFlow(
  {
    name: 'generateScavengerHuntFlow',
    inputSchema: GenerateScavengerHuntInputSchema,
    outputSchema: GenerateScavengerHuntOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        return { steps: ["Could not generate scavenger hunt steps at this time. Please try again later."] };
    }
    return output;
  }
);
