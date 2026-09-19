/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { TodayView } from './components/TodayView';
import { MasterSchedule } from './components/MasterSchedule';
import { DecisionsBattle } from './components/DecisionsBattle';
import { FinancialProjection } from './components/FinancialProjection';
import { SleepOptimizer } from './components/SleepOptimizer';
import { 
  INITIAL_SCHEDULE, 
  getHabitsForDay, 
  DAYS_OF_WEEK 
} from './data/scheduleData';
import { DayOfWeek, ScheduleBlock, HabitItem } from './types';
import { getMadridDayOfWeek } from './utils/madridTime';
import { RotateCcw, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getMadridDayOfWeek());
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  // Habit records for each day of the week
  const [habitsByDay, setHabitsByDay] = useState<Record<DayOfWeek, HabitItem[]>>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_habits');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    const initial: Record<string, HabitItem[]> = {};
    DAYS_OF_WEEK.forEach((d) => {
      initial[d.id] = getHabitsForDay(d.id);
    });
    return initial as Record<DayOfWeek, HabitItem[]>;
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_streak');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  // Save habits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('so_madrid_habits', JSON.stringify(habitsByDay));
    } catch {
      // ignore
    }
  }, [habitsByDay]);

  // Save streak
  useEffect(() => {
    try {
      localStorage.setItem('so_madrid_streak', streakCount.toString());
    } catch {
      // ignore
    }
  }, [streakCount]);

  // Current day habits
  const todayHabits = habitsByDay[selectedDay] || [];

  // Toggle habit for selected day
  const handleToggleHabit = (habitId: string) => {
    setHabitsByDay((prev) => {
      const dayList = prev[selectedDay] || [];
      const updated = dayList.map((h) => (h.id === habitId ? { ...h, completed: !h.completed } : h));
      
      return {
        ...prev,
        [selectedDay]: updated,
      };
    });
  };

  // Discipline score for selected day
  const calculateDisciplineScore = (items: HabitItem[]): number => {
    if (!items || items.length === 0) return 0;
    const completedWeight = items.filter((i) => i.completed).reduce((acc, curr) => acc + curr.impactScore, 0);
    const totalWeight = items.reduce((acc, curr) => acc + curr.impactScore, 0);
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const currentScore = calculateDisciplineScore(todayHabits);

  // Reset habits of the week
  const handleResetHabits = () => {
    if (window.confirm('¿Deseas reiniciar los hábitos marcados para esta semana?')) {
      const initial: Record<string, HabitItem[]> = {};
      DAYS_OF_WEEK.forEach((d) => {
        initial[d.id] = getHabitsForDay(d.id);
      });
      setHabitsByDay(initial as Record<DayOfWeek, HabitItem[]>);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        schedule={schedule}
        disciplineScoreToday={currentScore}
        streakCount={streakCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'today' && (
          <TodayView
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            habits={todayHabits}
            onToggleHabit={handleToggleHabit}
            schedule={schedule}
            disciplineScore={currentScore}
          />
        )}

        {currentTab === 'schedule' && <MasterSchedule schedule={schedule} />}

        {currentTab === 'financial' && <FinancialProjection />}

        {currentTab === 'decisions' && <DecisionsBattle />}

        {currentTab === 'sleep' && <SleepOptimizer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 mt-auto py-5 sm:py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>Sistema Operativo: Semana Perfecta Madrid • Rendimiento Cognitivo, Físico y Financiero</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={handleResetHabits}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition cursor-pointer px-2.5 py-1 rounded-md hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Semana</span>
            </button>

            <span className="hidden sm:inline text-slate-600">•</span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-slate-300">900€/mes Ahorro Protegido</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

