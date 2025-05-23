
'use server';
/**
 * @fileOverview Generates a Project Management Document (PMD) based on user inputs.
 *
 * - generatePmd - A function that generates the PMD.
 * - GeneratePmdInput - The input type for the generatePmd function. (Imported from @/lib/schemas/pmd)
 * - GeneratePmdOutput - The return type for the generatePmd function. (Imported from @/lib/schemas/pmd)
 */

import {ai} from '@/ai/genkit';
import { 
  GeneratePmdInputSchema, 
  GeneratePmdOutputSchema,
  type GeneratePmdInput, 
  type GeneratePmdOutput 
} from '@/lib/schemas/pmd';

// Export types for external use, as per Genkit guidelines
export type { GeneratePmdInput, GeneratePmdOutput };

export async function generatePmd(input: GeneratePmdInput): Promise<GeneratePmdOutput> {
  return generatePmdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePmdPrompt',
  input: {schema: GeneratePmdInputSchema},
  output: {schema: GeneratePmdOutputSchema},
  prompt: `You are an expert project manager with extensive experience creating comprehensive Project Management Documents (PMDs) across various industries.
Your task is to generate a detailed PMD based on the provided project information.
The PMD must follow best practices and be structured in Markdown.

Key Information Provided:
- Industry: {{{industry}}}
- Project Title: {{{projectTitle}}}
- Project Goal: {{{projectGoal}}}
- Project Scope: {{{projectScope}}}
- Key Stakeholders: {{{keyStakeholders}}}
{{#if timeline}}- Timeline: {{{timeline}}}{{/if}}
{{#if budget}}- Budget: {{{budget}}}{{/if}}
{{#if knownRisks}}- Known Risks: {{{knownRisks}}}{{/if}}
{{#if successMetrics}}- Success Metrics: {{{successMetrics}}}{{/if}}
{{#if additionalInfo}}- Additional Information/Sections: {{{additionalInfo}}}{{/if}}

Please generate a PMD that includes, but is not limited to, the following standard sections (adapt and expand as appropriate for the given industry and project details):
1.  **Introduction / Executive Summary:** Brief overview of the project.
2.  **Project Goals and Objectives:** Clearly defined, measurable goals.
3.  **Scope Statement:**
    *   **In-Scope:** Detailed list of deliverables and work.
    *   **Out-of-Scope:** Explicitly state what is not included.
4.  **Stakeholder Analysis:** Identify key stakeholders, their roles, responsibilities, and interests.
5.  **Project Timeline / Milestones:** Key phases, activities, and deadlines.
6.  **Budget and Resource Allocation:** Estimated costs, resource requirements (human, financial, material).
7.  **Risk Assessment and Mitigation Plan:** Identify potential risks (technical, operational, market, etc.) and strategies to mitigate them.
8.  **Success Metrics / KPIs:** How project success will be measured.
9.  **Communication Plan:** How information will be shared among stakeholders.
10. **Quality Management Plan:** (If applicable) How quality will be ensured.
11. **Deployment/Implementation Plan:** (If applicable)
12. **Project Closure:** Criteria for project completion.

Use clear headings, bullet points, and concise language. The entire output should be a single Markdown document.
Focus on generating a practical and professional PMD.
If certain information (like timeline or budget) is not provided, acknowledge that it needs to be defined but still create a placeholder or a general statement for that section.
`,
});

const generatePmdFlow = ai.defineFlow(
  {
    name: 'generatePmdFlow',
    inputSchema: GeneratePmdInputSchema,
    outputSchema: GeneratePmdOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.pmdContent) {
        return { pmdContent: "Could not generate PMD content at this time. Please check your inputs or try again later." };
    }
    return output;
  }
);
