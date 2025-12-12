import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DeckView from './components/ModuleDisplay'; // Using the same file, but it's now a DeckView
import Header from './components/Header';
import QuizPractice from './components/QuizPractice';
import { storageManager } from './services/srs';
import { api } from './services/api';
import { Deck, Card, SRSSettings } from './types';
import CreateDeckModal from './components/CreateDeckModal';
import ImportCardsModal from './components/ImportCardsModal';
import SettingsView from './components/SettingsView';
import { defaultDeck, defaultCards } from './services/defaultData';

type View = 'deck' | 'practice' | 'settings';
type SortKey = 'easiness' | 'alphabetical';

function App() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [studyingDeckId, setStudyingDeckId] = useState<string | null>(null);
  const [view, setView] = useState<View>('deck');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('easiness');

  const [settings, setSettings] = useState<SRSSettings>(() => storageManager.loadSettings());
  const [isMigrating, setIsMigrating] = useState(false);

  const fetchData = async () => {
    try {
      const [loadedDecks, loadedCards] = await Promise.all([
        api.getAllDecks(),
        api.getAllCards()
      ]);
      setDecks(loadedDecks);
      setCards(loadedCards);

      return { loadedDecks, loadedCards };
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      return { loadedDecks: [], loadedCards: {} };
    }
  };

  const performMigration = async (currentDecks: Deck[]) => {
    if (currentDecks.length > 0) return; // Backend already has data

    setIsMigrating(true);
    try {
      // Check LocalStorage for legacy data
      const legacyDecks = storageManager.getAllDecks();

      if (legacyDecks.length > 0) {
        // Migrate Legacy Data
        console.log("Migrating legacy data to backend...");
        const legacyCards = storageManager.getAllCards();

        for (const deck of legacyDecks) {
          // Create deck on backend
          const newDeck = await api.createDeck(deck.name);

          // Find cards for this deck
          const cardsForDeck = Object.values(legacyCards).filter(c => c.deckId === deck.id);
          const formattedCards = cardsForDeck.map(c => ({
            question: c.question,
            answer: c.answer,
            tags: c.tags
          }));

          if (formattedCards.length > 0) {
            await api.createMultipleCards(newDeck.id, formattedCards, settings);
          }
        }
        alert("Migration Complete! Your LocalStorage data has been moved to the database.");
      } else {
        // Seed Default Data (Clean Install)
        console.log("Seeding default data to backend...");
        const newDeck = await api.createDeck(defaultDeck.name);
        await api.createMultipleCards(newDeck.id, defaultCards, settings);
      }

      // Refresh data after migration
      const { loadedDecks, loadedCards } = await fetchData();
      if (loadedDecks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(loadedDecks[0].id);
      }

    } catch (error) {
      console.error("Migration failed", error);
      alert("Migration failed. Please check console.");
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    fetchData().then(({ loadedDecks }) => {
      performMigration(loadedDecks);
    });
  }, []);

  useEffect(() => {
    storageManager.saveSettings(settings);
  }, [settings]);

  const handleCreateDeck = () => {
    setIsCreateDeckModalOpen(true);
  };

  const handleConfirmCreateDeck = async (deckName: string) => {
    try {
      const newDeck = await api.createDeck(deckName);
      setDecks(prev => [newDeck, ...prev]);
      setSelectedDeckId(newDeck.id);
      setView('deck');
      setIsSidebarOpen(false); // For mobile
      setIsCreateDeckModalOpen(false);
    } catch (e) {
      alert("Failed to create deck");
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (window.confirm(`Are you sure you want to delete this deck and all its cards? This action cannot be undone.`)) {
      try {
        await api.deleteDeck(deckId);
        await fetchData(); // Reload all data to be safe and simple
      } catch (e) {
        alert("Failed to delete deck");
      }
    }
  };

  const handleSelectDeck = (id: string) => {
    setSelectedDeckId(id);
    setView('deck');
    setStudyingDeckId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectSettings = () => {
    setView('settings');
    setSelectedDeckId(null);
    setStudyingDeckId(null);
    setIsSidebarOpen(false);
  };

  const handleCreateCard = async (deckId: string, question: string, answer: string) => {
    try {
      const newCard = await api.createCard(deckId, question, answer, settings);
      setCards(prev => ({ ...prev, [newCard.id]: newCard }));
    } catch (e) {
      alert("Failed to create card");
    }
  };

  const handleBulkCreateCards = async (parsedCards: { question: string; answer: string; tags?: string[] }[]) => {
    if (!selectedDeckId) {
      alert("Please select a deck first.");
      return;
    }
    try {
      const newCards = await api.createMultipleCards(selectedDeckId, parsedCards, settings);

      setCards(prev => {
        const updatedCards = { ...prev };
        newCards.forEach(card => {
          updatedCards[card.id] = card;
        });
        return updatedCards;
      });

      setIsImportModalOpen(false);
    } catch (e) {
      alert("Failed to import cards");
    }
  };

  const handleStudyDeck = (deckId: string) => {
    const deckCards = Object.values(cards).filter((c: Card) => c.deckId === deckId);
    if (deckCards.length > 0) {
      setStudyingDeckId(deckId);
      setView('practice');
    } else {
      alert("Add some cards to this deck before you can study!");
    }
  };

  const handleExitPractice = () => {
    setView('deck');
    setStudyingDeckId(null);
    fetchData(); // Refresh data to get latest nextReviewDates etc (though we update optimistic locally too)
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    // Optimistic update
    setCards(prevCards => ({
      ...prevCards,
      [updatedCard.id]: updatedCard
    }));

    try {
      await api.updateCard(updatedCard);
    } catch (e) {
      console.error("Failed to update card remotely", e);
      // Could revert here if needed
    }
  };

  const handleResetAllProgress = () => {
    alert("This feature is currently disabled on the backend integration version.");
    // We could implement a backend endpoint to wipe DB if really needed.
  };

  const selectedDeck = useMemo(() => {
    const currentId = studyingDeckId || selectedDeckId;
    return decks.find(d => d.id === currentId) || null;
  }, [decks, selectedDeckId, studyingDeckId]);

  const cardsInSelectedDeck = useMemo(() => {
    if (!selectedDeckId) return [];
    const filteredCards = Object.values(cards).filter((c: Card) => c.deckId === selectedDeckId)

    if (sortKey === 'easiness') {
      // Sort by easinessFactor ascending (lower is harder)
      return filteredCards.sort((a: Card, b: Card) => a.easinessFactor - b.easinessFactor);
    }
    // 'alphabetical'
    return filteredCards.sort((a: Card, b: Card) => a.question.localeCompare(b.question));
  }, [cards, selectedDeckId, sortKey]);

  const cardsForPractice = useMemo(() => {
    if (!studyingDeckId) return [];
    return Object.values(cards).filter((c: Card) => c.deckId === studyingDeckId);
  }, [cards, studyingDeckId]);

  const renderMainContent = () => {
    switch (view) {
      case 'practice':
        return <QuizPractice
          title={`Studying: ${selectedDeck?.name || 'Deck'}`}
          questions={cardsForPractice}
          settings={settings}
          onExit={handleExitPractice}
          onUpdateCard={handleUpdateCard}
        />;
      case 'settings':
        return <SettingsView
          settings={settings}
          setSettings={setSettings}
          onResetAll={handleResetAllProgress}
          cards={Object.values(cards)}
          decks={decks}
        />;
      case 'deck':
      default:
        return <DeckView
          deck={selectedDeck}
          cards={cardsInSelectedDeck}
          onCreateCard={handleCreateCard}
          onStudyDeck={handleStudyDeck}
          onBulkAdd={() => setIsImportModalOpen(true)}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
        />
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar
        decks={decks}
        selectedDeckId={selectedDeckId}
        onSelectDeck={handleSelectDeck}
        onCreateDeck={handleCreateDeck}
        onDeleteDeck={handleDeleteDeck}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onSelectSettings={handleSelectSettings}
        currentView={view}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderMainContent()}
        </main>
      </div>
      <CreateDeckModal
        isOpen={isCreateDeckModalOpen}
        onClose={() => setIsCreateDeckModalOpen(false)}
        onCreate={handleConfirmCreateDeck}
      />
      <ImportCardsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkCreateCards}
      />
    </div>
  );
}

export default App;