# Flashcard Application Logic - In-Depth Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Models & Architecture](#data-models--architecture)
3. [Spaced Repetition System (SRS) Algorithm](#spaced-repetition-system-srs-algorithm)
4. [Study Session Workflow](#study-session-workflow)
5. [Round Lifecycle Management](#round-lifecycle-management)
6. [Card Rating & Processing Logic](#card-rating--processing-logic)
7. [Queue Management System](#queue-management-system)
8. [User Interface Components](#user-interface-components)
9. [Storage & Persistence](#storage--persistence)
10. [AI Integration Features](#ai-integration-features)
11. [Testing & Quality Assurance](#testing--quality-assurance)
12. [Implementation Details](#implementation-details)

---

## System Overview

### Purpose & Philosophy

This flashcard application implements an **adaptive spaced repetition learning system** designed to maximize long-term knowledge retention while preventing cognitive overload. The system is built on the principle that optimal learning occurs when material is reviewed at progressively increasing intervals, with the interval length determined by the learner's demonstrated mastery of each concept.

### Core Objectives

1. **Efficient Learning**: Optimize study time by focusing on cards that need review
2. **Adaptive Difficulty**: Dynamically adjust review intervals based on performance
3. **Cognitive Balance**: Mix new and review cards to prevent overwhelm
4. **Motivational Design**: Provide immediate feedback and progress visualization
5. **Personalization**: Allow users to configure algorithm parameters
6. **AI-Enhanced Understanding**: Provide on-demand explanations for difficult concepts

### Architecture Pattern

The application follows a **single-page application (SPA)** architecture with:
- **React** for UI components and state management
- **TypeScript** for type safety
- **localStorage** for client-side persistence
- **Google Gemini AI** for explanation generation
- **Tailwind CSS** for styling with dark mode support

---

## Data Models & Architecture

### Type Definitions

#### Deck

```typescript
interface Deck {
  id: string;           // UUID generated with uuidv4
  name: string;         // User-defined deck name
}
```

**Purpose**: Represents a collection of related flashcards. Decks provide organizational structure, allowing users to separate different subjects or topics.

#### Card

```typescript
interface Card {
  id: string;                    // UUID generated with uuidv4
  deckId: string;                // Reference to parent deck
  question: string;              // Front of the card (supports Markdown)
  answer: string;                // Back of the card (supports Markdown)
  aiExplanation?: string;        // Cached AI-generated explanation
  tags?: string[];               // Categorization labels
  
  // SRS-specific fields
  easinessFactor: number;        // Current difficulty rating (≥ 1.3)
  interval: number;              // Days until next review
  repetitions: number;           // Consecutive successful reviews
  nextReviewDate: string;        // ISO 8601 timestamp
  lastRating?: number;           // Most recent rating (1-5)
}
```

**Field Deep Dive**:

- **easinessFactor**: A decimal value starting at 2.5 that represents how "easy" the card is. Higher values mean the card's review interval grows faster. This is dynamically adjusted based on user ratings.
  
- **interval**: The number of days between reviews. Starts at 0 for new cards and grows exponentially for cards that are consistently rated well.
  
- **repetitions**: Tracks consecutive successful reviews (rating ≥ 3). Reset to 0 on failure (rating < 3).
  
- **nextReviewDate**: The date/time when the card should next appear in the review queue. For new cards, this is set to the creation date.
  
- **lastRating**: Stored for UI feedback purposes - allows the system to display a colored indicator showing how the user previously rated this card.

#### SRSSettings

```typescript
interface SRSSettings {
  roundSize: number;              // Target cards per round (default: 10)
  spotCheckChance: number;        // % chance to retest "Easy" cards (default: 50)
  newCardFillRatio: number;       // % of new cards in each round (default: 50)
  defaultEasinessFactor: number;  // Starting easiness (default: 2.5)
  minEasinessFactor: number;      // Floor for easiness (default: 1.3)
}
```

**Configuration Philosophy**: These settings allow users to tailor the learning experience:

- **roundSize**: Smaller rounds (5-7) reduce cognitive load; larger rounds (15-25) maximize efficiency for experienced users
- **spotCheckChance**: Higher values provide more reinforcement for "easy" cards before long-term scheduling
- **newCardFillRatio**: Controls the balance between learning new material and reviewing old material
- **defaultEasinessFactor**: Higher starting values mean faster initial progression
- **minEasinessFactor**: Prevents difficult cards from becoming stuck in daily reviews indefinitely

### Data Model Relationships

```
User
 └─ SRSSettings (1:1)
 └─ Decks (1:n)
     └─ Cards (1:n)
```

Each user has one set of SRS settings that apply globally. Decks are independent organizational units, and cards belong to exactly one deck.

---

## Spaced Repetition System (SRS) Algorithm

### Theoretical Foundation

The SRS algorithm is based on the **SuperMemo 2 (SM-2)** algorithm with modifications. The core insight is that:

1. **Spacing Effect**: Information is better retained when reviews are spaced out over time
2. **Difficulty Tracking**: Each card has an inherent difficulty that can be estimated from user performance
3. **Exponential Intervals**: Review intervals should grow exponentially for mastered content

### The Easiness Factor

The easiness factor (EF) is the heart of the algorithm. It determines how quickly intervals grow.

**Initial State**: Every new card starts with `easinessFactor = defaultEasinessFactor` (typically 2.5)

**Modification Formula**:

```
modifier = -0.8 + (0.28 × rating) - (0.02 × rating²)
newEF = max(minEasinessFactor, oldEF + modifier)
```

**Example Calculations**:

For a card with EF = 2.5:

| Rating | Modifier Calculation | New EF | Change |
|--------|---------------------|--------|--------|
| 1 (Again) | -0.8 + 0.28 - 0.02 = -0.54 | 1.96 | -0.54 |
| 2 (Hard) | -0.8 + 0.56 - 0.08 = -0.32 | 2.18 | -0.32 |
| 3 (Good) | -0.8 + 0.84 - 0.18 = -0.14 | 2.36 | -0.14 |
| 4 (Easy) | -0.8 + 1.12 - 0.32 = 0.00 | 2.50 | 0.00 |
| 5 (Very Easy) | -0.8 + 1.40 - 0.50 = +0.10 | 2.60 | +0.10 |

**Key Insights**:
- Only rating 5 increases the easiness factor
- Rating 4 maintains the current easiness
- Ratings 1-3 decrease easiness, making future intervals shorter
- The minimum easiness factor prevents cards from becoming impossibly difficult

### Interval Calculation

The interval (days until next review) follows a specific progression:

```javascript
function calculateInterval(card, rating, settings) {
  if (rating < 3) {
    // Failure: Reset
    card.repetitions = 0;
    card.interval = 1;
  } else {
    // Success: Progress
    card.repetitions += 1;
    
    if (card.repetitions === 1) {
      card.interval = 1;        // First success: review tomorrow
    } else if (card.repetitions === 2) {
      card.interval = 6;        // Second success: review in 6 days
    } else {
      // Third+ success: exponential growth
      card.interval = Math.round(previousInterval × card.easinessFactor);
    }
  }
}
```

**Progression Example** for a card rated 4 consistently (EF ≈ 2.5):

1. First review (new card): Next review in **1 day**
2. Second review: Next review in **6 days**
3. Third review: 6 × 2.5 = **15 days**
4. Fourth review: 15 × 2.5 = **38 days**
5. Fifth review: 38 × 2.5 = **95 days** (~3 months)
6. Sixth review: 95 × 2.5 = **238 days** (~8 months)

**Design Rationale**:
- The 1-6 day initial sequence is based on memory research showing optimal early consolidation
- Exponential growth prevents review accumulation
- Rounding ensures whole-day intervals

### Scheduling for Long-Term Review

When a card "graduates" (receives rating 4 or 5 and passes spot-check), it's scheduled:

```javascript
function scheduleForLongTermReview(card) {
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + card.interval);
  card.nextReviewDate = reviewDate.toISOString();
  return card;
}
```

The card is removed from the active study session and won't reappear until its `nextReviewDate`.

---

## Study Session Workflow

### Session Initialization

When a user clicks "Study Deck":

1. **Load Deck Cards**: Retrieve all cards belonging to the selected deck from storage
2. **Create Practice Queue**: Shuffle all deck cards and store as initial queue
3. **Initialize Queues**:
   - **Practice Queue**: All shuffled cards from the deck
   - **Round Queue**: Empty (will be populated for each round)
   - **Carry-Over Queue**: Empty (for cards that need immediate review)
4. **Set Session State**:
   - Round number: 0
   - Session statistics: newInSession = 0, reviewedInSession = 0
   - Session finished: false

### Session Loop Structure

```
Session Start
    ↓
┌─→ Build Round Queue ←─────┐
│   │                       │
│   ↓                       │
│   Present Cards           │
│   │                       │
│   ↓                       │
│   Process Ratings         │
│   │                       │
│   ↓                       │
│   Round Complete?         │
│   ├─ Yes → Show Summary   │
│   │         └─────────────┘
│   └─ No → Next Card
│
└─ All Queues Empty?
    ├─ Yes → Session Complete
    └─ No → Continue
```

### Session Completion

When both the practice queue and carry-over queue are empty:

1. Display **PracticeSummary** component showing:
   - Total reviewed cards (cards with repetitions > 0 at start)
   - Total new cards (cards with repetitions = 0 at start)
2. Provide "Exit" button to return to deck view
3. All card state changes have already been persisted to localStorage

---

## Round Lifecycle Management

### Round Building Algorithm

Each round aims to contain `settings.roundSize` cards (default: 10).

**Step-by-Step Process**:

```javascript
function buildNextRound() {
  // Step 1: Start with carry-over cards
  let roundQueue = [...carryOverQueue];
  carryOverQueue = []; // Clear carry-over
  
  // Step 2: Calculate how many more cards we need
  let neededCards = settings.roundSize - roundQueue.length;
  
  // Step 3: If round is full, start immediately
  if (neededCards <= 0) {
    startRound(roundQueue);
    return;
  }
  
  // Step 4: Pull from practice queue
  const pulled = practiceQueue.splice(0, neededCards);
  roundQueue.push(...pulled);
  
  // Step 5: Check if session should end
  if (roundQueue.length === 0) {
    endSession();
    return;
  }
  
  // Step 6: Start the round
  startRound(roundQueue);
}
```

**Important Notes**:

- **Carry-over priority**: Cards from the carry-over queue ALWAYS appear in the next round, even if this makes the round larger than `roundSize`
- **Practice queue depletion**: As cards are pulled from the practice queue, it shrinks. Final rounds may be smaller than `roundSize`
- **No card mixing**: Cards are presented in the order they appear in the round queue (carry-overs first, then newly pulled cards)

### Round Presentation

During an active round:

1. **Current Card**: The first card in `roundQueue` is displayed
2. **Progress Bar**: Shows visual progress with color-coded results
3. **User Actions**:
   - "Visa Svar" (Show Answer) → Flip card to reveal answer
   - Rate 1-5 → Process rating and move to next card
4. **State Tracking**: `roundResults` array stores each rating for summary display

### Round Summary

After the last card in a round is rated:

1. **Display RoundSummaryModal** with:
   - Round number
   - Color-coded progress bar
   - Breakdown of ratings (e.g., "3 Very Easy, 2 Easy, 4 Good, 1 Again")
2. **User Options**:
   - "Starta Nästa Runda" (Start Next Round) → Build and start next round
   - "Avsluta" (Exit) → End session and return to deck view

---

## Card Rating & Processing Logic

### The Five-Point Rating Scale

Users rate cards on a 1-5 scale after viewing the answer:

| Rating | Label (Swedish) | Meaning | Typical Use |
|--------|----------------|---------|-------------|
| 1 | Igen (Again) | Complete failure | Don't know at all |
| 2 | Svår (Hard) | Difficult recall | Knew it but struggled |
| 3 | Bra (Good) | Correct with effort | Standard correct answer |
| 4 | Lätt (Easy) | Easy recall | Knew it immediately |
| 5 | Mycket Lätt (Very Easy) | Trivial | Too easy, increase interval |

### Two-Phase Processing

When a user rates a card, processing occurs in two phases:

#### Phase A: Update SRS Data (The "Memory" Phase)

```javascript
function updateCardSRSData(card, rating, settings) {
  const updatedCard = { ...card };
  updatedCard.lastRating = rating;
  
  // 1. Adjust Easiness Factor
  const modifier = -0.8 + 0.28 * rating - 0.02 * rating * rating;
  updatedCard.easinessFactor = Math.max(
    settings.minEasinessFactor,
    card.easinessFactor + modifier
  );
  
  // 2. Handle Repetition Sequence
  if (rating < 3) {
    // Failure: reset progress
    updatedCard.repetitions = 0;
    updatedCard.interval = 1;
  } else {
    // Success: advance
    updatedCard.repetitions += 1;
    
    if (updatedCard.repetitions === 1) {
      updatedCard.interval = 1;
    } else if (updatedCard.repetitions === 2) {
      updatedCard.interval = 6;
    } else {
      updatedCard.interval = Math.round(
        updatedCard.interval * updatedCard.easinessFactor
      );
    }
  }
  
  return updatedCard;
}
```

This phase ONLY updates the card's SRS properties. It does NOT change the `nextReviewDate` or determine where the card goes next.

#### Phase B: Route Card (The "Action" Phase)

After updating SRS data, the system determines what happens to the card:

```javascript
function routeCard(card, rating, settings) {
  if (rating <= 2) {
    // Failure: Re-insert at end of current round
    roundQueue.push(card.id);
    
  } else if (rating === 3) {
    // Fragile success: Move to carry-over queue
    carryOverQueue.push(card.id);
    
  } else if (rating === 4) {
    // Confident success: Probabilistic spot-check
    const spotCheck = Math.random() < (settings.spotCheckChance / 100);
    
    if (spotCheck) {
      carryOverQueue.push(card.id);
    } else {
      scheduleForLongTermReview(card); // Graduate
    }
    
  } else { // rating === 5
    // Mastery: Always graduate
    scheduleForLongTermReview(card);
  }
}
```

**Routing Logic Deep Dive**:

1. **Rating 1-2 (Failures)**:
   - Card goes to END of current round queue
   - Will be seen again in current round, but not immediately
   - Allows user to see other cards first, reducing frustration
   - Example: Round has [A, B, C]. User fails B. Round becomes [A, C, B]

2. **Rating 3 (Fragile Success)**:
   - Card goes to carry-over queue
   - GUARANTEED to appear in next round
   - Provides reinforcement before long-term scheduling
   - Philosophy: User got it right, but needs confirmation

3. **Rating 4 (Easy)**:
   - **Spot-check mechanism**: Probabilistic decision
   - With 50% chance (default), goes to carry-over for one more review
   - With 50% chance, graduates to long-term review
   - Philosophy: Most cards rated "easy" probably are, but occasional re-check prevents overconfidence

4. **Rating 5 (Very Easy)**:
   - Immediately graduates to long-term review
   - Won't appear again until `nextReviewDate`
   - Philosophy: User demonstrating mastery, no need for reinforcement

### Session Statistics Tracking

For the final summary:

```javascript
function handleRateCard(rating) {
  // Track whether this was a new or review card
  if (currentCard.repetitions === 0) {
    newInSession += 1;      // Never seen before
  } else {
    reviewedInSession += 1; // Has been studied previously
  }
  
  // ... rest of rating logic
}
```

This tracking happens BEFORE the card's `repetitions` is incremented, ensuring accurate categorization.

---

## Queue Management System

### Three-Queue Architecture

The system uses three distinct queues with different purposes:

#### 1. Practice Queue

**Purpose**: The main pool of cards available for the current session

**Lifecycle**:
- **Initialization**: Created when session starts, contains all deck cards shuffled randomly
- **Modification**: Cards are removed (pulled into rounds) but never added back
- **Depletion**: Gradually empties as rounds are built
- **Termination**: Empty when all cards have been pulled into rounds

**Implementation**:
```javascript
const [practiceQueue, setPracticeQueue] = useState<string[]>([]);

// Initialization
useEffect(() => {
  if (questions.length > 0 && !isInitialized) {
    const shuffled = questions.map(c => c.id).sort(() => Math.random() - 0.5);
    setPracticeQueue(shuffled);
    setIsInitialized(true);
  }
}, [questions, isInitialized]);
```

#### 2. Round Queue

**Purpose**: The active working set of cards being studied in the current round

**Lifecycle**:
- **Initialization**: Built at start of each round from carry-over and practice queues
- **Modification**: 
  - Cards removed from front as they're presented
  - Failed cards (rating 1-2) added to back
- **Depletion**: Empty when round is complete
- **Rebuild**: Recreated for each new round

**Implementation**:
```javascript
const [roundQueue, setRoundQueue] = useState<string[]>([]);

// Building
function buildNextRound() {
  let nextRoundIds = [...carryOverQueue];
  setCarryOverQueue([]);
  
  const needed = settings.roundSize - nextRoundIds.length;
  if (needed > 0) {
    const pulled = practiceQueue.splice(0, needed);
    nextRoundIds.push(...pulled);
  }
  
  setRoundQueue(nextRoundIds);
}

// Processing
function handleRateCard(rating) {
  let nextQueue = [...roundQueue.slice(1)]; // Remove current card
  
  if (rating <= 2) {
    nextQueue.push(currentCard.id); // Re-add failed cards
  }
  
  setRoundQueue(nextQueue);
}
```

#### 3. Carry-Over Queue

**Purpose**: Temporary storage for cards that need to appear in the next round

**Lifecycle**:
- **Initialization**: Empty at session start
- **Population**: Cards rated 3 or (sometimes) 4 are added
- **Transfer**: All cards moved to next round queue when round is built
- **Reset**: Cleared after transferring to round queue

**Implementation**:
```javascript
const [carryOverQueue, setCarryOverQueue] = useState<string[]>([]);

// Adding cards
if (rating === 3) {
  setCarryOverQueue(prev => [...prev, currentCard.id]);
} else if (rating === 4) {
  if (Math.random() < (settings.spotCheckChance / 100)) {
    setCarryOverQueue(prev => [...prev, currentCard.id]);
  }
}

// Transferring
function buildNextRound() {
  let nextRoundIds = [...carryOverQueue]; // Start with carry-over
  setCarryOverQueue([]);                  // Clear immediately
  // ... rest of round building
}
```

### Queue State Diagram

```
[Practice Queue]
  │ Shuffle on init
  │ Pull for rounds
  ↓
[Round Queue] ←─ Always starts with ─ [Carry-Over Queue]
  │                                      ↑
  │ Present cards                        │
  │ Rate 1-2 → Re-add to end            │ Rating 3
  │ Rate 3 ────────────────────────────→│ Rating 4 (sometimes)
  │ Rate 4 (sometimes) → Graduate       │
  │ Rate 5 → Graduate                   │
  ↓                                      │
[Long-term Review]                      │
  Scheduled for future session          │
```

### Edge Cases & Special Behaviors

1. **Carry-Over Overflow**: If carry-over queue has 15 cards but roundSize is 10, the round will have all 15 cards
   
2. **Final Round Undersize**: If only 3 cards remain in practice queue and carry-over is empty, round will be 3 cards

3. **All Failures**: If user rates all cards in round as 1-2, the round never ends naturally - cards keep cycling

4. **Empty Deck**: If deck has 0 cards, study button shows alert: "Add some cards to this deck before you can study!"

---

## User Interface Components

### App.tsx (Main Application)

**Responsibilities**:
- Application state management
- Deck and card CRUD operations
- View routing (deck/practice/settings)
- Settings management
- Storage synchronization

**Key State**:
```typescript
const [decks, setDecks] = useState<Deck[]>([]);
const [cards, setCards] = useState<Record<string, Card>>({});
const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
const [studyingDeckId, setStudyingDeckId] = useState<string | null>(null);
const [view, setView] = useState<View>('deck');
const [settings, setSettings] = useState<SRSSettings>(...);
```

### QuizPractice.tsx (Study Session)

**Responsibilities**:
- Session state management
- Queue management (practice, round, carry-over)
- Round building logic
- Card rating processing
- Session statistics tracking

**Key State**:
```typescript
const [practiceQueue, setPracticeQueue] = useState<string[]>([]);
const [roundQueue, setRoundQueue] = useState<string[]>([]);
const [carryOverQueue, setCarryOverQueue] = useState<string[]>([]);
const [roundNumber, setRoundNumber] = useState(0);
const [roundResults, setRoundResults] = useState<number[]>([]);
const [sessionFinished, setSessionFinished] = useState(false);
```

**Flow**:
1. Initialize queues from props
2. Build first round
3. Present cards and collect ratings
4. Show round summary
5. Build next round or end session

### Flashcard.tsx (Individual Card)

**Responsibilities**:
- Card flip animation state
- Answer reveal
- Rating button display
- AI explanation interface
- Follow-up question handling

**Key State**:
```typescript
const [isFlipped, setIsFlipped] = useState(false);
const [chat, setChat] = useState<Chat | null>(null);
const [conversation, setConversation] = useState<{role, text}[]>([]);
const [isWaitingForAI, setIsWaitingForAI] = useState(false);
```

**User Flow**:
1. User sees question
2. User clicks "Visa Svar" (Show Answer)
3. Card flips, showing answer
4. Rating buttons appear
5. (Optional) User clicks "Ask AI to explain"
6. (Optional) User sends follow-up questions
7. User rates card (1-5)
8. Next card appears

### ModuleDisplay.tsx (Deck View)

**Responsibilities**:
- Display deck contents
- Card creation form
- Card list with sorting
- Progress visualization
- Import modal trigger

**Features**:
- **Progress Bar**: Shows overall deck mastery as color-coded segments
- **Sorting**: By easiness (hardest first) or alphabetically
- **Card Preview**: Shows question, answer, tags, and AI explanation indicator
- **Quick Study**: "Study Deck" button to start session

### SettingsView.tsx (Configuration)

**Responsibilities**:
- SRS settings configuration
- Theme management (light/dark/system)
- Card database inspector
- Progress reset functionality

**Inspector Features**:
- **Sortable Columns**: Click headers to sort by any field
- **All Cards**: Shows complete card database across all decks
- **SRS Visibility**: View easinessFactor, interval, repetitions, nextReviewDate
- **Read-Only**: Prevents accidental modifications

### Supporting Components

#### RoundProgressBar.tsx
- Visual representation of round progress
- Color-coded segments for each rating
- Responsive width calculation

#### RoundSummaryModal.tsx
- End-of-round statistics
- Rating breakdown
- Continue/Exit buttons

#### PracticeSummary.tsx
- Session completion screen
- New vs. reviewed card counts
- Return to deck view button

---

## Storage & Persistence

### localStorage Architecture

The application uses browser localStorage for all data persistence:

```javascript
const CARD_STORAGE_KEY = 'srsCards';
const DECK_STORAGE_KEY = 'srsDecks';
const SETTINGS_STORAGE_KEY = 'srsSettings';
```

### Storage Manager API

The `storageManager` object provides a unified interface for all persistence operations:

#### Settings Operations

```javascript
// Save settings (called automatically on change)
storageManager.saveSettings(settings);

// Load settings (called on app initialization)
const settings = storageManager.loadSettings();
// Returns: Merged with defaults to handle schema changes
```

#### Deck Operations

```javascript
// Get all decks
const decks = storageManager.getAllDecks();
// Returns: Deck[]

// Create new deck
const newDeck = storageManager.createDeck("My Deck");
// Returns: Deck with generated UUID

// Delete deck and all its cards
storageManager.deleteDeck(deckId);
// Side effect: Removes deck and all associated cards
```

#### Card Operations

```javascript
// Get all cards (as object map)
const cards = storageManager.getAllCards();
// Returns: Record<string, Card>

// Save single card
storageManager.saveCard(card);

// Create new card
const newCard = storageManager.createCard(
  deckId, 
  "Question?", 
  "Answer", 
  settings
);

// Bulk create cards
const newCards = storageManager.createMultipleCards(
  deckId,
  [
    { question: "Q1", answer: "A1", tags: ["tag1"] },
    { question: "Q2", answer: "A2" }
  ],
  settings
);
```

#### Initialization & Reset

```javascript
// Initialize with default data if empty
storageManager.initializeDefaultData();
// Checks if decks exist, creates default deck if not

// Reset everything
storageManager.resetAllProgress();
// Removes all data from localStorage
```

### Data Persistence Flow

1. **App Startup**:
   ```javascript
   useEffect(() => {
     storageManager.initializeDefaultData();
     const loadedDecks = storageManager.getAllDecks();
     const loadedCards = storageManager.getAllCards();
     setDecks(loadedDecks);
     setCards(loadedCards);
   }, []);
   ```

2. **Settings Changes**:
   ```javascript
   useEffect(() => {
     storageManager.saveSettings(settings);
   }, [settings]);
   ```

3. **Card Updates (during study)**:
   ```javascript
   function handleUpdateCard(updatedCard) {
     storageManager.saveCard(updatedCard);
     setCards(prevCards => ({
       ...prevCards,
       [updatedCard.id]: updatedCard
     }));
   }
   ```

### Storage Schema Evolution

The system handles schema changes gracefully:

```javascript
loadSettings(): SRSSettings {
  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    // Merge with defaults to ensure all keys present
    return { ...DEFAULT_SRS_SETTINGS, ...parsed };
  }
  return DEFAULT_SRS_SETTINGS;
}
```

This ensures that if new settings are added in a future version, existing users get sensible defaults.

---

## AI Integration Features

### Google Gemini Integration

The application integrates with Google's Gemini AI API for explanation generation.

**API Setup**:
```javascript
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });
const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
```

### Explanation Generation

When a user clicks "Ask AI to explain":

1. **Initial Prompt Construction**:
   ```javascript
   const prompt = `Please provide a concise explanation for the following flashcard, 
   assuming the user is a student trying to understand the concept. 
   Format the explanation clearly using Markdown.
   
   Question:
   ${card.question}
   
   Answer:
   ${card.answer}`;
   ```

2. **API Call**:
   ```javascript
   const response = await chat.sendMessage({ message: prompt });
   ```

3. **Caching**:
   ```javascript
   const updatedCard = { 
     ...card, 
     aiExplanation: response.text 
   };
   onUpdateCard(updatedCard); // Persists to storage
   ```

4. **Display**:
   - Rendered as Markdown
   - Shown in collapsible section below answer
   - Available immediately on future views of this card

### Conversational Follow-Up

After initial explanation, users can ask follow-up questions:

1. **Chat Persistence**:
   ```javascript
   const chat = ai.chats.create({
     model: 'gemini-2.5-flash',
     history: [
       {
         role: 'user',
         parts: [{ text: initialPrompt }]
       },
       {
         role: 'model',
         parts: [{ text: card.aiExplanation }]
       }
     ]
   });
   ```

2. **Follow-Up Flow**:
   ```javascript
   async function handleSendFollowUp(userMessage) {
     setConversation(prev => [
       ...prev, 
       { role: 'user', text: userMessage }
     ]);
     
     const response = await chat.sendMessage({ message: userMessage });
     
     setConversation(prev => [
       ...prev,
       { role: 'model', text: response.text }
     ]);
   }
   ```

### AI UI States

The AI explanation interface has multiple states:

1. **Hidden**: No explanation requested yet
2. **Initial Button**: "Ask AI to explain" button visible
3. **Loading**: Spinner with "Thinking..." text
4. **Explanation Display**: 
   - Cached explanation shown immediately
   - Follow-up input field available
5. **Follow-Up Loading**: "AI is typing..." indicator
6. **Error**: Error message with retry option

### Explanation Indicator

In the deck view, cards with cached AI explanations show a star icon:

```javascript
{card.aiExplanation && (
  <button className="star-icon" onClick={() => viewExplanation(card.aiExplanation)}>
    ⭐
  </button>
)}
```

This allows users to quickly review explanations without entering study mode.

---

## Testing & Quality Assurance

### Unit Tests (srs.test.ts)

The application includes comprehensive tests for the SRS algorithm:

#### Test: Reset on Failure
```javascript
it('should reset progress on failure (rating < 3)', () => {
  const card = { ...baseCard, repetitions: 5, interval: 10 };
  const updated = updateCardSRSData(card, 2, DEFAULT_SRS_SETTINGS);
  
  expect(updated.repetitions).toBe(0);
  expect(updated.interval).toBe(1);
});
```

**Validates**: Failed cards reset to beginning of learning sequence

#### Test: First Success Interval
```javascript
it('should set interval to 1 day on first success', () => {
  const updated = updateCardSRSData(baseCard, 3, DEFAULT_SRS_SETTINGS);
  
  expect(updated.repetitions).toBe(1);
  expect(updated.interval).toBe(1);
});
```

**Validates**: First successful review schedules next review for tomorrow

#### Test: Second Success Interval
```javascript
it('should set interval to 6 days on second success', () => {
  const card = { ...baseCard, repetitions: 1, interval: 1 };
  const updated = updateCardSRSData(card, 4, DEFAULT_SRS_SETTINGS);
  
  expect(updated.repetitions).toBe(2);
  expect(updated.interval).toBe(6);
});
```

**Validates**: Second success implements the special 6-day interval

#### Test: Easiness Increase
```javascript
it('should increase easiness factor for high ratings', () => {
  const card = { ...baseCard, easinessFactor: 2.5 };
  const updated = updateCardSRSData(card, 5, DEFAULT_SRS_SETTINGS);
  
  expect(updated.easinessFactor).toBeGreaterThan(2.5);
  expect(updated.easinessFactor).toBeCloseTo(2.6);
});
```

**Validates**: Rating 5 increases easiness factor by ~0.1

#### Test: Easiness Decrease
```javascript
it('should decrease easiness factor for low ratings', () => {
  const card = { ...baseCard, easinessFactor: 2.5 };
  const updated = updateCardSRSData(card, 3, DEFAULT_SRS_SETTINGS);
  
  expect(updated.easinessFactor).toBeLessThan(2.5);
});
```

**Validates**: Ratings below 4 decrease easiness factor

### Testing Strategy

The test suite focuses on:

1. **Algorithm Correctness**: Ensuring SRS formulas produce expected results
2. **Edge Cases**: Testing boundary conditions (min easiness, interval = 0, etc.)
3. **State Transitions**: Verifying proper state changes on rating
4. **Isolation**: Testing pure functions without side effects

### Manual Testing Checklist

For comprehensive quality assurance, manual testing should cover:

- [ ] **Deck Management**
  - [ ] Create deck
  - [ ] Delete deck (with confirmation)
  - [ ] Select different decks
  
- [ ] **Card Management**
  - [ ] Add card via form
  - [ ] Import cards from text
  - [ ] View cards with markdown rendering
  - [ ] Sort cards by easiness and alphabetically
  
- [ ] **Study Session**
  - [ ] Start session with adequate cards
  - [ ] Start session with fewer cards than roundSize
  - [ ] Rate cards 1-5 and observe routing
  - [ ] Verify failed cards reappear in round
  - [ ] Verify rating 3 cards appear in next round
  - [ ] Complete multiple rounds
  - [ ] End session early
  
- [ ] **AI Features**
  - [ ] Request explanation (first time)
  - [ ] View cached explanation
  - [ ] Send follow-up question
  - [ ] Handle API errors gracefully
  
- [ ] **Settings**
  - [ ] Modify roundSize and see effect
  - [ ] Adjust spotCheckChance
  - [ ] Change easiness settings
  - [ ] Switch themes (light/dark/system)
  - [ ] Use database inspector
  - [ ] Reset all data
  
- [ ] **Persistence**
  - [ ] Refresh page and verify state persists
  - [ ] Close and reopen browser
  - [ ] Clear localStorage and verify default data loads

---

## Implementation Details

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode
- **Testing**: Vitest
- **AI SDK**: @google/genai
- **UUID Generation**: uuid v4
- **Markdown Rendering**: Custom MarkdownRenderer component

### Project Structure

```
frontend/
├── components/
│   ├── Flashcard.tsx              # Individual card display
│   ├── QuizPractice.tsx           # Study session orchestration
│   ├── ModuleDisplay.tsx          # Deck view
│   ├── SettingsView.tsx           # Settings and inspector
│   ├── RoundProgressBar.tsx       # Visual progress indicator
│   ├── RoundSummaryModal.tsx      # Round completion modal
│   ├── PracticeSummary.tsx        # Session completion screen
│   ├── Sidebar.tsx                # Navigation sidebar
│   ├── Header.tsx                 # App header
│   ├── CreateDeckModal.tsx        # Deck creation dialog
│   ├── ImportCardsModal.tsx       # Bulk import dialog
│   ├── AIExplanationModal.tsx     # Explanation viewer
│   └── MarkdownRenderer.tsx       # Markdown display
├── services/
│   ├── srs.ts                     # SRS algorithm & storage
│   ├── srs.test.ts                # SRS unit tests
│   └── defaultData.ts             # Initial deck & cards
├── App.tsx                        # Main application
├── types.ts                       # TypeScript interfaces
└── index.tsx                      # Application entry point
```

### Key Design Patterns

#### 1. Controlled Components
All forms use controlled components with React state:
```javascript
<textarea
  value={newQuestion}
  onChange={(e) => setNewQuestion(e.target.value)}
/>
```

#### 2. Lifting State Up
Card data lives in App.tsx and flows down via props:
```javascript
<QuizPractice 
  questions={cardsForPractice}
  onUpdateCard={handleUpdateCard}
/>
```

#### 3. Separation of Concerns
- **Components**: UI rendering and user interaction
- **Services**: Business logic and data persistence
- **Types**: Data structure definitions

#### 4. Immutable Updates
State updates never mutate existing objects:
```javascript
const updatedCard = { ...card, lastRating: rating };
setCards(prev => ({ ...prev, [card.id]: updatedCard }));
```

### Performance Optimizations

#### useMemo for Expensive Computations
```javascript
const cardsInSelectedDeck = useMemo(() => {
  return Object.values(cards)
    .filter(c => c.deckId === selectedDeckId)
    .sort((a, b) => a.easinessFactor - b.easinessFactor);
}, [cards, selectedDeckId, sortKey]);
```

#### useCallback for Stable Function References
```javascript
const buildNextRound = useCallback(() => {
  // Round building logic
}, [practiceQueue, carryOverQueue, settings]);
```

#### Card Map for O(1) Lookups
```javascript
const cardMap = useMemo(() => {
  return questions.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});
}, [questions]);
```

### Accessibility Features

- **Semantic HTML**: Proper use of `<header>`, `<main>`, `<button>`, etc.
- **ARIA Labels**: Screen reader descriptions for controls
- **Keyboard Navigation**: All interactive elements keyboard-accessible
- **Color + Text**: Never rely on color alone (e.g., rating labels + colors)
- **Focus Management**: Proper focus indicators on interactive elements

### Dark Mode Implementation

```javascript
useEffect(() => {
  const applyTheme = (theme) => {
    if (theme === 'dark' || 
        (theme === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  applyTheme(currentTheme);
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (currentTheme === 'system') {
    mediaQuery.addEventListener('change', applyTheme);
  }
  
  return () => mediaQuery.removeEventListener('change', applyTheme);
}, [currentTheme]);
```

### Error Handling

#### localStorage Errors
```javascript
loadSettings(): SRSSettings {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      return { ...DEFAULT_SRS_SETTINGS, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return DEFAULT_SRS_SETTINGS;
}
```

#### AI API Errors
```javascript
try {
  const response = await chat.sendMessage({ message: prompt });
  setConversation(prev => [...prev, { role: 'model', text: response.text }]);
} catch (error) {
  console.error("Error fetching AI explanation:", error);
  setAiError("Sorry, I couldn't fetch an explanation right now.");
} finally {
  setIsWaitingForAI(false);
}
```

### Security Considerations

1. **API Key Storage**: 
   - API key stored in environment variable
   - Not committed to version control
   - `.env.example` file provides template

2. **Input Sanitization**:
   - Markdown rendering escapes HTML by default
   - No direct HTML injection points

3. **localStorage Limits**:
   - Browser enforces ~5-10MB limit
   - Large decks may hit quota
   - Consider implementing export/import for large datasets

---

## Conclusion

This flashcard application represents a comprehensive implementation of spaced repetition learning theory, combining:

- **Proven Algorithm**: SuperMemo 2-based SRS with practical modifications
- **Flexible Configuration**: User-adjustable parameters for personalization
- **Intelligent Routing**: Multi-queue system for optimal card presentation
- **AI Enhancement**: On-demand explanations for difficult concepts
- **Robust Persistence**: localStorage-based data management
- **Polished UX**: Visual feedback, progress tracking, and responsive design

The system is designed to be:
- **Effective**: Maximizes retention through scientifically-backed spacing
- **Efficient**: Minimizes study time by focusing on weak areas
- **Engaging**: Provides immediate feedback and visual progress
- **Extensible**: Clean architecture allows for future enhancements

### Future Enhancement Opportunities

1. **Statistics Dashboard**: Long-term progress tracking and analytics
2. **Cloud Sync**: Multi-device support via backend API
3. **Shared Decks**: Community deck sharing and import
4. **Image Support**: Visual flashcards for memory techniques
5. **Audio Pronunciation**: TTS for language learning
6. **Gamification**: Streaks, achievements, and leaderboards
7. **Advanced Scheduling**: Time-of-day optimization, predictive modeling
8. **Mobile App**: Native iOS/Android implementations

### References

- **SuperMemo 2 Algorithm**: Original spaced repetition research by Piotr Woźniak
- **Ebbinghaus Forgetting Curve**: Foundation of spacing effect
- **Memory Research**: Cognitive psychology principles applied to learning
- **Google Gemini AI**: Large language model for explanation generation

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-12  
**Author**: System Documentation  
**Maintained By**: Development Team
