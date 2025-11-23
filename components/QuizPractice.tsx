import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SRSSettings, Card } from '../types';
import { updateCardSRSData, scheduleForLongTermReview } from '../services/srs';
import Flashcard from './Flashcard';
import RoundProgressBar from './RoundProgressBar';
import RoundSummaryModal from './RoundSummaryModal';
import PracticeSummary from './PracticeSummary';

interface QuizPracticeProps {
  title: string;
  questions: Card[];
  settings: SRSSettings;
  onExit: () => void;
  onUpdateCard: (updatedCard: Card) => void;
}

const QuizPractice: React.FC<QuizPracticeProps> = ({ title, questions, settings, onExit, onUpdateCard }) => {
  const [practiceQueue, setPracticeQueue] = useState<string[]>([]);
  const [roundQueue, setRoundQueue] = useState<string[]>([]);
  const [carryOverQueue, setCarryOverQueue] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [roundNumber, setRoundNumber] = useState(0);
  const [roundResults, setRoundResults] = useState<number[]>([]);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  
  const [reviewedInSession, setReviewedInSession] = useState(0);
  const [newInSession, setNewInSession] = useState(0);

  const cardMap = useMemo(() => {
    return questions.reduce((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {} as Record<string, Card>);
  }, [questions]);

  const buildNextRound = useCallback(() => {
    let nextRoundIds: string[] = [...carryOverQueue];
    setCarryOverQueue([]);

    let neededCards = settings.roundSize - nextRoundIds.length;

    if (neededCards > 0) {
        const availableInPractice = [...practiceQueue];
        const pulledForRound = availableInPractice.splice(0, neededCards);
        nextRoundIds.push(...pulledForRound);
        setPracticeQueue(availableInPractice);
    }

    if (nextRoundIds.length === 0 && practiceQueue.length === 0) {
      setSessionFinished(true);
      return;
    }
    
    setRoundQueue(nextRoundIds);
    setRoundResults([]);
    setRoundNumber(prev => prev + 1);
    setShowRoundSummary(false);
  }, [practiceQueue, carryOverQueue, settings]);

  useEffect(() => {
    // This effect runs only once when the component mounts to set up the session queues.
    // It assumes `questions` prop is stable for the component's lifetime unless a new session starts.
    if (questions.length > 0 && !isInitialized) {
      const shuffledCardIds = questions.map(c => c.id).sort(() => Math.random() - 0.5);
      setPracticeQueue(shuffledCardIds);
      setIsInitialized(true);
    }
  }, [questions, isInitialized]);


  useEffect(() => {
    if (!isInitialized) return;

    if (roundNumber === 0) {
      if (practiceQueue.length > 0 || carryOverQueue.length > 0) {
        buildNextRound();
      } else if (questions.length > 0) { // Handle case where all cards are in carry-over from start
        buildNextRound();
      } else {
        setSessionFinished(true);
      }
    }
  }, [isInitialized, practiceQueue, carryOverQueue, roundNumber, buildNextRound, questions.length]);

  const currentCard = roundQueue.length > 0 ? cardMap[roundQueue[0]] : null;

  const handleRateCard = (rating: number) => {
    if (!currentCard) return;

    // Stats for final summary
    if (currentCard.repetitions === 0) {
      setNewInSession(prev => prev + 1);
    } else {
      setReviewedInSession(prev => prev + 1);
    }

    let updatedCard = updateCardSRSData(currentCard, rating, settings);
    
    let nextRoundQueueIds = [...roundQueue.slice(1)];
    
    if (rating <= 2) {
      nextRoundQueueIds.push(currentCard.id);
    } else if (rating === 3) {
      setCarryOverQueue(prev => [...prev, currentCard.id]);
    } else if (rating === 4) {
      if (Math.random() < (settings.spotCheckChance / 100)) {
        setCarryOverQueue(prev => [...prev, currentCard.id]);
      } else {
        updatedCard = scheduleForLongTermReview(updatedCard);
      }
    } else { // Mastery (rating 5)
      updatedCard = scheduleForLongTermReview(updatedCard);
    }
    
    onUpdateCard(updatedCard);
    
    setRoundResults(prev => [...prev, rating]);
    
    if (nextRoundQueueIds.length === 0) {
        setShowRoundSummary(true);
    }
    
    setRoundQueue(nextRoundQueueIds);
  };
  
  if (sessionFinished) {
    return <PracticeSummary reviewedCount={reviewedInSession} newCount={newInSession} onExit={onExit} />
  }

  const isLoading = !currentCard && !showRoundSummary && !sessionFinished && isInitialized;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-md text-gray-600 dark:text-gray-400">
            {currentCard ? `Runda ${roundNumber}: Kort ${roundResults.length + 1} av ${roundResults.length + roundQueue.length}` : 'Väntar...'}
          </p>
        </div>
        <button onClick={onExit} className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Avsluta</button>
      </header>

      <div className="mb-6">
        <RoundProgressBar total={roundResults.length + roundQueue.length} results={roundResults} />
      </div>

      {currentCard && (
        <Flashcard
          key={currentCard.id}
          card={currentCard}
          onRate={handleRateCard}
          onUpdateCard={onUpdateCard}
        />
      )}
      
      {isLoading && (
        <div className="w-full min-h-[22rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sammanställer runda...</h3>
        </div>
      )}

      {showRoundSummary && (
        <RoundSummaryModal
          results={roundResults}
          roundNumber={roundNumber}
          onContinue={buildNextRound}
          onExit={onExit}
        />
      )}
    </div>
  );
};

export default QuizPractice;