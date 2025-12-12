import { PrismaClient, Card as PrismaCard, Deck as PrismaDeck } from '@prisma/client';
import { Card, Deck } from '../models';
import { DataProvider } from '../DataProvider';

const DEFAULT_EF = 2.5;

export function mapPrismaDeck(deck: PrismaDeck): Deck {
    return {
        id: deck.id,
        name: deck.name,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
    };
}

export function mapPrismaCard(card: PrismaCard): Card {
    return {
        id: card.id,
        deckId: card.deckId,
        question: card.question,
        answer: card.answer,
        aiExplanation: card.aiExplanation,
        tags: card.tags,
        easinessFactor: card.easinessFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReviewDate: new Date(card.nextReviewDate),
        lastRating: card.lastRating,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
    };
}

export class PostgresDataProvider implements DataProvider {
    constructor(private prisma: PrismaClient) { }

    async getAllDecks(): Promise<Deck[]> {
        const decks = await this.prisma.deck.findMany({ orderBy: { createdAt: 'desc' } });
        return decks.map(mapPrismaDeck);
    }

    async createDeck(name: string): Promise<Deck> {
        const deck = await this.prisma.deck.create({ data: { name } });
        return mapPrismaDeck(deck);
    }

    async deleteDeck(id: string): Promise<void> {
        await this.prisma.deck.delete({ where: { id } });
    }

    async getAllCards(): Promise<Card[]> {
        const cards = await this.prisma.card.findMany();
        return cards.map(mapPrismaCard);
    }

    async createCard(input: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
        const card = await this.prisma.card.create({
            data: {
                deckId: input.deckId,
                question: input.question,
                answer: input.answer,
                tags: input.tags || [],
                easinessFactor: input.easinessFactor ?? DEFAULT_EF,
                interval: input.interval ?? 0,
                repetitions: input.repetitions ?? 0,
                nextReviewDate: input.nextReviewDate ?? new Date(),
                aiExplanation: input.aiExplanation,
                lastRating: input.lastRating ?? null,
            }
        });
        return mapPrismaCard(card);
    }

    async createCardsBatch(inputs: Array<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Card[]> {
        const created = await this.prisma.$transaction(
            inputs.map((input) =>
                this.prisma.card.create({
                    data: {
                        deckId: input.deckId,
                        question: input.question,
                        answer: input.answer,
                        tags: input.tags || [],
                        easinessFactor: input.easinessFactor ?? DEFAULT_EF,
                        interval: input.interval ?? 0,
                        repetitions: input.repetitions ?? 0,
                        nextReviewDate: input.nextReviewDate ?? new Date(),
                        aiExplanation: input.aiExplanation,
                        lastRating: input.lastRating ?? null,
                    }
                })
            )
        );
        return created.map(mapPrismaCard);
    }

    async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
        const data: any = {};
        if (updates.easinessFactor !== undefined) data.easinessFactor = updates.easinessFactor;
        if (updates.interval !== undefined) data.interval = updates.interval;
        if (updates.repetitions !== undefined) data.repetitions = updates.repetitions;
        if (updates.nextReviewDate !== undefined) data.nextReviewDate = updates.nextReviewDate;
        if (updates.lastRating !== undefined) data.lastRating = updates.lastRating;
        if (updates.aiExplanation !== undefined) data.aiExplanation = updates.aiExplanation;
        if (updates.tags !== undefined) data.tags = updates.tags;
        if (updates.question !== undefined) data.question = updates.question;
        if (updates.answer !== undefined) data.answer = updates.answer;

        const card = await this.prisma.card.update({ where: { id }, data });
        return mapPrismaCard(card);
    }
}

