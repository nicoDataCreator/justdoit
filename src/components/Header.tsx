import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Scale, 
  Moon, 
  Clock, 
  Download, 
  Flame, 
  CheckCircle2, 
  MapPin, 
  Sparkles
} from 'lucide-react';
import { ScheduleBlock, DayOfWeek } from '../types';
import { getMadridDate, formatMadridTime, getMadridDayOfWeek, parseMinutesFromTimeStr } from '../utils/madridTime';
import { exportScheduleToICS } from '../utils/calendarExport';

interface HeaderProps {
  currentTab: 'today' | 'schedule' | 'decisions' | 'financial' | 'sleep';
  onSelectTab: (tab: 'today' | 'schedule' | 'decisions' | 'financial' | 'sleep') => void;
  schedule: ScheduleBlock[];
  disciplineScoreToday: number;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  schedule,
  disciplineScoreToday,
  streakCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('lunes');
  const [activeBlock, setActiveBlock] = useState<ScheduleBlock | null>(null);
  const [nextBlockInfo, setNextBlockInfo] = useState<{ block: ScheduleBlock; minutesRemaining: number } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = getMadridDate();
      setTimeStr(formatMadridTime(now));
      const day = getMadridDayOfWeek();
      setCurrentDay(day);

      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      // Find blocks for today
      const todayBlocks = schedule
        .filter((b) => b.days.includes(day))
        .sort((a, b) => parseMinutesFromTimeStr(a.timeStart) - parseMinutesFromTimeStr(b.timeStart));

      // Check which block is current
      const foundCurrent = todayBlocks.find((b) => {
        const startMin = parseMinutesFromTimeStr(b.timeStart);
        let endMin = parseMinutesFromTimeStr(b.timeEnd);
        // Handle wrapping over midnight if 23:00 -> 06:45
        if (endMin < startMin) {
          return nowMinutes >= startMin || nowMinutes < endMin;
        }
        return nowMinutes >= startMin && nowMinutes < endMin;
      });

      setActiveBlock(foundCurrent || null);

      // Find next block
      const upcoming = todayBlocks.find((b) => {
        const startMin = parseMinutesFromTimeStr(b.timeStart);
        return startMin > nowMinutes;
      });

      if (upcoming) {
        const startMin = parseMinutesFromTimeStr(upcoming.timeStart);
        setNextBlockInfo({
          block: upcoming,
          minutesRemaining: startMin - nowMinutes,
        });
      } else {
        setNextBlockInfo(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [schedule]);

  interface TabItem {
    id: 'today' | 'schedule' | 'decisions' | 'financial' | 'sleep';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }

  const tabs: TabItem[] = [
    { id: 'today', label: 'Hoy & Disciplina', icon: CheckCircle2, tag: `${disciplineScoreToday}%` },
    { id: 'schedule', label: 'Plan Maestro Semanal', icon: Calendar },
    { id: 'decisions', label: 'Batalla de Decisiones', icon: Scale },
    { id: 'financial', label: 'Simulador Financiero', icon: TrendingUp },
    { id: 'sleep', label: 'Sueño & Ritmo Circadiano', icon: Moon },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top bar with Branding, Madrid time, and Quick actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
                  Sistema Operativo: Semana Perfecta
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <MapPin className="w-3 h-3" /> Madrid CET
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">
                Optimización cognitiva, entrenamiento físico y ahorro inteligente
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 text-xs">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono font-medium text-slate-200">{timeStr || '--:--'}</span>
              <span className="text-slate-400 capitalize hidden sm:inline">({currentDay})</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-300 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Racha: <strong>{streakCount} {streakCount === 1 ? 'día' : 'días'}</strong></span>
            </div>

            {/* Export .ics button */}
            <button
              id="export-calendar-btn"
              onClick={() => exportScheduleToICS(schedule)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer shadow-sm"
              title="Descargar archivo .ics compatible con Google Calendar, Apple y Outlook"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Exportar a</span> Calendar (.ics)
            </button>
          </div>
        </div>

        {/* Current Active Block Banner */}
        <div className="pt-2 pb-1 text-xs">
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/50 to-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-medium">Bloque en curso:</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                {activeBlock ? (
                  <>
                    <span className="text-emerald-400">{activeBlock.timeStart} - {activeBlock.timeEnd}</span>
                    <span>{activeBlock.title}</span>
                  </>
                ) : (
                  <span className="text-slate-300">Transición / Tiempo libre productivo</span>
                )}
              </span>
            </div>

            {nextBlockInfo && (
              <div className="text-slate-400 text-[11px] sm:text-right flex items-center sm:justify-end gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Siguiente: <strong>{nextBlockInfo.block.title}</strong> en {nextBlockInfo.minutesRemaining} min ({nextBlockInfo.block.timeStart})</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.tag && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {tab.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
