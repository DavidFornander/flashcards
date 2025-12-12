import test from 'node:test';
import assert from 'node:assert/strict';
import * as admin from 'firebase-admin';
import { mapPrismaCard, mapPrismaDeck } from '../data/providers/postgresProvider';
import { mapFirestoreCard, mapFirestoreDeck } from '../data/providers/firestoreProvider';
import { createDataProvider } from '../data/providerFactory';

const Timestamp = admin.firestore.Timestamp;

test('mapPrismaDeck maps fields and dates', () => {
    const now = new Date();
    const deck = mapPrismaDeck({
        id: 'd1',
        name: 'Deck',
        createdAt: now,
        updatedAt: now,
    });
    assert.equal(deck.id, 'd1');
    assert.equal(deck.name, 'Deck');
    assert.equal(deck.createdAt, now);
});

test('mapPrismaCard maps fields and dates', () => {
    const now = new Date();
    const card = mapPrismaCard({
        id: 'c1',
        deckId: 'd1',
        question: 'q',
        answer: 'a',
        tags: ['t'],
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 2,
        nextReviewDate: now,
        aiExplanation: null,
        lastRating: 4,
        createdAt: now,
        updatedAt: now,
    });
    assert.equal(card.id, 'c1');
    assert.equal(card.nextReviewDate.getTime(), now.getTime());
});

test('mapFirestoreDeck maps timestamp to Date', () => {
    const nowTs = Timestamp.now();
    const deck = mapFirestoreDeck('d1', { name: 'Deck', createdAt: nowTs, updatedAt: nowTs });
    assert.equal(deck.id, 'd1');
    assert(deck.createdAt instanceof Date);
});

test('mapFirestoreCard maps timestamp to Date', () => {
    const nowTs = Timestamp.now();
    const card = mapFirestoreCard('c1', {
        deckId: 'd1',
        question: 'q',
        answer: 'a',
        tags: ['t'],
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 2,
        nextReviewDate: nowTs,
        aiExplanation: null,
        lastRating: 4,
        createdAt: nowTs,
        updatedAt: nowTs,
    });
    assert.equal(card.id, 'c1');
    assert(card.nextReviewDate instanceof Date);
});

test('createDataProvider chooses firestore by default', () => {
    const provider = createDataProvider({
        dataProvider: 'firestore',
        databaseUrl: undefined,
        firestore: {
            projectId: 'proj',
            clientEmail: 'svc@example.com',
            privateKey: 'key',
        },
    });
    assert.ok(provider, 'provider created');
});

