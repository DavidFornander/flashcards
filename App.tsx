import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DeckView from './components/ModuleDisplay'; // Using the same file, but it's now a DeckView
import Header from './components/Header';
import QuizPractice from './components/QuizPractice';
import { storageManager } from './services/srs';
import { Deck, Card, SRSSettings } from './types';
import CreateDeckModal from './components/CreateDeckModal';
import ImportCardsModal from './components/ImportCardsModal';
import SettingsView from './components/SettingsView';

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

  useEffect(() => {
    storageManager.initializeDefaultData(); // Ensure default data exists on first load

    const loadedDecks = storageManager.getAllDecks();
    const loadedCards = storageManager.getAllCards();
    setDecks(loadedDecks);
    setCards(loadedCards);
    if (loadedDecks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(loadedDecks[0].id);
    }
  }, []);

  useEffect(() => {
    storageManager.saveSettings(settings);
  }, [settings]);

  const handleCreateDeck = () => {
    setIsCreateDeckModalOpen(true);
  };

  const handleConfirmCreateDeck = (deckName: string) => {
    const newDeck = storageManager.createDeck(deckName);
    setDecks(prev => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
    setView('deck');
    setIsSidebarOpen(false); // For mobile
    setIsCreateDeckModalOpen(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm(`Are you sure you want to delete this deck and all its cards? This action cannot be undone.`)) {
      storageManager.deleteDeck(deckId);
      
      const loadedDecks = storageManager.getAllDecks();
      const loadedCards = storageManager.getAllCards();
      setDecks(loadedDecks);
      setCards(loadedCards);
      
      if (selectedDeckId === deckId) {
        setSelectedDeckId(loadedDecks.length > 0 ? loadedDecks[0].id : null);
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
  
  const handleCreateCard = (deckId: string, question: string, answer: string) => {
      const newCard = storageManager.createCard(deckId, question, answer, settings);
      setCards(prev => ({...prev, [newCard.id]: newCard}));
  };

  const handleBulkCreateCards = (parsedCards: { question: string; answer: string; tags?: string[] }[]) => {
    if (!selectedDeckId) {
        alert("Please select a deck first.");
        return;
    }
    const newCards = storageManager.createMultipleCards(selectedDeckId, parsedCards, settings);
    
    setCards(prev => {
        const updatedCards = {...prev};
        newCards.forEach(card => {
            updatedCards[card.id] = card;
        });
        return updatedCards;
    });

    setIsImportModalOpen(false);
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
  };

  const handleUpdateCard = (updatedCard: Card) => {
    storageManager.saveCard(updatedCard);
    setCards(prevCards => ({
      ...prevCards,
      [updatedCard.id]: updatedCard
    }));
  };

  const handleResetAllProgress = () => {
    if (window.confirm("Are you absolutely sure? This will permanently delete ALL decks, cards, study progress, and settings.")) {
        if (prompt("To confirm, please type 'DELETE' in all capital letters.") === "DELETE") {
            storageManager.resetAllProgress();
            window.location.reload();
        } else {
            alert("Reset cancelled. Confirmation phrase not matched.");
        }
    }
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
        // FIX: Explicitly type sort callback arguments to resolve type inference issue.
        return filteredCards.sort((a: Card, b: Card) => a.easinessFactor - b.easinessFactor);
      } 
      // 'alphabetical'
      // FIX: Explicitly type sort callback arguments to resolve type inference issue.
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