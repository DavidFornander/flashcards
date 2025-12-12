import { Card, Deck, SRSSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8101';

export const api = {
    // Settings Management (Still in LocalStorage for now, or move to DB? Plan didn't specify. 
    // Let's keep settings in LocalStorage for simplicity as they are user-specific preferences, not content)
    // Actually, keeping them in LocalStorage avoids backend schema changes for now.

    // Deck Management
    async getAllDecks(): Promise<Deck[]> {
        const res = await fetch(`${API_URL}/decks`);
        if (!res.ok) throw new Error('Failed to fetch decks');
        return res.json();
    },

    async createDeck(name: string): Promise<Deck> {
        const res = await fetch(`${API_URL}/decks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to create deck');
        return res.json();
    },

    async deleteDeck(deckId: string): Promise<void> {
        const res = await fetch(`${API_URL}/decks/${deckId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete deck');
    },

    // Card Management
    async getAllCards(): Promise<Record<string, Card>> {
        // Backend returns Array, Frontend expects Record<string, Card>
        const res = await fetch(`${API_URL}/cards`);
        if (!res.ok) throw new Error('Failed to fetch cards');
        const cardsArray: Card[] = await res.json();

        const cardsMap: Record<string, Card> = {};
        cardsArray.forEach(card => {
            cardsMap[card.id] = card;
        });
        return cardsMap;
    },

    // Helper to get array directly if needed
    async getAllCardsArray(): Promise<Card[]> {
        const res = await fetch(`${API_URL}/cards`);
        if (!res.ok) throw new Error('Failed to fetch cards');
        return res.json();
    },

    async createCard(deckId: string, question: string, answer: string, settings: SRSSettings): Promise<Card> {
        const res = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deckId,
                question,
                answer,
                easinessFactor: settings.defaultEasinessFactor,
                interval: 0,
                repetitions: 0,
                nextReviewDate: new Date(),
                tags: []
            }),
        });
        if (!res.ok) throw new Error('Failed to create card');
        return res.json();
    },

    async createMultipleCards(deckId: string, cardsData: { question: string, answer: string, tags?: string[] }[], settings: SRSSettings): Promise<Card[]> {
        const res = await fetch(`${API_URL}/cards/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deckId,
                cards: cardsData
            })
        });
        if (!res.ok) throw new Error('Failed to batch create cards');
        return res.json();
    },

    async updateCard(card: Card): Promise<Card> {
        const res = await fetch(`${API_URL}/cards/${card.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                easinessFactor: card.easinessFactor,
                interval: card.interval,
                repetitions: card.repetitions,
                nextReviewDate: card.nextReviewDate,
                lastRating: card.lastRating,
                aiExplanation: card.aiExplanation
            })
        });
        if (!res.ok) throw new Error('Failed to update card');
        return res.json();
    }
};
