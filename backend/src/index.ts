import express from 'express';
import cors from 'cors';
import { loadConfig } from './config';
import { createDataProvider } from './data/providerFactory';
import { Card } from './data/models';

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const config = loadConfig();
const dataProvider = createDataProvider(config);

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const serializeCard = (card: Card) => ({
    ...card,
    nextReviewDate: card.nextReviewDate?.toISOString(),
    createdAt: card.createdAt?.toISOString(),
    updatedAt: card.updatedAt?.toISOString(),
});

// Decks
app.get('/decks', async (_req, res) => {
    try {
        const decks = await dataProvider.getAllDecks();
        res.json(decks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch decks' });
    }
});

app.post('/decks', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const deck = await dataProvider.createDeck(name);
        res.json(deck);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create deck' });
    }
});

app.delete('/decks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dataProvider.deleteDeck(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete deck' });
    }
});

// Cards
app.get('/cards', async (req, res) => {
    try {
        const cards = await dataProvider.getAllCards();
        res.json(cards.map(serializeCard));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

app.post('/cards', async (req, res) => {
    try {
        const { deckId, question, answer, tags, easinessFactor, interval, repetitions, nextReviewDate } = req.body;

        if (!deckId || !question || !answer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const card = await dataProvider.createCard({
            deckId,
            question,
            answer,
            tags: tags || [],
            easinessFactor: easinessFactor ?? 2.5,
            interval: interval ?? 0,
            repetitions: repetitions ?? 0,
            nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : new Date(),
        });
        res.json(serializeCard(card));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

app.post('/cards/batch', async (req, res) => {
    try {
        const { deckId, cards } = req.body; // cards: {question, answer, tags}[]

        if (!deckId || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const createdCards = await dataProvider.createCardsBatch(
            cards.map((card: any) => ({
                deckId,
                question: card.question,
                answer: card.answer,
                tags: card.tags || [],
                easinessFactor: 2.5,
                interval: 0,
                repetitions: 0,
                nextReviewDate: new Date(),
            }))
        );

        res.json(createdCards.map(serializeCard));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to batch create cards' });
    }
});

app.put('/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { easinessFactor, interval, repetitions, nextReviewDate, lastRating, aiExplanation } = req.body;

        const card = await dataProvider.updateCard(id, {
            easinessFactor,
            interval,
            repetitions,
            nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
            lastRating,
            aiExplanation,
        });
        res.json(serializeCard(card));
    } catch (error) {
        res.status(500).json({ error: 'Failed to update card' });
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
