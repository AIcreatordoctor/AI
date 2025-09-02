
import React from 'react';
import { Scenario, UserActions } from '../types';

interface Props {
  isLoading: boolean;
  evaluation: string;
  score: number;
  scenario: Scenario;
  userActions: UserActions;
  onReset: () => void;
}

const EvaluationView: React.FC<Props> = ({ isLoading, evaluation, score, scenario, userActions, onReset }) => {
  
  const maxScore = scenario.anamnesis.concat(scenario.examination, scenario.tests)
    .filter(item => item.isCorrect)
    .reduce((sum, item) => sum + item.points, 0);

  const getRating = () => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (percentage >= 90) return { text: 'Отлично', color: 'text-green-600' };
    if (percentage >= 75) return { text: 'Хорошо', color: 'text-blue-600' };
    if (percentage >= 50) return { text: 'Удовлетворительно', color: 'text-amber-600' };
    return { text: 'Ошибочно', color: 'text-red-600' };
  };
  
  const rating = getRating();

  const renderMarkdown = (text: string) => {
    const formattedText = text
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
      .replace(/```\n?([\s\S]*?)\n?```/g, '<pre class="bg-slate-100 p-3 rounded-md text-sm my-2 font-mono"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-slate-800">Результаты симуляции</h2>
      <p className="text-slate-600 mb-6">Разбор ваших действий по клиническому случаю "{scenario.title}"</p>
      
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg mb-6">
        <div>
          <span className="text-sm text-slate-500">Ваш итоговый балл</span>
          <p className="text-3xl font-bold text-slate-800">{score} / {maxScore}</p>
        </div>
        <div>
          <span className="text-sm text-slate-500">Рейтинг</span>
          <p className={`text-3xl font-bold ${rating.color}`}>{rating.text}</p>
        </div>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Обратная связь от эксперта</h3>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Анализируем ваши действия, пожалуйста, подождите...</p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-gray-800">
             {renderMarkdown(evaluation)}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
        >
          Пройти другой сценарий
        </button>
      </div>
    </div>
  );
};

export default EvaluationView;
