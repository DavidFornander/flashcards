export interface Deck {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Card {
    id: string;
    deckId: string;
    question: string;
    answer: string;
    aiExplanation?: string | null;
    tags?: string[];
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: Date;
    lastRating?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

