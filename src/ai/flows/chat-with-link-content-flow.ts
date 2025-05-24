
'use server';
/**
 * @fileOverview AI flow for chatting about web page content (based on fetched HTML).
 *
 * - chatWithLinkContent - The main flow function.
 * - ChatWithLinkContentInput - Input type for the flow.
 * - ChatWithLinkContentOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Re-using ChatMessageSchema from other flows if applicable, or define locally if preferred
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatWithLinkContentInputSchema = z.object({
  pageHtmlContent: z.string().describe('The raw HTML content of the web page.'),
  userMessage: z.string().describe("The user's current message or question about the page content."),
  chatHistory: z.array(ChatMessageSchema).optional().describe('Previous messages in the conversation to maintain context.'),
});
export type ChatWithLinkContentInput = z.infer<typeof ChatWithLinkContentInputSchema>;

const ChatWithLinkContentOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's message, based on the page content."),
});
export type ChatWithLinkContentOutput = z.infer<typeof ChatWithLinkContentOutputSchema>;

export async function chatWithLinkContent(input: ChatWithLinkContentInput): Promise<ChatWithLinkContentOutput> {
  return chatWithLinkContentFlow(input);
}

const systemInstruction = `You are a helpful AI assistant. You have been provided with the raw HTML content of a web page.
Your task is to answer the user's questions based on the textual information found within this HTML.
Try to focus on the main readable content and ignore HTML tags, scripts, styles, and irrelevant metadata as much as possible.
If the HTML is too complex or the information isn't present, state that.
Be concise and helpful.`;

const prompt = ai.definePrompt({
  name: 'chatWithLinkContentPrompt',
  system: systemInstruction,
  input: { schema: ChatWithLinkContentInputSchema }, 
  output: { schema: ChatWithLinkContentOutputSchema }, 
  prompt: `Web Page HTML Context:
---
{{{pageHtmlContent}}}
---

Chat History:
{{#if chatHistory}}
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}
{{/if}}

User's latest message: {{{userMessage}}}

AI Response:`,
});


const chatWithLinkContentFlow = ai.defineFlow(
  {
    name: 'chatWithLinkContentFlow',
    inputSchema: ChatWithLinkContentInputSchema,
    outputSchema: ChatWithLinkContentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input); 

    if (!output || !output.aiResponse) {
      console.warn('Link chat flow received no valid output. Input user message was:', input.userMessage);
      return { aiResponse: "Sorry, I couldn't generate a response for this page content at this time." };
    }
    return output;
  }
);

    