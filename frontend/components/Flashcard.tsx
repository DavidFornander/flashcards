import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { GoogleGenAI, Chat } from "@google/genai";
import { Card } from '../types';

// Initialize the Google AI client lazily.
const apiKey = process.env.API_KEY;

interface FlashcardProps {
  card: Card;
  onRate: (rating: number) => void;
  onUpdateCard: (updatedCard: Card) => void;
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

const Flashcard: React.FC<FlashcardProps> = ({ card, onRate, onUpdateCard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // State for AI chat functionality
  const [chat, setChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');

  const handleShowAnswer = () => {
    setIsFlipped(true);
    if (card.aiExplanation) {
      setConversation([{ role: 'model', text: card.aiExplanation }]);

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        // Initialize chat with history for follow-ups
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: [
            {
              role: 'user',
              parts: [{ text: `Please provide a concise explanation for the following flashcard, assuming the user is a student trying to understand the concept. Format the explanation clearly using Markdown.\n\nQuestion:\n${card.question}\n\nAnswer:\n${card.answer}` }]
            },
            {
              role: 'model',
              parts: [{ text: card.aiExplanation }]
            }
          ]
        });
        setChat(newChat);
      }
    }
  }

  const handleRating = (rating: number) => {
    onRate(rating);
  }

  const handleAskAI = async () => {
    setIsWaitingForAI(true);
    setConversation([]);
    setAiError(null);
    setChat(null);

    try {
      if (!apiKey) {
        throw new Error("API Key is missing. Please check your configuration.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const newChat = ai.chats.create({ model: 'gemini-2.5-flash' });
      setChat(newChat);

      const prompt = `Please provide a concise explanation for the following flashcard, assuming the user is a student trying to understand the concept. Format the explanation clearly using Markdown.\n\nQuestion:\n${card.question}\n\nAnswer:\n${card.answer}`;

      const response = await newChat.sendMessage({ message: prompt });

      // Create the updated card object and call the parent handler to update the master state
      const updatedCardWithExplanation = { ...card, aiExplanation: response.text };
      onUpdateCard(updatedCardWithExplanation);

      // Set local state to display the conversation immediately
      setConversation([{ role: 'model', text: response.text }]);

    } catch (error) {
      console.error("Error fetching AI explanation:", error);
      setAiError("Sorry, I couldn't fetch an explanation right now. Please try again later.");
    } finally {
      setIsWaitingForAI(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || !chat || isWaitingForAI) return;

    const userMessage = followUp.trim();
    setFollowUp('');
    setConversation(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsWaitingForAI(true);
    setAiError(null);

    try {
      const response = await chat.sendMessage({ message: userMessage });
      setConversation(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Error sending follow-up:", error);
      setAiError("Sorry, there was an error with your follow-up question. Please try again.");
      // Revert optimistic UI update on error
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsWaitingForAI(false);
    }
  };


  const RatingButton = ({ rating, text, colorClasses }: { rating: number, text: string, colorClasses: string }) => (
    <button
      onClick={() => handleRating(rating)}
      className={`w-full sm:w-auto flex-1 px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${colorClasses}`}
    >
      {text}
    </button>
  );

  return (
    <div className="relative w-full min-h-[22rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between overflow-hidden">
      {/* Last Rating Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${getRatingColorClass(card.lastRating)}`}></div>

      {/* Tags Display */}
      {card.tags && card.tags.length > 0 && (
        <div className="absolute top-4 left-5 flex flex-wrap gap-1.5 z-10">
          {card.tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Question Area */}
      <div className="flex-grow flex items-center justify-center pt-8 pb-2">
        <div className="text-xl text-center font-semibold text-gray-800 dark:text-gray-200">
          <MarkdownRenderer>{card.question}</MarkdownRenderer>
        </div>
      </div>

      {/* Flipped Content: Answer and Ratings */}
      {isFlipped && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-md mb-6">
            <div className="text-lg text-center text-gray-700 dark:text-gray-300">
              <MarkdownRenderer>{card.answer}</MarkdownRenderer>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            <RatingButton rating={1} text="Igen" colorClasses="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/80" />
            <RatingButton rating={2} text="Svår" colorClasses="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-900/80" />
            <RatingButton rating={3} text="Bra" colorClasses="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/80" />
            <RatingButton rating={4} text="Lätt" colorClasses="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900/80" />
            <RatingButton rating={5} text="Mycket Lätt" colorClasses="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/80" />
          </div>
        </div>
      )}

      {/* AI Explanation Section */}
      {isFlipped && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="min-h-[3rem] flex flex-col items-center justify-center">
            {/* Initial "Ask AI" button: show if no cached version and no conversation started */}
            {!card.aiExplanation && !isWaitingForAI && conversation.length === 0 && !aiError && (
              <button
                onClick={handleAskAI}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Ask AI to explain
              </button>
            )}

            {/* Loading spinner for initial explanation */}
            {isWaitingForAI && conversation.length === 0 && (
              <div className="flex items-center gap-2 text-center text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </div>
            )}

            {/* Error display */}
            {aiError && (
              <div className="w-full p-3 bg-red-50 dark:bg-red-900/50 rounded-md text-red-700 dark:text-red-300 text-sm text-center">
                {aiError}
              </div>
            )}

            {/* Conversation display and follow-up form */}
            {conversation.length > 0 && (
              <div className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  AI Explanation
                </h4>
                <div className="space-y-4 mt-2 text-sm">
                  {conversation.map((msg, index) => (
                    <div key={index}>
                      {msg.role === 'user' && (
                        <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">You:</p>
                      )}
                      <div className={`text-gray-700 dark:text-gray-300 ${msg.role === 'user' ? 'pl-2 border-l-2 border-gray-300 dark:border-gray-500' : ''}`}>
                        <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                      </div>
                    </div>
                  ))}
                </div>

                {isWaitingForAI && (
                  <div className="flex items-center gap-2 text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI is typing...
                  </div>
                )}

                <form onSubmit={handleSendFollowUp} className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={followUp}
                    onChange={e => setFollowUp(e.target.value)}
                    placeholder="Ask a follow-up..."
                    disabled={isWaitingForAI}
                    className="flex-grow w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button type="submit" disabled={isWaitingForAI || !followUp.trim()} className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800/50 disabled:cursor-not-allowed">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial State: Show Answer Button */}
      {!isFlipped && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-center">
          <button
            onClick={handleShowAnswer}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Visa Svar
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;