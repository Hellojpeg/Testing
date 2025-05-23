
export interface HangoutSuggestion {
  id: string;
  text: string;
  isSaved: boolean;
  hasHappened: boolean;
  createdAt: string; // ISO string date
}

export interface MealRecipe {
  name: string;
  recipe: string;
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
