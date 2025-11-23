import React, { useState, useEffect, useMemo } from 'react';

interface ParsedCard {
  question: string;
  answer: string;
  tags?: string[];
}

interface ImportCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedCards: ParsedCard[]) => void;
}

const ImportCardsModal: React.FC<ImportCardsModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);

  // Import settings state
  const [fieldSeparator, setFieldSeparator] = useState('::');
  const [isTaggingEnabled, setIsTaggingEnabled] = useState(false);
  const [tagSeparator, setTagSeparator] = useState(':');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
        setText('');
        setParsedCards([]);
        setIsTaggingEnabled(false);
        setFieldSeparator('::');
        setTagSeparator(':');
    }
  }, [isOpen]);

  const displayedFieldSeparator = useMemo(() => fieldSeparator === '\t' ? 'Tab' : fieldSeparator, [fieldSeparator]);

  useEffect(() => {
    const lines = text.split('\n');
    const newParsedCards = lines
      .map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        let question = '';
        let answer = '';
        let tags: string[] = [];
        let qaContent = trimmedLine;

        // NEW LOGIC: Look for TAG at the beginning of the line
        if (isTaggingEnabled && tagSeparator.trim()) {
            const tagSepIndex = trimmedLine.indexOf(tagSeparator);
            // Ensure separator is not at the very beginning and is found
            if (tagSepIndex > 0) { 
                const tag = trimmedLine.substring(0, tagSepIndex).trim();
                if (tag) {
                    tags = [tag]; // User examples imply one tag per line
                }
                qaContent = trimmedLine.substring(tagSepIndex + tagSeparator.length).trim();
            }
        }
        
        // Now parse the remaining qaContent for question and answer
        const fieldSepIndex = qaContent.indexOf(fieldSeparator);

        // Ensure separator is not at the very beginning and is found
        if (fieldSepIndex > 0) {
          question = qaContent.substring(0, fieldSepIndex).trim();
          answer = qaContent.substring(fieldSepIndex + fieldSeparator.length).trim();

          if (question && answer) {
            return { question, answer, tags };
          }
        }
        
        return null;
      })
      .filter((card): card is ParsedCard => card !== null);
    
    setParsedCards(newParsedCards);
  }, [text, fieldSeparator, isTaggingEnabled, tagSeparator]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCards.length > 0) {
        onImport(parsedCards);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Import Cards from Text</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Format:&nbsp;
            {isTaggingEnabled && (
                <>
                <span className="font-semibold">Tag</span>
                <span className="font-semibold text-green-600 dark:text-green-400 mx-1">{tagSeparator || '[sep]'}</span>
                </>
            )}
            <span className="font-semibold">Question</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 mx-1">{displayedFieldSeparator}</span>
            <span className="font-semibold">Answer</span>
           </p>
        </div>

        {/* Import Options */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Import Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div>
                <label htmlFor="field-separator" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question/Answer Separator</label>
                <select 
                    id="field-separator"
                    value={fieldSeparator}
                    onChange={(e) => setFieldSeparator(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="::">::</option>
                    <option value=":">: (Colon)</option>
                    <option value="|">| (Pipe)</option>
                    <option value=";">; (Semicolon)</option>
                    <option value="	">Tab</option>
                </select>
             </div>
             <div className="space-y-2">
                <div className="flex items-center">
                    <input 
                        id="enable-tagging" 
                        type="checkbox" 
                        checked={isTaggingEnabled}
                        onChange={(e) => setIsTaggingEnabled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enable-tagging" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Enable Tagging</label>
                </div>
                {isTaggingEnabled && (
                    <div>
                        <label htmlFor="tag-separator" className="sr-only">Tag Separator</label>
                        <input
                            type="text"
                            id="tag-separator"
                            value={tagSeparator}
                            onChange={(e) => setTagSeparator(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Tag Separator"
                        />
                    </div>
                )}
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 flex-1 min-h-0">
            <label htmlFor="bulk-import-area" className="sr-only">Paste card text here</label>
            <textarea
              id="bulk-import-area"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={"TAYLOR: Maclaurin-serie (a = 0): $f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n$"}
              className="w-full h-full p-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              autoFocus
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-between items-center">
             <span className="text-sm text-gray-600 dark:text-gray-400">
                {parsedCards.length} card{parsedCards.length !== 1 ? 's' : ''} detected.
             </span>
             <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button type="submit" disabled={parsedCards.length === 0} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
                    Import {parsedCards.length > 0 ? parsedCards.length : ''} Cards
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportCardsModal;