### **Technical Specification: Adaptive Spaced Repetition Algorithm v4.0**

**Document Version:** 2.1
**Date:** October 2, 2025
**Author:** Gemini AI Services

#### **1.0 Overview & Objectives**

This document specifies the design and logic for a highly configurable, smart flashcard study system. The primary objective is to create an efficient and motivating learning experience that maximizes long-term knowledge retention while preventing cognitive overload. The algorithm's core behaviors are controlled by a set of user-configurable parameters, allowing for a personalized study methodology.

#### **2.0 Configurable Algorithm Parameters**

The following variables control the behavior of the learning algorithm. They are exposed to the user in an "Advanced Settings" panel, with clear explanations and sensible defaults.

* **`roundSize`**
    * **Description:** The target number of cards in each study round.
    * **Default Value:** `10`
* **`spotCheckChance`**
    * **Description:** The percentage chance (from 0 to 100) that a card rated '4' (Well) will be shown again in the next round instead of being scheduled for a long-term review.
    * **Default Value:** `50`
* **`newCardFillRatio`**
    * **Description:** The percentage (from 0 to 100) of "new" (never-before-seen) cards that should be used to fill the empty slots in a new round. The remaining slots will be filled by "review" (due for spaced repetition) cards.
    * **Default Value:** `50`
* **`defaultEasinessFactor`**
    * **Description:** The starting "easiness" score for all new cards. Higher values mean the card's review interval will grow faster.
    * **Default Value:** `2.5`
* **`minEasinessFactor`**
    * **Description:** The absolute minimum "easiness" a card can have. This prevents cards that are consistently difficult from having their review intervals shrink to zero.
    * **Default Value:** `1.3`

#### **3.0 Core Concepts & Data Model**

**3.1 Definitions**
* **Deck:** The complete collection of flashcards.
* **Study Session:** A single, continuous period of study.
* **New Card Queue:** A prioritized queue of cards from the Deck that the user has never seen before.
* **Review Queue:** A prioritized queue of cards that are due for spaced repetition (`nextReviewDate` is on or before the current date).
* **Carry-Over Queue:** A temporary queue of cards that were rated '3' or '4' in a previous round and are waiting to be included in the next round.
* **Round:** A small, active working set of cards, with the size determined by the `roundSize` parameter.

**3.2 Card Data Model**
Each `Card` object requires the following persistent attributes:
* `cardId`, `deckId`, `prompt`, `answer`
* `easinessFactor` (Number): Default: `defaultEasinessFactor`. Minimum: `minEasinessFactor`.
* `interval` (Integer): Default: `0`.
* `repetitions` (Integer): Default: `0`.
* `nextReviewDate` (Date/Timestamp): Default: Current date.
* `lastRating` (Integer, Optional): The numerical rating (1-5) from the card's most recent review. Used for UI feedback.

#### **4.0 Study Session Workflow**

**4.1 Session Initialization**
1.  The user selects a Deck and a Session Mode (see 4.3).
2.  The system populates the **New Card Queue** and the **Review Queue** from the Deck. The Review Queue is prioritized with the most difficult (lowest `easinessFactor`) and most overdue cards first.
3.  The **Carry-Over Queue** is initialized as empty.

**4.2 The Round Lifecycle (Refined)**
1.  **Start Round & Populate Queue:** A new **Round Queue** is built with the goal of reaching `roundSize`.
    * **Step 1: Add Carry-Over Cards.** All cards from the `Carry-Over Queue` are moved into the new Round Queue. The `Carry-Over Queue` is then cleared.
    * **Step 2: Calculate Needed Cards.** The number of remaining slots is calculated: `neededCards = roundSize - current_Round_Queue_size`. If `neededCards <= 0`, the round begins immediately.
    * **Step 3: Determine Card Mix.** The number of new vs. review cards to pull is calculated based on `newCardFillRatio`:
        * `newCardsToPull = round(neededCards * (newCardFillRatio / 100))`
        * `reviewCardsToPull = neededCards - newCardsToPull`
    * **Step 4: Fill the Round.** Pull the calculated number of cards from the top of the **New Card Queue** and the **Review Queue** and add them to the Round Queue.
2.  **Process Cards:** Cards are presented to the user one by one from the Round Queue. For each card, the processing logic in Section 5.0 is executed.
3.  **End Round:** The round is complete when the Round Queue is empty. A summary of the round's performance is displayed (see 7.2).
4.  **Continue Session:** The user initiates the next round, which returns to Step 1 of the lifecycle.

**4.3 Alternative Session Modes**
The user can choose between two modes when starting a study session:
* **Adaptive Repetition (Standard Mode):** Follows the full lifecycle described in 4.2, creating an optimized mix of new and due review cards.
* **Repetera Kommande (Upcoming Review Mode):** A specialized mode that bypasses the standard queue logic. It creates a session consisting solely of the `roundSize` number of cards that have the soonest `nextReviewDate`, regardless of whether that date has passed.

#### **5.0 Card Rating and Processing Logic**

This two-step process is executed immediately after a user rates a card.

**Step A: Update Persistent SRS Data (The "Memory" Step)**
The system first calls the `UpdateCardSRSData(card, rating)` function. This ensures the card's persistent attributes (`easinessFactor`, `lastRating`, etc.) are immediately modified to reflect the feedback.

**Step B: Determine Card Routing (The "Action" Step)**
After the card's data is updated, the system routes the card:

* **Rating 1 or 2 (Failure):** The card is re-inserted at the end of the **current Round Queue**.
* **Rating 3 (Fragile Success):** The card is moved to the **Carry-Over Queue** to be included in the next round.
* **Rating 4 (Confident Success):** A probabilistic check is performed using `spotCheckChance`.
    * If `random_number < (spotCheckChance / 100)`, the card is moved to the **Carry-Over Queue**.
    * Otherwise, the card is "graduated." The `ScheduleForLongTermReview(card)` function is called.
* **Rating 5 (Mastery):** The card is "graduated." The `ScheduleForLongTermReview(card)` function is called.

#### **6.0 Algorithm Details & Formulas**

**6.1 `UpdateCardSRSData(card, rating)` Function**
This function modifies the core SRS attributes of a card.

1.  **Adjust Easiness Factor:** `easiness_modifier = -0.8 + (0.28 * rating) - (0.02 * rating^2)`; `card.easinessFactor += easiness_modifier`. Enforce `minEasinessFactor`.
2.  **Handle Repetition Sequence:**
    * If `rating < 3` (Failure), reset `card.repetitions` to `0` and `card.interval` to `1`.
    * If `rating ≥ 3` (Success), increment `card.repetitions`. The new `card.interval` is calculated as follows:
        * On the **1st** successful repetition, `interval` is set to `1` day.
        * On the **2nd** successful repetition, `interval` is set to `6` days.
        * On **all subsequent** successful repetitions, `interval` is calculated as `round(previous_interval * easinessFactor)`.

**6.2 `ScheduleForLongTermReview(card)` Function**
This function sets the final review date for a graduated card.

1.  Read the `card.interval` value.
2.  Set `card.nextReviewDate` to `current_date + card.interval` days.

#### **7.0 User Experience & Interface Elements**

* **Algorithm Explanation:** A collapsible "How it Works" guide is available on the practice setup screen to explain the algorithm's behavior and configurable parameters.
* **Round Progress Bar:** During a round, a segmented progress bar at the top of the screen provides real-time visual feedback. Each segment represents a card and is colored according to the rating given.
* **Round Summary Modal:** At the end of each round, a modal appears, showing a visual and numerical summary of the user's performance for that round before proceeding to the next.
* **Backend Inspector:** An advanced, read-only view is available from the header, allowing the user to inspect the current SRS state (`easinessFactor`, `nextReviewDate`, etc.) of all cards in the system.
