import * as admin from 'firebase-admin';
import { Card, Deck } from '../models';
import { DataProvider } from '../DataProvider';

type Firestore = admin.firestore.Firestore;
type Timestamp = admin.firestore.Timestamp;
const Timestamp = admin.firestore.Timestamp;

type FirestoreDeck = Omit<Deck, 'createdAt' | 'updatedAt'> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

type FirestoreCard = Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'nextReviewDate'> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    nextReviewDate: Timestamp;
};

function tsToDate(ts?: Timestamp): Date | undefined {
    return ts ? ts.toDate() : undefined;
}

export function mapFirestoreDeck(id: string, data: FirestoreDeck): Deck {
    return {
        id,
        name: data.name,
        createdAt: tsToDate(data.createdAt),
        updatedAt: tsToDate(data.updatedAt),
    };
}

export function mapFirestoreCard(id: string, data: FirestoreCard): Card {
    return {
        id,
        deckId: data.deckId,
        question: data.question,
        answer: data.answer,
        aiExplanation: data.aiExplanation,
        tags: data.tags,
        easinessFactor: data.easinessFactor,
        interval: data.interval,
        repetitions: data.repetitions,
        nextReviewDate: tsToDate(data.nextReviewDate) || new Date(),
        lastRating: data.lastRating,
        createdAt: tsToDate(data.createdAt),
        updatedAt: tsToDate(data.updatedAt),
    };
}

export class FirestoreDataProvider implements DataProvider {
    constructor(private db: admin.firestore.Firestore) { }

    async getAllDecks(): Promise<Deck[]> {
        const snapshot = await this.db.collection('decks').get();
        return snapshot.docs.map((doc) => mapFirestoreDeck(doc.id, doc.data() as FirestoreDeck));
    }

    async createDeck(name: string): Promise<Deck> {
        const ref = await this.db.collection('decks').add({
            name,
            createdAt: Timestamp.now(),
        });
        const created = await ref.get();
        return mapFirestoreDeck(ref.id, created.data() as FirestoreDeck);
    }

    async deleteDeck(id: string): Promise<void> {
        await this.db.collection('decks').doc(id).delete();
    }

    async getAllCards(): Promise<Card[]> {
        const snapshot = await this.db.collection('cards').get();
        return snapshot.docs.map((doc) => mapFirestoreCard(doc.id, doc.data() as FirestoreCard));
    }

    async createCard(input: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
        const payload: FirestoreCard = {
            ...input,
            tags: input.tags || [],
            nextReviewDate: Timestamp.fromDate(input.nextReviewDate ?? new Date()),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const ref = await this.db.collection('cards').add(payload);
        const created = await ref.get();
        return mapFirestoreCard(ref.id, created.data() as FirestoreCard);
    }

    async createCardsBatch(inputs: Array<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Card[]> {
        const batch = this.db.batch();
        const cardsCollection = this.db.collection('cards');
        const now = Timestamp.now();

        const refs = inputs.map(() => cardsCollection.doc());
        inputs.forEach((input, idx) => {
            const payload: FirestoreCard = {
                ...input,
                tags: input.tags || [],
                nextReviewDate: Timestamp.fromDate(input.nextReviewDate ?? new Date()),
                createdAt: now,
                updatedAt: now,
            };
            batch.set(refs[idx], payload);
        });

        await batch.commit();

        const snapshots = await Promise.all(refs.map((ref) => ref.get()));
        return snapshots.map((snap) => mapFirestoreCard(snap.id, snap.data() as FirestoreCard));
    }

    async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
        const docRef = this.db.collection('cards').doc(id);
        const data: Partial<FirestoreCard> = {};
        if (updates.easinessFactor !== undefined) data.easinessFactor = updates.easinessFactor;
        if (updates.interval !== undefined) data.interval = updates.interval;
        if (updates.repetitions !== undefined) data.repetitions = updates.repetitions;
        if (updates.nextReviewDate !== undefined) data.nextReviewDate = Timestamp.fromDate(updates.nextReviewDate);
        if (updates.lastRating !== undefined) data.lastRating = updates.lastRating;
        if (updates.aiExplanation !== undefined) data.aiExplanation = updates.aiExplanation ?? null;
        if (updates.tags !== undefined) data.tags = updates.tags;
        if (updates.question !== undefined) data.question = updates.question;
        if (updates.answer !== undefined) data.answer = updates.answer;
        data.updatedAt = Timestamp.now();

        await docRef.set(data, { merge: true });
        const snap = await docRef.get();
        return mapFirestoreCard(snap.id, snap.data() as FirestoreCard);
    }
}

