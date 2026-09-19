export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export type ActivityType = 'run' | 'gym' | 'work' | 'nutrition' | 'rest' | 'mobility' | 'social';

export interface ScheduleBlock {
  id: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  category: ActivityType;
  description: string;
  location?: string;
  days: DayOfWeek[];
}

export interface HabitItem {
  id: string;
  name: string;
  category: ActivityType;
  impactScore: number;
  time: string;
  completed: boolean;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  habits: Record<string, boolean>;
  notes?: string;
}

export interface DecisionBattle {
  id: string;
  nameGood: string;
  valGood: string;
  metricGood: number; // 0-100%
  nameBad: string;
  valBad: string;
  metricBad: number; // 0-100%
  insight: string;
  annualSavings?: number;
  category: 'finance' | 'cognition' | 'recovery' | 'nutrition';
}

export interface PersonalBudget {
  monthlyIncome: number; // 2300 € min
  foodAtHome: number; // 400 €
  homeUtilities: number; // 600 € (casa, limpieza, internet, teléfono)
  mobilityExtras: number; // 200 € (movilidad)
  miscellaneousExtras: number; // 200 € (lo que sea / imprevistos)
}

export interface SyncSettings {
  apiKey: string;
  webhookUrl?: string;
  lastSyncedAt?: string;
  autoSyncEnabled?: boolean;
}

export interface MonthMilestone {
  month: number;
  label: string;
  savedAccumulated: number;
  savedImperfect: number;
  milestoneTitle: string;
  description: string;
}

export interface FinancialSimParams {
  monthlyIncome: number; // 2300 €
  foodAtHome: number; // 400 €
  homeUtilities: number; // 600 €
  mobilityExtras: number; // 200 €
  miscellaneousExtras: number; // 200 €
  annualReturn: number; // e.g. 0.07
  yearsHorizon: number; // e.g. 10
}

