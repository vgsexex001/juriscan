"use client";

interface Suggestion {
  text: string;
}

interface SuggestionCardsProps {
  suggestions: Suggestion[];
  onSuggestionClick: (text: string) => void;
}

export default function SuggestionCards({
  suggestions,
  onSuggestionClick,
}: SuggestionCardsProps) {
  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 mb-3">
        Análises estratégicas sugeridas:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-500 hover:bg-gray-50 transition-all text-left"
          >
            <p className="text-sm text-gray-700">{suggestion.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
