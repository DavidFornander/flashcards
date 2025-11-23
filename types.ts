// Data model for the new flashcard application.

// A collection of flashcards created by the user.
export interface Deck {
  id: string;
  name: string;
}

// Spaced Repetition System (SRS) settings, configurable by the user.
export interface SRSSettings {
  roundSize: number;
  spotCheckChance: number;
  newCardFillRatio: number;
  defaultEasinessFactor: number;
  minEasinessFactor: number;
}

// Represents a single flashcard with its content and SRS data.
export interface Card {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  aiExplanation?: string; // Cached AI explanation
  tags?: string[]; // Card categories or tags
  easinessFactor: number;
  interval: number; // in days
  repetitions: number;
  nextReviewDate: string; // ISO string
  lastRating?: number;
}