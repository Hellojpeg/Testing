
'use server';
/**
 * @fileOverview Generates meal suggestions based on ingredients and optional advanced criteria.
 *
 * - generateMealSuggestions - A function that generates meal suggestions.
 * - GenerateMealInput - The input type for the generateMealSuggestions function.
 * - GenerateMealOutput - The return type for the generateMealSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MacroNutrientsSchema = z.object({
  protein: z.number().optional().describe('Optional: Desired protein in grams.'),
  carbs: z.number().optional().describe('Optional: Desired carbohydrates in grams.'),
  fat: z.number().optional().describe('Optional: Desired fat in grams.'),
}).optional();

const GenerateMealInputSchema = z.object({
  ingredients: z.string().describe("A comma-separated list of available ingredients. This is the primary input."),
  isAdvancedMode: z.boolean().optional().describe("Indicates if advanced options are being used."),
  caloricGoal: z.number().optional().describe("Optional: Desired total calories for the meal (e.g., 500)."),
  macros: MacroNutrientsSchema.describe("Optional: Desired macronutrient breakdown in grams."),
  flavorPalette: z.string().optional().describe("Optional: Preferred flavor profile (e.g., spicy, savory, sweet, umami, sour)."),
  region: z.string().optional().describe("Optional: Preferred cuisine region or type (e.g., Italian, Mexican, Indian, Mediterranean)."),
  mealType: z.string().optional().describe("Optional: Type of meal (e.g., breakfast, lunch, dinner, snack, dessert)."),
});
export type GenerateMealInput = z.infer<typeof GenerateMealInputSchema>;

const MealSchema = z.object({
  name: z.string().describe("The name of the meal suggestion."),
  recipe: z.string().describe("A concise recipe or preparation steps for the meal. This should be detailed enough to be useful."),
  notes: z.string().optional().describe("Any additional notes, like why this meal fits the criteria or serving suggestions."),
});

const GenerateMealOutputSchema = z.object({
  meals: z.array(MealSchema).describe('An array of 1 to 3 meal suggestions.'),
});
export type GenerateMealOutput = z.infer<typeof GenerateMealOutputSchema>;

export async function generateMealSuggestions(input: GenerateMealInput): Promise<GenerateMealOutput> {
  return generateMealSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealSuggestionsPrompt',
  input: {schema: GenerateMealInputSchema},
  output: {schema: GenerateMealOutputSchema},
  prompt: `You are a creative and helpful culinary assistant. Your goal is to generate 1 to 3 meal suggestions based on the provided information.

Available Ingredients: {{{ingredients}}}

{{#if isAdvancedMode}}
Considering the following advanced preferences:
{{#if caloricGoal}} - Approximate Caloric Goal: {{{caloricGoal}}} calories{{/if}}
{{#if macros}}
  - Macronutrients:
    {{#if macros.protein}}   - Protein: around {{{macros.protein}}}g{{/if}}
    {{#if macros.carbs}}   - Carbohydrates: around {{{macros.carbs}}}g{{/if}}
    {{#if macros.fat}}   - Fat: around {{{macros.fat}}}g{{/if}}
{{/if}}
{{#if flavorPalette}} - Preferred Flavor Palette: {{{flavorPalette}}}{{/if}}
{{#if region}} - Preferred Region/Cuisine: {{{region}}}{{/if}}
{{#if mealType}} - Desired Meal Type: {{{mealType}}}{{/if}}
{{else}}
Please generate general meal ideas using the ingredients.
{{/if}}

Focus on primarily using the listed ingredients. You can assume common pantry staples like salt, pepper, basic spices, and oil are available if not specified.
Provide the meal name, a concise yet useful recipe, and any relevant notes (e.g., cooking tips, why it fits the criteria).
Generate 1 to 3 distinct meal suggestions.
`,
});

const generateMealSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateMealSuggestionsFlow',
    inputSchema: GenerateMealInputSchema,
    outputSchema: GenerateMealOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.meals) {
        return { meals: [] };
    }
    return output;
  }
);
