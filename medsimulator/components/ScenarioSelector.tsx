
import React from 'react';
import { Scenario } from '../types';

interface Props {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
}

const ScenarioSelector: React.FC<Props> = ({ scenarios, onSelect }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Выберите клинический случай</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const isWIP = scenario.initialComplaint === '';
          return (
            <div
              key={scenario.id}
              className={`p-6 border rounded-lg transition-all duration-300 ${
                isWIP
                  ? 'bg-slate-50 cursor-not-allowed opacity-50'
                  : 'bg-white hover:shadow-xl hover:-translate-y-1 cursor-pointer'
              }`}
              onClick={() => !isWIP && onSelect(scenario)}
            >
              <h3 className="text-xl font-semibold text-blue-600">{scenario.title}</h3>
              <p className="text-slate-600 mt-2">{scenario.description}</p>
              {isWIP && (
                <div className="mt-4 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block">
                  В разработке
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;
