import { describe, it, expect } from 'vitest';
import { updateCardSRSData, DEFAULT_SRS_SETTINGS } from './srs';
import { Card } from '../types';

describe('SRS Logic', () => {
    const baseCard: Card = {
        id: 'test-id',
        deckId: 'deck-id',
        question: 'Q',
        answer: 'A',
        easinessFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
        tags: []
    };

    it('should reset progress on failure (rating < 3)', () => {
        const card = { ...baseCard, repetitions: 5, interval: 10 };
        const updated = updateCardSRSData(card, 2, DEFAULT_SRS_SETTINGS); // 2 = Hard/Fail

        expect(updated.repetitions).toBe(0);
        expect(updated.interval).toBe(1);
    });

    it('should set interval to 1 day on first success', () => {
        const updated = updateCardSRSData(baseCard, 3, DEFAULT_SRS_SETTINGS);
        expect(updated.repetitions).toBe(1);
        expect(updated.interval).toBe(1);
    });

    it('should set interval to 6 days on second success', () => {
        const card = { ...baseCard, repetitions: 1, interval: 1 };
        const updated = updateCardSRSData(card, 4, DEFAULT_SRS_SETTINGS); // 4 = Good
        expect(updated.repetitions).toBe(2);
        expect(updated.interval).toBe(6);
    });

    it('should increase easiness factor for high ratings', () => {
        const card = { ...baseCard, easinessFactor: 2.5 };
        const updated = updateCardSRSData(card, 5, DEFAULT_SRS_SETTINGS); // 5 = Easy
        // EF' = EF + (0.1 - (5-rating)*(0.08 + (5-rating)*0.02))
        // Formula in code: -0.8 + 0.28*5 - 0.02*25 = -0.8 + 1.4 - 0.5 = 0.1 increase
        expect(updated.easinessFactor).toBeGreaterThan(2.5);
        expect(updated.easinessFactor).toBeCloseTo(2.6);
    });

    it('should decrease easiness factor for low ratings', () => {
        const card = { ...baseCard, easinessFactor: 2.5 };
        const updated = updateCardSRSData(card, 3, DEFAULT_SRS_SETTINGS); // 3 = Ok
        // -0.8 + 0.28*3 - 0.02*9 = -0.8 + 0.84 - 0.18 = -0.14
        expect(updated.easinessFactor).toBeLessThan(2.5);
    });
});
