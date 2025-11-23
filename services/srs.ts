import { Card, Deck, SRSSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { defaultDeck, defaultCards } from './defaultData';

export const DEFAULT_SRS_SETTINGS: SRSSettings = {
  roundSize: 10,
  spotCheckChance: 50,
  newCardFillRatio: 50,
  defaultEasinessFactor: 2.5,
  minEasinessFactor: 1.3,
};

/**
 * Updates a card's SRS properties based on the user's performance rating.
 */
export function updateCardSRSData(card: Card, rating: number, settings: SRSSettings): Card {
  const updatedCard = { ...card };
  updatedCard.lastRating = rating;

  // Adjust Easiness Factor
  const easiness_modifier = -0.8 + 0.28 * rating - 0.02 * rating * rating;
  updatedCard.easinessFactor = Math.max(settings.minEasinessFactor, card.easinessFactor + easiness_modifier);

  // Handle Repetition Sequence
  if (rating < 3) {
    updatedCard.repetitions = 0;
    updatedCard.interval = 1;
  } else {
    updatedCard.repetitions += 1;
    switch (updatedCard.repetitions) {
      case 1:
        updatedCard.interval = 1;
        break;
      case 2:
        updatedCard.interval = 6;
        break;
      default:
        updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easinessFactor);
        break;
    }
  }

  return updatedCard;
}

/**
 * Sets the next review date for a card that has passed a review round.
 */
export function scheduleForLongTermReview(card: Card): Card {
    const newCard = {...card};
    const now = new Date();
    now.setDate(now.getDate() + newCard.interval);
    newCard.nextReviewDate = now.toISOString();
    return newCard;
}

const CARD_STORAGE_KEY = 'srsCards';
const DECK_STORAGE_KEY = 'srsDecks';
const SETTINGS_STORAGE_KEY = 'srsSettings';

/**
 * Manages the persistence of decks and cards in localStorage.
 */
export const storageManager = {
  // Settings Management
  saveSettings(settings: SRSSettings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  },

  loadSettings(): SRSSettings {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        // Merge with defaults to ensure all keys are present if the model changes
        const parsed = JSON.parse(savedSettings);
        return { ...DEFAULT_SRS_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    return DEFAULT_SRS_SETTINGS;
  },
  
  // Deck Management
  getAllDecks(): Deck[] {
    try {
      const savedDecks = localStorage.getItem(DECK_STORAGE_KEY);
      return savedDecks ? JSON.parse(savedDecks) : [];
    } catch (error) {
      console.error("Failed to load decks from localStorage", error);
      return [];
    }
  },

  saveDecks(decks: Deck[]) {
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(decks));
  },

  createDeck(name: string): Deck {
    const newDeck: Deck = { id: uuidv4(), name };
    const decks = this.getAllDecks();
    decks.push(newDeck);
    this.saveDecks(decks);
    return newDeck;
  },
  
  deleteDeck(deckId: string) {
    const decks = this.getAllDecks().filter(deck => deck.id !== deckId);
    this.saveDecks(decks);

    const allCards = this.getAllCards();
    for (const cardId in allCards) {
      if (allCards[cardId].deckId === deckId) {
        delete allCards[cardId];
      }
    }
    this.saveAllCards(allCards);
  },

  // Card Management
  getAllCards(): Record<string, Card> {
    try {
      const savedCards = localStorage.getItem(CARD_STORAGE_KEY);
      return savedCards ? JSON.parse(savedCards) : {};
    } catch (error) {
      console.error("Failed to load cards from localStorage", error);
      return {};
    }
  },
  
  saveAllCards(cards: Record<string, Card>) {
    localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
  },

  saveCard(card: Card) {
    const allCards = this.getAllCards();
    allCards[card.id] = card;
    this.saveAllCards(allCards);
  },

  createCard(deckId: string, question: string, answer: string, settings: SRSSettings): Card {
    const newCard: Card = {
        id: uuidv4(),
        deckId,
        question,
        answer,
        easinessFactor: settings.defaultEasinessFactor,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
        tags: [],
    };
    this.saveCard(newCard);
    return newCard;
  },

  createMultipleCards(deckId: string, cardsData: {question: string, answer: string, tags?: string[]}[], settings: SRSSettings): Card[] {
    const allCards = this.getAllCards();
    const newCards: Card[] = [];

    cardsData.forEach(({ question, answer, tags }) => {
        const newCard: Card = {
            id: uuidv4(),
            deckId,
            question,
            answer,
            easinessFactor: settings.defaultEasinessFactor,
            interval: 0,
            repetitions: 0,
            nextReviewDate: new Date().toISOString(),
            tags: tags || [],
        };
        allCards[newCard.id] = newCard;
        newCards.push(newCard);
    });

    this.saveAllCards(allCards);
    return newCards;
  },

  initializeDefaultData() {
    const decks = this.getAllDecks();
    if (decks.length > 0) {
      return; // Data already exists
    }

    console.log("No decks found, initializing with default data.");
    const settings = this.loadSettings();
    const newDeck = this.createDeck(defaultDeck.name);
    this.createMultipleCards(newDeck.id, defaultCards, settings);
  },

  resetAllProgress() {
    localStorage.removeItem(CARD_STORAGE_KEY);
    localStorage.removeItem(DECK_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  },
};