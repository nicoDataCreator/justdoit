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
  Sparkles,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { ScheduleBlock, DayOfWeek } from '../types';
import { getMadridDate, formatMadridTime, getMadridDayOfWeek, parseMinutesFromTimeStr } from '../utils/madridTime';
import { exportScheduleToICS } from '../utils/calendarExport';

export type AppTab = 'today' | 'schedule' | 'financial' | 'decisions' | 'sleep';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);

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
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }

  const tabs: TabItem[] = [
    { id: 'today', label: 'Hoy & Disciplina', icon: CheckCircle2, tag: `${disciplineScoreToday}%` },
    { id: 'schedule', label: 'Mi Rutina Semanal', icon: Calendar },
    { id: 'financial', label: 'Proyección 6 Meses & Ahorro', icon: TrendingUp },
    { id: 'decisions', label: 'Batalla de Decisiones', icon: Scale },
    { id: 'sleep', label: 'Ritmo Circadiano', icon: Moon },
  ];

  const handle1ClickCalendarExport = () => {
    exportScheduleToICS(schedule);
    setCalendarDownloaded(true);
    setShowCalendarModal(true);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        {/* Top bar with Branding, Madrid time, and Quick actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-base sm:text-lg shrink-0">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white m-0">
                  Sistema Operativo: Semana Perfecta
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <MapPin className="w-3 h-3" /> Madrid CET
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0 line-clamp-1 sm:line-clamp-none">
                Optimización cognitiva, entrenamiento físico y ahorro inteligente
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-medium text-slate-200">{timeStr || '--:--'}</span>
              <span className="text-slate-400 capitalize hidden sm:inline">({currentDay})</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 sm:px-3 py-1.5 rounded-lg text-amber-300 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span>Racha: <strong>{streakCount} {streakCount === 1 ? 'día' : 'días'}</strong></span>
            </div>

            {/* 1-Click Google Calendar Import button */}
            <button
              id="export-calendar-btn"
              onClick={handle1ClickCalendarExport}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition font-medium cursor-pointer shadow-sm shadow-blue-600/20"
              title="Importar a Google Calendar con 1 Clic o descargar archivo .ics"
            >
              <Download className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Google Calendar (1 Clic)</span>
            </button>
          </div>
        </div>

        {/* Current Active Block Banner */}
        <div className="pt-2 pb-1 text-xs">
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/50 to-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-medium whitespace-nowrap">Bloque actual:</span>
              <span className="text-white font-semibold flex items-center gap-1.5 flex-wrap">
                {activeBlock ? (
                  <>
                    <span className="text-emerald-400 font-mono">{activeBlock.timeStart} - {activeBlock.timeEnd}</span>
                    <span>{activeBlock.title}</span>
                  </>
                ) : (
                  <span className="text-slate-300">Transición / Tiempo libre productivo</span>
                )}
              </span>
            </div>

            {nextBlockInfo && (
              <div className="text-slate-400 text-[11px] sm:text-right flex items-center sm:justify-end gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                <span>Siguiente: <strong>{nextBlockInfo.block.title}</strong> en {nextBlockInfo.minutesRemaining} min ({nextBlockInfo.block.timeStart})</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-3 scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
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

      {/* Calendar Import Confirmation Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">¡Calendario .ICS Descargado!</h3>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El archivo <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">Mi_Rutina_Semanal_Personal.ics</code> contiene tu horario completo: 
              <strong> Trabajo 9-17h, Correr 7am, Sol 14h, Gym 19h</strong> con recordatorios 15 minutos antes.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>Cómo importarlo en Google Calendar en 1 paso:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Abre el importador de Google Calendar con el botón abajo.</li>
                <li>Arrastra el archivo recién descargado.</li>
                <li>¡Listo! Tu rutina semanal quedará fijada para siempre.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://calendar.google.com/calendar/u/0/r/settings/export"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-xl text-xs font-semibold transition text-center"
              >
                <span>Abrir Google Calendar Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-semibold transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

