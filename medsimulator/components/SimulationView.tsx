
import React, { useState, Fragment, SetStateAction, Dispatch } from 'react';
import { Scenario, LogEntry, ActionItem, UserActions } from '../types';
import Timer from './Timer';
import { MAX_TIME } from '../constants';
import { StethoscopeIcon, ClipboardListIcon, BeakerIcon, FileTextIcon } from './icons';

interface Props {
  scenario: Scenario;
  log: LogEntry[];
  setLog: Dispatch<SetStateAction<LogEntry[]>>;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  userActions: UserActions;
  setUserActions: Dispatch<SetStateAction<UserActions>>;
  onFinish: (diagnosis: string, treatment: string) => void;
}

type ModalType = 'anamnesis' | 'examination' | 'tests' | 'diagnosis' | null;

const ActionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: ActionItem[];
    onSubmit: (selectedIds: string[]) => void;
    completedItems: Set<string>;
}> = ({ isOpen, onClose, title, items, onSubmit, completedItems }) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const handleSelect = (id: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        onSubmit(Array.from(selected));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={item.id}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={() => handleSelect(item.id)}
                                    checked={selected.has(item.id)}
                                    disabled={completedItems.has(item.id)}
                                />
                                <label htmlFor={item.id} className={`ml-3 text-slate-700 ${completedItems.has(item.id) ? 'line-through text-slate-400' : ''}`}>
                                    {item.text}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Отмена</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Подтвердить</button>
                </div>
            </div>
        </div>
    );
};


const DiagnosisModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (diagnosis: string, treatment: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');

    const handleSubmit = () => {
        onSubmit(diagnosis, treatment);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Постановка диагноза и назначение лечения</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-1">Предварительный диагноз:</label>
                        <textarea
                            id="diagnosis"
                            rows={4}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="treatment" className="block text-sm font-medium text-slate-700 mb-1">План лечения:</label>
                         <textarea
                            id="treatment"
                            rows={6}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition">Отмена</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Завершить прием</button>
                </div>
            </div>
        </div>
    );
};


const SimulationView: React.FC<Props> = ({ scenario, log, setLog, score, setScore, userActions, setUserActions, onFinish }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [completedStages, setCompletedStages] = useState<Set<ModalType>>(new Set());

    const handleTimeUp = () => {
        onFinish(userActions.diagnosis, userActions.treatment);
    };

    const handleActionSubmit = (selectedIds: string[], type: Exclude<ModalType, 'diagnosis' | null>) => {
        const items = scenario[type];
        const selectedItems = items.filter(item => selectedIds.includes(item.id));

        const newLogs: LogEntry[] = [];
        let scoreChange = 0;

        selectedItems.forEach(item => {
            newLogs.push({type: 'doctor', text: `Вы: ${item.text}`});
            newLogs.push({type: 'result', text: `Результат: ${item.result}`});
            scoreChange += item.points;
        });

        setLog(prev => [...prev, ...newLogs]);
        setScore(prev => prev + scoreChange);
        setUserActions(prev => ({ ...prev, [type]: [...prev[type], ...selectedItems] }));
        setCompletedStages(prev => new Set(prev).add(type));
    };

    const getCompletedItems = (type: Exclude<ModalType, 'diagnosis' | null>) => {
       return new Set(userActions[type].map(item => item.id));
    };


    const actionButtons = [
        { type: 'anamnesis', label: 'Сбор анамнеза', icon: <ClipboardListIcon className="w-6 h-6" /> },
        { type: 'examination', label: 'Осмотр', icon: <StethoscopeIcon className="w-6 h-6" /> },
        { type: 'tests', label: 'Обследования', icon: <BeakerIcon className="w-6 h-6" /> },
    ];


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Patient Log */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">{scenario.title}</h2>
                <div className="h-[60vh] overflow-y-auto pr-4 space-y-4">
                    {log.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                            entry.type === 'patient' ? 'bg-blue-50' : 
                            entry.type === 'doctor' ? 'bg-slate-50' :
                            entry.type === 'result' ? 'bg-amber-50 border-l-4 border-amber-400' :
                            'bg-gray-100'
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white ${
                                entry.type === 'patient' ? 'bg-blue-500' : 
                                entry.type === 'doctor' ? 'bg-slate-500' :
                                entry.type === 'result' ? 'bg-amber-500' :
                                'bg-gray-400'
                            }`}>
                                {entry.type === 'patient' && 'П'}
                                {entry.type === 'doctor' && 'В'}
                                {entry.type === 'result' && 'i'}
                                {entry.type === 'system' && 'S'}
                            </div>
                            <p className="text-slate-700 pt-1">{entry.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Actions */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-6">
                <Timer initialTime={MAX_TIME} onTimeUp={handleTimeUp} />
                <div>
                    <h3 className="text-lg font-semibold mb-3">Действия врача</h3>
                    <div className="space-y-3">
                        {actionButtons.map(({ type, label, icon }) => (
                           <button
                             key={type}
                             onClick={() => setActiveModal(type as ModalType)}
                             disabled={completedStages.has(type as ModalType)}
                             className="w-full flex items-center gap-3 text-left p-4 rounded-md bg-slate-100 hover:bg-slate-200 transition disabled:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                            {icon}
                             <span>{label}</span>
                             {completedStages.has(type as ModalType) && <span className="ml-auto text-xs text-green-600 font-bold">✓</span>}
                           </button>
                        ))}
                    </div>
                </div>
                <div className="mt-auto">
                     <button
                        onClick={() => setActiveModal('diagnosis')}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        <FileTextIcon className="w-6 h-6" />
                        <span>Диагноз и лечение</span>
                      </button>
                </div>
            </div>
            
            <ActionModal 
                isOpen={activeModal === 'anamnesis'}
                onClose={() => setActiveModal(null)}
                title="Сбор анамнеза"
                items={scenario.anamnesis}
                onSubmit={(ids) => handleActionSubmit(ids, 'anamnesis')}
                completedItems={getCompletedItems('anamnesis')}
            />
            <ActionModal 
                isOpen={activeModal === 'examination'}
                onClose={() => setActiveModal(null)}
                title="Физикальный осмотр"
                items={scenario.examination}
                onSubmit={(ids) => handleActionSubmit(ids, 'examination')}
                completedItems={getCompletedItems('examination')}
            />
             <ActionModal 
                isOpen={activeModal === 'tests'}
                onClose={() => setActiveModal(null)}
                title="Лабораторные и инструментальные обследования"
                items={scenario.tests}
                onSubmit={(ids) => handleActionSubmit(ids, 'tests')}
                completedItems={getCompletedItems('tests')}
            />
            <DiagnosisModal
                isOpen={activeModal === 'diagnosis'}
                onClose={() => setActiveModal(null)}
                onSubmit={onFinish}
            />
        </div>
    );
};

export default SimulationView;
