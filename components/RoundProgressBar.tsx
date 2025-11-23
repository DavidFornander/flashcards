import React from 'react';

interface RoundProgressBarProps {
  total: number;
  results: number[];
}

const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 1: return 'bg-red-500';      // Igen
    case 2: return 'bg-orange-500';   // Svår
    case 3: return 'bg-yellow-500';   // Bra
    case 4: return 'bg-blue-500';     // Lätt
    case 5: return 'bg-green-500';    // Mycket Lätt
    default: return 'bg-gray-300 dark:bg-gray-600'; // Not yet answered
  }
};

const RoundProgressBar: React.FC<RoundProgressBarProps> = ({ total, results }) => {
  if (total === 0) return null;

  const segments = Array.from({ length: total }, (_, i) => results[i] || 0);

  return (
    <div className="w-full flex h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={results.length} aria-valuemin={0} aria-valuemax={total}>
      {segments.map((rating, index) => (
        <div
          key={index}
          className={`h-full transition-colors duration-300 ${getRatingColor(rating)}`}
          style={{ width: `${100 / total}%` }}
          title={`Kort ${index + 1}: ${rating > 0 ? `Betyg ${rating}` : 'Obehandlad'}`}
        ></div>
      ))}
    </div>
  );
};

export default RoundProgressBar;