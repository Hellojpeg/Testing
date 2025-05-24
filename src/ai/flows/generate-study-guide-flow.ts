
'use server';
/**
 * @fileOverview Generates a deep study guide, flashcards, definitions, and practice questions from source content.
 *
 * - generateStudyGuide - A function that handles the study guide generation.
 * - GenerateStudyGuideInput - The input type for the generateStudyGuide function.
 * - GenerateStudyGuideOutput - The return type for the generateStudyGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyGuideInputSchema = z.object({
  sourceContent: z.string().min(50, { message: "Source content must be at least 50 characters." }).describe("The source text content to generate the study guide from."),
});
export type GenerateStudyGuideInput = z.infer<typeof GenerateStudyGuideInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe("The front of the flashcard (question, term, or concept)."),
  answer: z.string().describe("The back of the flashcard (answer, definition, or explanation)."),
});

const DefinitionSchema = z.object({
  term: z.string().describe("The key term extracted from the content."),
  definition: z.string().describe("A clear and concise definition of the term."),
});

const PracticeQuestionSchema = z.object({
  questionText: z.string().describe("The text of the practice question."),
  questionType: z.string().optional().describe("The type of question (e.g., 'Multiple Choice', 'Short Answer', 'Essay Prompt', 'Fill-in-the-blank')."),
  // For multiple choice, options could be a string like "A) Option1 B) Option2..." or an array if more structure is needed later.
  options: z.string().optional().describe("For multiple-choice questions, provide the options. Format as a single string: A) Opt1 B) Opt2 C) Opt3 D) Opt4"),
  correctAnswer: z.string().optional().describe("The correct answer, or an indication of where to find it in the study guide."),
});

const GenerateStudyGuideOutputSchema = z.object({
  studyGuideMarkdown: z.string().describe("The comprehensive study guide content in Markdown format. This should include summaries, key concepts, explanations, and be well-structured."),
  flashcards: z.array(FlashcardSchema).describe("An array of at least 5-10 flashcards based on the most important concepts."),
  definitions: z.array(DefinitionSchema).describe("An array of at least 5-10 key terms and their definitions from the content."),
  practiceQuestions: z.array(PracticeQuestionSchema).describe("An array of at least 3-5 practice questions covering various aspects of the content. Include different types if possible."),
});
export type GenerateStudyGuideOutput = z.infer<typeof GenerateStudyGuideOutputSchema>;


export async function generateStudyGuide(input: GenerateStudyGuideInput): Promise<GenerateStudyGuideOutput> {
  return generateStudyGuideFlow(input);
}

const systemPrompt = `
You are an expert instructional designer and subject matter expert tasked with creating a comprehensive study package from provided source material.
Your goal is to help someone deeply understand and master the content.

Source Material:
{{{sourceContent}}}

Based on the Source Material, generate the following components:

1.  **Study Guide (Markdown)**:
    *   This should be a well-structured, detailed guide in Markdown format.
    *   Include:
        *   A brief introduction or overview of the material.
        *   Key concepts and main ideas, clearly explained.
        *   Summaries of important sections.
        *   Elaboration on complex topics.
        *   Use headings, bullet points, bold text, and other Markdown features for clarity and readability.
        *   If applicable, include examples or analogies to aid understanding.

2.  **Flashcards**:
    *   Generate 5-10 flashcards covering the most critical information, terms, or concepts.
    *   Each flashcard should have a clear 'question' (front) and 'answer' (back).

3.  **Definitions**:
    *   Identify 5-10 key vocabulary terms or jargon from the source material.
    *   Provide concise and accurate definitions for each term.

4.  **Practice Questions**:
    *   Create 3-5 diverse practice questions that test understanding of the material.
    *   Aim for a mix of question types if appropriate (e.g., conceptual, application-based). If you create multiple-choice questions, provide the options (A, B, C, D) and the correct answer.
    *   Specify the question type (e.g., "Short Answer", "Multiple Choice", "Essay Prompt").

Ensure all generated content is directly derived from and accurately reflects the provided Source Material.
Structure your entire response according to the 'GenerateStudyGuideOutputSchema'.
`;

const studyGuideGenerationPrompt = ai.definePrompt({
  name: 'generateStudyGuidePrompt',
  input: {schema: GenerateStudyGuideInputSchema},
  output: {schema: GenerateStudyGuideOutputSchema},
  prompt: systemPrompt,
   config: { // Add safety settings to be less restrictive for educational content
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', 
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', 
      },
    ],
  },
});

const generateStudyGuideFlow = ai.defineFlow(
  {
    name: 'generateStudyGuideFlow',
    inputSchema: GenerateStudyGuideInputSchema,
    outputSchema: GenerateStudyGuideOutputSchema,
  },
  async (input) => {
    const {output} = await studyGuideGenerationPrompt(input);
    if (!output) {
        // This case should ideally be handled by Zod schema validation if output is truly empty or malformed.
        // However, if the AI returns a non-null but empty-looking object matching the schema, this check is needed.
        return { 
            studyGuideMarkdown: "# Error\n\nCould not generate study guide content at this time.",
            flashcards: [],
            definitions: [],
            practiceQuestions: []
        };
    }
    // Ensure all parts of the output are present, even if empty arrays, to match schema
    return {
        studyGuideMarkdown: output.studyGuideMarkdown || "# Error\n\nStudy guide content was not generated.",
        flashcards: output.flashcards || [],
        definitions: output.definitions || [],
        practiceQuestions: output.practiceQuestions || []
    };
  }
);
