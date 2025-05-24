
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

// Types for Study Guide Creator
export interface FlashcardItem {
  question: string;
  answer: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface PracticeQuestionItem {
  questionText: string;
  questionType?: string;
  options?: string; // For multiple choice, e.g., "A) Opt1 B) Opt2"
  correctAnswer?: string;
}

export interface StudyGuideData {
  studyGuideMarkdown: string;
  flashcards: FlashcardItem[];
  definitions: DefinitionItem[];
  practiceQuestions: PracticeQuestionItem[];
}
