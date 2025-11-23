import React, { useState } from 'react';
import { Deck, Card } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import AIExplanationModal from './AIExplanationModal';

type SortKey = 'easiness' | 'alphabetical';

interface DeckViewProps {
    deck: Deck | null;
    cards: Card[];
    onCreateCard: (deckId: string, question: string, answer: string) => void;
    onStudyDeck: (deckId: string) => void;
    onBulkAdd: () => void;
    sortKey: SortKey;
    onSortKeyChange: (key: SortKey) => void;
}

const getRatingColorClass = (rating: number | undefined): string => {
  switch (rating) {
    case 1: return 'bg-red-500';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-blue-500';
    case 5: return 'bg-green-500';
    default: return 'bg-transparent';
  }
};

const DeckView: React.FC<DeckViewProps> = ({ deck, cards, onCreateCard, onStudyDeck, onBulkAdd, sortKey, onSortKeyChange }) => {
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [viewingExplanation, setViewingExplanation] = useState<string | null>(null);
    
    if (!deck) {
        return (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Welcome to My Flashcards</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Select a deck from the menu or create a new one to get started.</p>
            </div>
          </div>
        );
      }

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion.trim() && newAnswer.trim()) {
            onCreateCard(deck.id, newQuestion.trim(), newAnswer.trim());
            setNewQuestion('');
            setNewAnswer('');
        }
    };
    
    const getProgressBarColor = (rating: number | undefined): string => {
        switch (rating) {
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-blue-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-300 dark:bg-gray-600'; // For new, unrated cards
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {deck.name}
                    </h2>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
                        {cards.length} card{cards.length !== 1 ? 's' : ''} in this deck.
                    </p>
                </div>
                <button 
                    onClick={() => onStudyDeck(deck.id)} 
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:focus:ring-offset-gray-800"
                >
                    Study Deck
                </button>
            </header>
            
            <section className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Add New Card</h3>
                  <button 
                    onClick={onBulkAdd}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Import from Text
                  </button>
                </div>
                <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                        <label htmlFor="question" className="sr-only">Question</label>
                        <textarea
                            id="question"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Question"
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="answer" className="sr-only">Answer</label>
                        <textarea
                            id="answer"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="Answer"
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Add Card
                    </button>
                </form>
            </section>

            {cards.length > 0 && (
                <section className="mb-10">
                    <div className="w-full flex h-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700" role="progressbar" aria-label="Deck mastery progress">
                        {cards.map(card => (
                            <div
                                key={card.id}
                                className={`h-full ${getProgressBarColor(card.lastRating)}`}
                                style={{ width: `${100 / cards.length}%` }}
                            />
                        ))}
                    </div>
                </section>
            )}
            
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Cards in Deck</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortKey}
                                onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
                                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                aria-label="Sort cards by"
                            >
                                <option value="easiness">Hardest First</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {cards.length > 0 ? (
                        cards.map(card => (
                            <div key={card.id} className="relative overflow-hidden p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${getRatingColorClass(card.lastRating)}`}></div>
                                {card.aiExplanation && (
                                    <button 
                                        onClick={() => setViewingExplanation(card.aiExplanation || null)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 transition-colors z-10"
                                        aria-label="View AI Explanation"
                                        title="View AI Explanation"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </button>
                                )}
                                <div className="font-semibold text-gray-800 dark:text-gray-200 pt-2">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <div className="[&>p]:m-0"> {/* Removes margin from markdown paragraph */}
                                            <MarkdownRenderer>{card.question}</MarkdownRenderer>
                                        </div>
                                        {card.tags && card.tags.length > 0 && (
                                            <div className="inline-flex flex-wrap items-center gap-2">
                                                {card.tags.map((tag, index) => (
                                                    <span key={index} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                                <div className="text-gray-700 dark:text-gray-300">
                                    <MarkdownRenderer>{card.answer}</MarkdownRenderer>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No cards in this deck yet. Add one above!</p>
                        </div>
                    )}
                </div>
            </section>

            <AIExplanationModal 
                isOpen={viewingExplanation !== null}
                onClose={() => setViewingExplanation(null)}
                explanation={viewingExplanation || ''}
            />
        </div>
    );
};

export default DeckView;