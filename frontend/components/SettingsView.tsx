import React, { useState, useEffect, useMemo } from 'react';
import { SRSSettings, Card, Deck } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface SettingsViewProps {
  settings: SRSSettings;
  setSettings: React.Dispatch<React.SetStateAction<SRSSettings>>;
  onResetAll: () => void;
  cards: Card[];
  decks: Deck[];
}

type Theme = 'light' | 'dark' | 'system';
type SortableKey = keyof Card | 'deckName';

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, onResetAll, cards, decks }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'nextReviewDate', direction: 'ascending' });

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    applyTheme(currentTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(currentTheme);

    if (currentTheme === 'system') {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [currentTheme]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
  };

  const handleSettingChange = (key: keyof SRSSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'number' ? Number(value) : value
    }));
  };

  const deckMap = useMemo(() => {
    return decks.reduce((acc, deck) => {
        acc[deck.id] = deck.name;
        return acc;
    }, {} as Record<string, string>);
  }, [decks]);

  const sortedCards = useMemo(() => {
    let sortableCards = [...cards];
    if (sortConfig !== null) {
      sortableCards.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'deckName') {
          aValue = deckMap[a.deckId] || '';
          bValue = deckMap[b.deckId] || '';
        } else if (sortConfig.key === 'tags') {
          aValue = a.tags?.join(', ') || '';
          bValue = b.tags?.join(', ') || '';
        } else {
          aValue = a[sortConfig.key as keyof Card];
          bValue = b[sortConfig.key as keyof Card];
        }

        // Handle numbers first, as they are distinct types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        // Treat everything else as strings for comparison, handling undefined/null
        const strA = String(aValue ?? '');
        const strB = String(bValue ?? '');

        return sortConfig.direction === 'ascending' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }
    return sortableCards;
  }, [cards, sortConfig, deckMap]);

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader: React.FC<{ columnKey: SortableKey; title: string; className?: string; }> = ({ columnKey, title, className = '' }) => {
    const isSorted = sortConfig?.key === columnKey;
    const sortIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
    return (
        <th scope="col" className={`px-4 py-3 cursor-pointer select-none ${className}`} onClick={() => requestSort(columnKey)}>
            {title} <span className="text-xs opacity-60">{sortIcon}</span>
        </th>
    );
  };


  const SettingSlider: React.FC<{
    id: keyof SRSSettings; label: string; helpText: string; min: number; max: number; step?: number; value: number; unit?: string;
  }> = ({ id, label, helpText, min, max, step = 1, value, unit = '' }) => (
    <div>
      <label htmlFor={id} className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}{unit}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleSettingChange(id, e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
      />
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
    </div>
  );

  const SettingNumeric: React.FC<{
    id: keyof SRSSettings; label: string; helpText: string; min: number; max: number; step?: number; value: number;
  }> = ({ id, label, helpText, min, max, step = 0.1, value }) => (
     <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleSettingChange(id, e.target.value)}
        className="mt-1 w-24 p-2 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
       <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-400">
          Your settings are saved automatically.
        </p>
      </div>
      
      {/* Study Session Settings */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Study Session</h3>
        <div className="space-y-6">
          <SettingSlider id="roundSize" label="Cards per Round" helpText="Set the number of cards you want to study in each round." min={5} max={25} value={settings.roundSize} />
          <SettingSlider id="newCardFillRatio" label="New Card Mix" helpText="The percentage of new, never-before-seen cards to introduce in each round." min={0} max={100} value={settings.newCardFillRatio} unit="%" />
          <SettingSlider id="spotCheckChance" label="Spot Check 'Easy' Cards" helpText="The chance that a card you mark as 'Easy' will be shown again in the next round for reinforcement." min={0} max={100} value={settings.spotCheckChance} unit="%" />
        </div>
      </div>

      {/* Algorithm Tuning */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Algorithm Tuning (Advanced)</h3>
         <div className="space-y-6">
            <SettingNumeric id="defaultEasinessFactor" label="Starting Easiness" helpText="The initial difficulty score for new cards. Higher values space reviews out more quickly." min={1.5} max={3.5} step={0.1} value={settings.defaultEasinessFactor} />
            <SettingNumeric id="minEasinessFactor" label="Minimum Easiness" helpText="Prevents very difficult cards from being shown too frequently after repeated failures." min={1.1} max={2.0} step={0.1} value={settings.minEasinessFactor} />
         </div>
      </div>

      {/* Appearance */}
       <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Appearance</h3>
         <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-2 rounded-md bg-gray-100 dark:bg-gray-700 p-1 w-fit">
                {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                    <button key={theme} onClick={() => handleThemeChange(theme)}
                     className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${currentTheme === theme ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                    >
                        {theme}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {/* Database Inspector */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Card Database Inspector</h3>
        <p className="mt-1 mb-4 text-sm text-gray-600 dark:text-gray-400">A read-only view of all cards and their current learning state. Click on a column header to sort.</p>
        <div className="overflow-x-auto relative rounded-md border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <SortableHeader columnKey="deckName" title="Deck" />
                <SortableHeader columnKey="question" title="Question" />
                <SortableHeader columnKey="tags" title="Tags" />
                <SortableHeader columnKey="aiExplanation" title="AI Explanation" />
                <SortableHeader columnKey="easinessFactor" title="Easiness" />
                <SortableHeader columnKey="interval" title="Interval (d)" />
                <SortableHeader columnKey="repetitions" title="Reps" />
                <SortableHeader columnKey="nextReviewDate" title="Next Review" />
              </tr>
            </thead>
            <tbody>
              {sortedCards.map(card => (
                <tr key={card.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{deckMap[card.deckId] || 'Unknown'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={card.question}><MarkdownRenderer>{card.question}</MarkdownRenderer></td>
                  <td className="px-4 py-3 max-w-xs truncate" title={card.tags?.join(', ')}>{card.tags?.join(', ') || '-'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={card.aiExplanation}>{card.aiExplanation || '-'}</td>
                  <td className="px-4 py-3">{card.easinessFactor.toFixed(2)}</td>
                  <td className="px-4 py-3">{card.interval}</td>
                  <td className="px-4 py-3">{card.repetitions}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(card.nextReviewDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {cards.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No cards found.</div>
          )}
        </div>
      </div>

       {/* Data Management */}
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30">
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">Data Management</h3>
         <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Warning: Actions in this section are irreversible.
        </p>
        <div className="mt-4">
             <button onClick={onResetAll} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800">
                Reset All Decks & Progress
            </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsView;