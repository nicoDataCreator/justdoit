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

export interface FinancialSimParams {
  monthlySavings: number; // e.g. 2300
  imperfectMonthlySavings: number; // e.g. 1380
  annualReturn: number; // e.g. 0.07
  yearsHorizon: number; // e.g. 10
  eatingOutCostMadrid: number; // 30
  homeMealCost: number; // 13
  dinnersOutPerWeek: number; // 3
}
