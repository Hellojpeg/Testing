
'use server';
/**
 * @fileOverview AI flow for chatting about YouTube video content (based on a transcript).
 *
 * - chatWithYoutubeVideo - The main flow function.
 * - ChatWithYoutubeVideoInput - Input type for the flow.
 * - ChatWithYoutubeVideoOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Made schema definition local (removed export)
const ChatWithYoutubeVideoInputSchema = z.object({
  videoTranscript: z.string().describe('The transcript or textual content of the YouTube video.'),
  userMessage: z.string().describe("The user's current message or question."),
  chatHistory: z.array(ChatMessageSchema).optional().describe('Previous messages in the conversation to maintain context.'),
});
export type ChatWithYoutubeVideoInput = z.infer<typeof ChatWithYoutubeVideoInputSchema>;

// Made schema definition local (removed export)
const ChatWithYoutubeVideoOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's message."),
});
export type ChatWithYoutubeVideoOutput = z.infer<typeof ChatWithYoutubeVideoOutputSchema>;

export async function chatWithYoutubeVideo(input: ChatWithYoutubeVideoInput): Promise<ChatWithYoutubeVideoOutput> {
  return chatWithYoutubeVideoFlow(input);
}

const systemInstruction = `You are a helpful AI assistant designed to answer questions about a YouTube video based on its provided transcript.
The user will give you a transcript and then ask questions. Use the transcript as your primary source of information.
If the question cannot be answered from the transcript, say that the information is not available in the video content provided.
Be concise and helpful.`;

const prompt = ai.definePrompt({
  name: 'chatWithYoutubeVideoPrompt',
  system: systemInstruction,
  input: { schema: ChatWithYoutubeVideoInputSchema }, // Uses local schema
  output: { schema: ChatWithYoutubeVideoOutputSchema }, // Uses local schema
  prompt: `Video Transcript Context:
---
{{{videoTranscript}}}
---

Chat History:
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if (eq this.role "user")}}User: {{this.content}}{{/if}}
    {{#if (eq this.role "model")}}AI: {{this.content}}{{/if}}
  {{/each}}
{{else}}
No previous messages.
{{/if}}

User's latest message: {{{userMessage}}}

AI Response:`,
});


const chatWithYoutubeVideoFlow = ai.defineFlow(
  {
    name: 'chatWithYoutubeVideoFlow',
    inputSchema: ChatWithYoutubeVideoInputSchema,   // Uses local schema
    outputSchema: ChatWithYoutubeVideoOutputSchema, // Uses local schema
  },
  async (input) => {
    // Construct the prompt for Gemini, including history if available
    const historyForGemini = input.chatHistory?.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    })) || [];

    // This specific request structure isn't directly used by ai.definePrompt when a system prompt and template are defined.
    // The input 'input' is passed directly to the prompt function.
    // Keeping this commented out as it might have been for a direct model.generateContent call.
    // const generateRequest = {
    //     prompt: `Video Transcript Context:\n---\n${input.videoTranscript}\n---\n\nUser's latest message: ${input.userMessage}`,
    //     history: historyForGemini, // Pass history correctly
    //     config: { // Example: Lower temperature for more factual answers from transcript
    //         temperature: 0.3,
    //     },
    // };
    
    const {output} = await prompt(input); // Use the defined prompt object

    if (!output || !output.aiResponse) {
      return { aiResponse: "Sorry, I couldn't generate a response at this time." };
    }
    return output;
  }
);
