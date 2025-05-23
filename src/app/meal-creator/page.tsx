
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchMealSuggestionsAction } from '@/lib/actions';
import type { MealRecipe, GenerateMealInput } from '@/lib/types'; // Assuming GenerateMealInput might be moved to types or defined here
import { Spinner } from '@/components/ui/spinner';
import { ChefHat, Sparkles, Settings2, Utensils } from 'lucide-react';

// If GenerateMealInput is not in types.ts, define it here or import from flow
// For now, let's assume it might be imported or defined based on src/ai/flows/generate-meal-flow.ts
// type GenerateMealInput = {
//   ingredients: string;
//   isAdvancedMode?: boolean;
//   caloricGoal?: number;
//   macros?: { protein?: number; carbs?: number; fat?: number };
//   flavorPalette?: string;
//   region?: string;
//   mealType?: string;
// };


export default function MealCreatorPage() {
  const [ingredients, setIngredients] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [caloricGoal, setCaloricGoal] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [flavorPalette, setFlavorPalette] = useState('');
  const [region, setRegion] = useState('');
  const [mealType, setMealType] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [mealSuggestions, setMealSuggestions] = useState<MealRecipe[]>([]);
  const { toast } = useToast();

  const handleGenerateMeals = useCallback(async () => {
    if (!ingredients.trim()) {
      toast({
        title: 'Ingredients needed!',
        description: 'Please list some ingredients to get started.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setMealSuggestions([]);

    const input: GenerateMealInput = {
      ingredients: ingredients.trim(),
      isAdvancedMode,
    };

    if (isAdvancedMode) {
      if (caloricGoal) input.caloricGoal = parseInt(caloricGoal, 10);
      if (protein || carbs || fat) {
        input.macros = {};
        if (protein) input.macros.protein = parseInt(protein, 10);
        if (carbs) input.macros.carbs = parseInt(carbs, 10);
        if (fat) input.macros.fat = parseInt(fat, 10);
      }
      if (flavorPalette.trim()) input.flavorPalette = flavorPalette.trim();
      if (region.trim()) input.region = region.trim();
      if (mealType) input.mealType = mealType;
    }

    try {
      const result = await fetchMealSuggestionsAction(input);
      if (result.meals && result.meals.length > 0) {
        setMealSuggestions(result.meals);
        toast({
          title: 'Meals Created!',
          description: `${result.meals.length} delicious ideas ready for you.`,
        });
      } else {
        toast({
          title: 'No Meals Found',
          description: 'Could not generate meal suggestions with the given input. Try adjusting your criteria.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to generate meals:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong while generating meals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, isAdvancedMode, caloricGoal, protein, carbs, fat, flavorPalette, region, mealType, toast]);

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          AI Meal Creator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tell us what ingredients you have, and optionally set some preferences, to get instant meal ideas!
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Utensils className="h-6 w-6 text-primary" />
            Your Ingredients & Preferences
          </CardTitle>
          <CardDescription>
            List your available ingredients below. Toggle advanced mode for more specific meal planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="ingredients" className="text-lg font-medium">Available Ingredients</Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken breast, broccoli, rice, soy sauce, garlic"
              className="mt-2 min-h-[100px] text-base"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">Separate ingredients with commas.</p>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
            <Label htmlFor="advanced-mode" className="text-lg font-medium flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Advanced Mode
            </Label>
          </div>

          {isAdvancedMode && (
            <div className="space-y-6 p-6 bg-muted/50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="caloricGoal">Caloric Goal (approx.)</Label>
                  <Input
                    id="caloricGoal"
                    type="number"
                    value={caloricGoal}
                    onChange={(e) => setCaloricGoal(e.target.value)}
                    placeholder="e.g., 500"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger id="mealType" className="mt-1">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="block mb-1">Macronutrients (optional, grams)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="Protein (g)"
                  />
                  <Input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="Carbs (g)"
                  />
                  <Input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="Fat (g)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="flavorPalette">Flavor Palette</Label>
                  <Input
                    id="flavorPalette"
                    value={flavorPalette}
                    onChange={(e) => setFlavorPalette(e.target.value)}
                    placeholder="e.g., spicy, savory, sweet"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region/Cuisine</Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Italian, Mexican, Asian"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button size="lg" onClick={handleGenerateMeals} disabled={isLoading || !ingredients.trim()} className="w-full md:w-auto">
            {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isLoading ? 'Creating Meals...' : 'Generate Meal Ideas'}
          </Button>
        </CardContent>
      </Card>

      {mealSuggestions.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Suggested Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealSuggestions.map((meal, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border flex flex-col">
                <CardHeader>
                  <CardTitle>{meal.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm text-primary">Recipe:</h4>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{meal.recipe}</p>
                  </div>
                  {meal.notes && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary">Notes:</h4>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">{meal.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
       {isLoading && mealSuggestions.length === 0 && (
         <div className="text-center py-10">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4">Crafting some delicious ideas for you...</p>
         </div>
       )}
    </div>
  );
}
