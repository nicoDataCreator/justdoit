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
import { SecretVaultModal } from './components/SecretVaultModal';
import { 
  INITIAL_SCHEDULE, 
  getHabitsForDay, 
  DAYS_OF_WEEK 
} from './data/scheduleData';
import { DayOfWeek, ScheduleBlock, HabitItem } from './types';
import { getMadridDayOfWeek } from './utils/madridTime';
import { RotateCcw, ShieldCheck, Lock, Terminal } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getMadridDayOfWeek());
  const [isSecretVaultOpen, setIsSecretVaultOpen] = useState<boolean>(false);
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

  // Check URL params for shared state or secret vault trigger on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('vault') === '1' || params.get('vault') === 'true' || params.get('secret') === '1') {
        setIsSecretVaultOpen(true);
      }
      const syncData = params.get('syncData');
      if (syncData) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(syncData)))));
        if (decoded.habits && typeof decoded.habits === 'object') {
          setHabitsByDay(decoded.habits);
        }
        if (typeof decoded.streak === 'number') {
          setStreakCount(decoded.streak);
        }
        setIsSecretVaultOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Global keyboard shortcut to open secret vault: Ctrl + Shift + S or Cmd + Shift + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsSecretVaultOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Import state from SecretVaultModal
  const handleImportState = (importedHabits: Record<DayOfWeek, HabitItem[]>, importedStreak: number) => {
    setHabitsByDay(importedHabits);
    setStreakCount(importedStreak);
  };

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

      {/* Secret Vault Modal */}
      <SecretVaultModal
        isOpen={isSecretVaultOpen}
        onClose={() => setIsSecretVaultOpen(false)}
        schedule={schedule}
        habitsByDay={habitsByDay}
        onImportState={handleImportState}
        streakCount={streakCount}
        disciplineScoreToday={currentScore}
        currentDay={selectedDay}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 mt-auto py-5 sm:py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>Sistema Operativo: Semana Perfecta Madrid • Rendimiento Cognitivo, Físico y Financiero</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4">
            {/* Discreet Secret Vault Trigger */}
            <button
              onClick={() => setIsSecretVaultOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition font-mono text-[11px] cursor-pointer"
              title="Abrir Bóveda Secreta & API Sync (Ctrl+Shift+S)"
            >
              <Lock className="w-3 h-3 text-purple-400" />
              <span>Token: sp_live_mudo6...</span>
            </button>

            <span className="hidden sm:inline text-slate-600">•</span>

            <button
              onClick={handleResetHabits}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Semana</span>
            </button>

            <span className="hidden sm:inline text-slate-600">•</span>

            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>900€/mes Objetivo</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

