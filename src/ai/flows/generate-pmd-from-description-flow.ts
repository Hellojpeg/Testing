
'use server';
/**
 * @fileOverview Generates a Project Management Document (PMD) based on a free-form user description.
 *
 * - generatePmdFromDescription - A function that generates the PMD from a description.
 * - GeneratePmdFromDescriptionInput - The input type. (Imported from @/lib/schemas/pmd)
 * - GeneratePmdFromDescriptionOutput - The return type. (Imported from @/lib/schemas/pmd)
 */

import {ai} from '@/ai/genkit';
import { 
  GeneratePmdFromDescriptionInputSchema, 
  type GeneratePmdFromDescriptionInput, 
  GeneratePmdFromDescriptionOutputSchema,
  type GeneratePmdFromDescriptionOutput 
} from '@/lib/schemas/pmd';

// Export types for external use, as per Genkit guidelines
export type { GeneratePmdFromDescriptionInput, GeneratePmdFromDescriptionOutput };


export async function generatePmdFromDescription(input: GeneratePmdFromDescriptionInput): Promise<GeneratePmdFromDescriptionOutput> {
  return generatePmdFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePmdFromDescriptionPrompt',
  input: {schema: GeneratePmdFromDescriptionInputSchema},
  output: {schema: GeneratePmdFromDescriptionOutputSchema},
  prompt: `You are an expert project manager with extensive experience creating comprehensive Project Management Documents (PMDs) across various industries.
Your task is to generate a detailed PMD based on the following user-provided description of their project, product, vision, problem, or solution.
You will need to infer standard PMD sections such as Introduction, Goals, Scope (In-Scope/Out-of-Scope), Stakeholders, potential Timeline considerations, possible Budget implications, Risk Assessment, and Success Metrics based on the description.
The PMD must follow best practices and be structured in Markdown.

User's Description:
{{{description}}}

Please generate a PMD that includes, but is not limited to, the following standard sections (adapt and expand as appropriate for the given description):
1.  **Introduction / Executive Summary:** Brief overview derived from the description.
2.  **Project Goals and Objectives:** Clearly defined, measurable goals inferred from the description.
3.  **Scope Statement:**
    *   **In-Scope:** Detailed list of deliverables and work based on the description.
    *   **Out-of-Scope:** Explicitly state what might be reasonably considered out of scope.
4.  **Stakeholder Analysis:** Identify potential key stakeholders and their likely roles.
5.  **Project Timeline / Milestones:** Suggest key phases or milestones if inferable.
6.  **Budget and Resource Allocation:** General considerations based on the project type.
7.  **Risk Assessment and Mitigation Plan:** Identify potential risks based on common project challenges and the description.
8.  **Success Metrics / KPIs:** How project success could be measured.
9.  **Communication Plan:** (General statement if not inferable)
10. **Project Closure:** (General statement if not inferable)

Use clear headings, bullet points, and concise language. The entire output should be a single Markdown document.
Focus on generating a practical and professional PMD. If certain information is not clearly inferable, make reasonable assumptions or state that further details are needed.
`,
});

const generatePmdFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePmdFromDescriptionFlow',
    inputSchema: GeneratePmdFromDescriptionInputSchema,
    outputSchema: GeneratePmdFromDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.pmdContent) {
        return { pmdContent: "Could not generate PMD content from the description. Please try providing more details or try again later." };
    }
    return output;
  }
);
