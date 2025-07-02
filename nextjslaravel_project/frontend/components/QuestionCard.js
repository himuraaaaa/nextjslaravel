import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const QuestionCard = ({ question, questionNumber, totalQuestions, onNext, initialAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(initialAnswer || '');

  const handleNext = () => {
    if (selectedAnswer) {
      onNext(selectedAnswer);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3 mb-8">
        {(Array.isArray(question.options) ? question.options : []).map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
              selectedAnswer === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="answer"
              value={option.value}
              checked={selectedAnswer === option.value}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-gray-700">{option.text}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
            selectedAnswer
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
