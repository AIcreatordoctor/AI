
import React, { useState, useCallback } from 'react';
import { Scenario, GameState, UserActions, LogEntry } from './types';
import { SCENARIOS } from './constants';
import ScenarioSelector from './components/ScenarioSelector';
import SimulationView from './components/SimulationView';
import EvaluationView from './components/EvaluationView';
import { getGeminiEvaluation } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SELECTING);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [userActions, setUserActions] = useState<UserActions>({
    anamnesis: [],
    examination: [],
    tests: [],
    diagnosis: '',
    treatment: '',
  });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [score, setScore] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<string>('');
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState<boolean>(false);

  const handleScenarioSelect = (scenario: Scenario) => {
    setCurrentScenario(scenario);
    setGameState(GameState.IN_PROGRESS);
    setLog([
      { type: 'system', text: `Начат прием. Пациент входит в кабинет.` },
      { type: 'patient', text: `Жалоба: "${scenario.initialComplaint}"` },
      { type: 'patient', text: `Профиль пациента: ${scenario.patientProfile}` },
    ]);
  };

  const handleSimulationFinish = useCallback(async (finalDiagnosis: string, finalTreatment: string) => {
    if (!currentScenario) return;

    const finalActions = {
      ...userActions,
      diagnosis: finalDiagnosis,
      treatment: finalTreatment,
    };
    setUserActions(finalActions);
    setGameState(GameState.EVALUATING);
    setIsLoadingEvaluation(true);
    
    try {
      const result = await getGeminiEvaluation(currentScenario, finalActions);
      setEvaluation(result);
    } catch (error) {
      console.error("Error getting evaluation from Gemini:", error);
      setEvaluation("Произошла ошибка при получении оценки. Пожалуйста, проверьте API ключ и попробуйте снова.");
    } finally {
      setIsLoadingEvaluation(false);
      setGameState(GameState.FINISHED);
    }
  }, [currentScenario, userActions]);


  const resetGame = () => {
    setGameState(GameState.SELECTING);
    setCurrentScenario(null);
    setUserActions({ anamnesis: [], examination: [], tests: [], diagnosis: '', treatment: '' });
    setLog([]);
    setScore(0);
    setEvaluation('');
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.SELECTING:
        return <ScenarioSelector scenarios={SCENARIOS} onSelect={handleScenarioSelect} />;
      case GameState.IN_PROGRESS:
        if (currentScenario) {
          return (
            <SimulationView
              scenario={currentScenario}
              log={log}
              setLog={setLog}
              score={score}
              setScore={setScore}
              userActions={userActions}
              setUserActions={setUserActions}
              onFinish={handleSimulationFinish}
            />
          );
        }
        return null;
      case GameState.EVALUATING:
      case GameState.FINISHED:
          return (
            <EvaluationView
                isLoading={isLoadingEvaluation}
                evaluation={evaluation}
                score={score}
                scenario={currentScenario!}
                userActions={userActions}
                onReset={resetGame}
            />
          );
      default:
        return <ScenarioSelector scenarios={SCENARIOS} onSelect={handleScenarioSelect} />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Симулятор клинического мышления</h1>
          <p className="text-slate-600">Поликлиническая терапия</p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
