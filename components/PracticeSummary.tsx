import React from 'react';

interface PracticeSummaryProps {
  reviewedCount: number;
  newCount: number;
  onExit: () => void;
}

const PracticeSummary: React.FC<PracticeSummaryProps> = ({ reviewedCount, newCount, onExit }) => {
  return (
    <div className="max-w-2xl mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Övning slutförd!</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Snyggt jobbat! Du har stärkt dina kunskaper.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{reviewedCount}</p>
          <p className="text-md font-medium text-gray-500 dark:text-gray-400 mt-2">Kort repeterade</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">{newCount}</p>
          <p className="text-md font-medium text-gray-500 dark:text-gray-400 mt-2">Nya kort inlärda</p>
        </div>
      </div>

      <button
        onClick={onExit}
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Tillbaka till kursöversikt
      </button>
    </div>
  );
};

export default PracticeSummary;
