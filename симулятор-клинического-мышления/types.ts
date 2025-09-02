
export enum GameState {
  SELECTING = 'selecting',
  IN_PROGRESS = 'in_progress',
  EVALUATING = 'evaluating',
  FINISHED = 'finished',
}

export interface ActionItem {
  id: string;
  text: string;
  isCorrect: boolean;
  points: number;
  feedback: string;
  result: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  initialComplaint: string;
  patientProfile: string;
  anamnesis: ActionItem[];
  examination: ActionItem[];
  tests: ActionItem[];
  correctDiagnosis: {
    diagnosis: string;
    explanation: string;
    treatment: string;
  };
}

export interface UserActions {
  anamnesis: ActionItem[];
  examination: ActionItem[];
  tests: ActionItem[];
  diagnosis: string;
  treatment: string;
}

export interface LogEntry {
  type: 'doctor' | 'patient' | 'system' | 'result';
  text: string;
}
