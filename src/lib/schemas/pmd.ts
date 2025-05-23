
import { z } from 'zod';

export const GeneratePmdInputSchema = z.object({
  industry: z.string().min(1, { message: "Industry is required." }).describe("The specific industry for the project (e.g., Software Development, Construction, Healthcare, Marketing)."),
  projectTitle: z.string().min(1, { message: "Project title is required." }).describe("The title of the project."),
  projectGoal: z.string().min(1, { message: "Project goal is required." }).describe("The primary goal or objective of the project."),
  projectScope: z.string().min(1, { message: "Project scope is required." }).describe("A detailed description of what is included and excluded from the project."),
  keyStakeholders: z.string().min(1, { message: "Key stakeholders are required." }).describe("List of key stakeholders and their roles (e.g., Project Sponsor: John Doe, Product Owner: Jane Smith)."),
  timeline: z.string().optional().describe("Estimated project timeline or key milestones (e.g., Phase 1: 3 months, Beta Launch: Q4)."),
  budget: z.string().optional().describe("Estimated budget or financial constraints (e.g., $50,000, Resource-constrained)."),
  knownRisks: z.string().optional().describe("Any known risks or challenges for the project."),
  successMetrics: z.string().optional().describe("How will the success of this project be measured? (e.g., 20% increase in user engagement, On-time delivery within budget)."),
  additionalInfo: z.string().optional().describe("Any other relevant information or specific sections to include in the PMD."),
});
export type GeneratePmdInput = z.infer<typeof GeneratePmdInputSchema>;

export const GeneratePmdOutputSchema = z.object({
  pmdContent: z.string().describe("The full Project Management Document content, formatted in Markdown for readability and export."),
});
export type GeneratePmdOutput = z.infer<typeof GeneratePmdOutputSchema>;
