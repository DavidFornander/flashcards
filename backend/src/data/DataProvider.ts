import { Card, Deck } from './models';

export interface DataProvider {
    getAllDecks(): Promise<Deck[]>;
    createDeck(name: string): Promise<Deck>;
    deleteDeck(id: string): Promise<void>;

    getAllCards(): Promise<Card[]>;
    createCard(input: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card>;
    createCardsBatch(input: Array<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Card[]>;
    updateCard(id: string, updates: Partial<Card>): Promise<Card>;
}

