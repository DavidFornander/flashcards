import React from 'react';
import { Deck } from '../types';

interface SidebarProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onSelectDeck: (id: string) => void;
  onCreateDeck: () => void;
  onDeleteDeck: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectSettings: () => void;
  currentView: 'deck' | 'practice' | 'settings';
}

const Sidebar: React.FC<SidebarProps> = ({ decks, selectedDeckId, onSelectDeck, onCreateDeck, onDeleteDeck, isOpen, setIsOpen, onSelectSettings, currentView }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`w-64 bg-white dark:bg-gray-800 p-4 space-y-2 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-auto fixed top-0 left-0 h-full z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Flashcard Decks"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 px-4">Decks</h2>
          <nav>
            <ul>
              {decks.map((deck) => (
                <li key={deck.id} className="group relative">
                  <button
                    onClick={() => onSelectDeck(deck.id)}
                    className={`w-full text-left pl-4 pr-10 py-2 rounded-md text-sm font-medium transition-colors duration-150 truncate ${
                      selectedDeckId === deck.id && currentView === 'deck'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                    title={deck.name}
                  >
                    {deck.name}
                  </button>
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDeck(deck.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`Delete deck ${deck.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
           <button
                onClick={onSelectSettings}
                className={`w-full flex items-center pl-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    currentView === 'settings'
                    ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.1.41a2 2 0 01-2.24 1.25l-.43-.17a2 2 0 00-2.3 1.14l-.28.49a2 2 0 00.17 2.3l.34.34a2 2 0 010 2.82l-.34.34a2 2 0 00-.17 2.3l.28.49a2 2 0 002.3 1.14l.43-.17a2 2 0 012.24 1.25l.1.41c.38 1.56 2.6 1.56 2.98 0l.1-.41a2 2 0 012.24-1.25l.43.17a2 2 0 002.3-1.14l.28-.49a2 2 0 00-.17-2.3l-.34-.34a2 2 0 010-2.82l.34-.34a2 2 0 00.17-2.3l-.28-.49a2 2 0 00-2.3-1.14l-.43.17a2 2 0 01-2.24-1.25l-.1-.41zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Settings
            </button>
           <button
            onClick={onCreateDeck}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors dark:focus:ring-offset-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Deck
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;