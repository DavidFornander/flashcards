import React from 'react';
import RoundProgressBar from './RoundProgressBar';

interface RoundSummaryModalProps {
  results: number[];
  roundNumber: number;
  onContinue: () => void;
  onExit: () => void;
}

const ratingLabels: { [key: number]: { label: string, color: string } } = {
  5: { label: 'Mycket Lätt', color: 'text-green-600 dark:text-green-400' },
  4: { label: 'Lätt', color: 'text-blue-600 dark:text-blue-400' },
  3: { label: 'Bra', color: 'text-yellow-600 dark:text-yellow-400' },
  2: { label: 'Svår', color: 'text-orange-600 dark:text-orange-400' },
  1: { label: 'Igen', color: 'text-red-600 dark:text-red-400' },
};

const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({ results, roundNumber, onContinue, onExit }) => {
  const summaryCounts = results.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all text-center">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Runda {roundNumber} slutförd!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Här är din sammanfattning.</p>
          
          <div className="mb-6">
            <RoundProgressBar total={results.length} results={results} />
          </div>

          <div className="space-y-2 text-left">
            {Object.keys(ratingLabels).sort((a,b) => parseInt(b) - parseInt(a)).map(ratingKey => {
              const ratingNum = parseInt(ratingKey);
              const count = summaryCounts[ratingNum] || 0;
              if (count === 0) return null;
              return (
                <div key={ratingNum} className="flex justify-between items-center text-sm">
                  <span className={`font-semibold ${ratingLabels[ratingNum].color}`}>{ratingLabels[ratingNum].label}</span>
                  <span className="text-gray-500 dark:text-gray-400">{count} kort</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={onContinue} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Starta Nästa Runda
          </button>
          <button onClick={onExit} className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            Avsluta
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundSummaryModal;