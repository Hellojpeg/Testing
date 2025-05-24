
'use server';
/**
 * @fileOverview Generates detailed lesson plans based on user inputs and a comprehensive educational framework.
 *
 * - generateLessonPlan - A function that generates the lesson plan.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  AGE_SPECIFIC_FRAMEWORK, 
  BIBLICAL_INTEGRATION_PRINCIPLES, 
  LESSON_PLAN_MODELS_OVERVIEW,
  AGE_GROUPS,
  LESSON_FRAMEWORKS
} from '@/lib/educationalFramework';

const GenerateLessonPlanInputSchema = z.object({
  ageGroup: z.enum(AGE_GROUPS as [string, ...string[]], { errorMap: () => ({ message: "Please select a valid age group."}) }).describe("The target age group or grade level for the lesson plan."),
  lessonFramework: z.enum(LESSON_FRAMEWORKS as [string, ...string[]], { errorMap: () => ({ message: "Please select a valid lesson framework."}) }).describe("The pedagogical framework or model to structure the lesson plan around."),
  subjectTopic: z.string().min(3, { message: "Subject/Topic must be at least 3 characters." }).describe("The specific subject and topic for the lesson (e.g., 'Mathematics - Introduction to Fractions', 'History - The American Revolution')."),
  lessonDetailsOrPastedContent: z.string().optional().describe("Specific learning objectives, key concepts, activities, materials, or any pasted text from a document to be incorporated or used as context for the lesson plan."),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  lessonPlanMarkdown: z.string().describe("The full lesson plan content, formatted in Markdown for readability, export, and editing."),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const systemPrompt = `
You are an expert curriculum designer and master teacher, deeply familiar with classical education, Christian worldview integration, and various pedagogical models including 'Teach Like a Champion' principles. Your task is to generate a comprehensive, detailed, and practical lesson plan based on the user's specifications and the extensive educational framework provided below.

EDUCATIONAL FRAMEWORK CONTEXT:
${AGE_SPECIFIC_FRAMEWORK}
${BIBLICAL_INTEGRATION_PRINCIPLES}
${LESSON_PLAN_MODELS_OVERVIEW}

END OF EDUCATIONAL FRAMEWORK CONTEXT.

Now, using the user's request, create the lesson plan.

User's Request:
- Target Age Group: {{{ageGroup}}}
- Selected Lesson Framework: {{{lessonFramework}}}
- Subject/Topic: {{{subjectTopic}}}
{{#if lessonDetailsOrPastedContent}}- Key Objectives/Pasted Content/Additional Details: {{{lessonDetailsOrPastedContent}}}{{/if}}

Lesson Plan Requirements:
1.  **Format**: The entire output must be in Markdown. Use headings, lists, bold text, and other Markdown features for clarity and structure.
2.  **Header**: Start with a clear title for the lesson plan including the Subject/Topic and Age Group.
3.  **Core Sections**: Include the following sections, adapting them based on the selected framework and subject:
    *   **Lesson Objectives**: Clearly state what students will know or be able to do by the end of the lesson.
    *   **Materials**: List all necessary materials.
    *   **Vocabulary**: List key vocabulary terms with simple definitions suitable for the age group.
    *   **Detailed Lesson Procedure/Outline**: This is the core of the plan. Break it down into logical steps.
        *   Incorporate strategies from the selected '{{{lessonFramework}}}'.
        *   If 'Teach Like a Champion' principles are relevant to the chosen framework, implicitly or explicitly integrate applicable techniques (e.g., clear instructions, checks for understanding, engagement strategies).
        *   Provide estimated timings for activities if appropriate.
    *   **Teacher's Notes**: Include pedagogical insights, tips for delivery, guiding questions, and common misconceptions to watch out for.
        *   Crucially, integrate considerations for **504 Accommodations, IEP Supports, and Gifted Enrichment** relevant to the specified '{{{ageGroup}}}', drawing from the "Granular Framework by Age" provided in the context.
    *   **Biblical Integration**: Thoughtfully weave in relevant principles or scriptures from the "Biblical Integration Throughout" section or as appropriate to the topic and age group, aligning with the "Godly Foundation" for that age.
    *   **Assessment/Check for Understanding**: Describe how student learning will be assessed or checked throughout and at the end of the lesson.
    *   **Differentiated Instruction Notes (Summary)**: Briefly reiterate how 504, IEP, and Gifted needs are addressed.
4.  **STEM Subjects (Math, Physics, Chemistry)**: If the topic falls under these, provide clear, scaffolded explanations for complex concepts. Break down equations step-by-step if they are central to the lesson.
5.  **Tone**: Maintain a professional, encouraging, and clear tone suitable for an educator.
6.  **Practicality**: Ensure the lesson plan is actionable and could be used by a teacher in a real classroom setting.

Generate the lesson plan now.
`;

const lessonPlanGenerationPrompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: systemPrompt,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    const {output} = await lessonPlanGenerationPrompt(input);
    if (!output || !output.lessonPlanMarkdown) {
        return { lessonPlanMarkdown: "# Error\n\nCould not generate lesson plan content at this time. Please check your inputs or try again later. If the issue persists, the provided context might be too long or complex for the AI model's current limits." };
    }
    return output;
  }
);
