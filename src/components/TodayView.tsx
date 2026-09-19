import React from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Euro, 
  Zap, 
  Moon, 
  ChevronRight, 
  MapPin, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { HabitItem, ScheduleBlock, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, MADRID_HOTSPOTS } from '../data/scheduleData';

interface TodayViewProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  habits: HabitItem[];
  onToggleHabit: (habitId: string) => void;
  schedule: ScheduleBlock[];
  disciplineScore: number;
}

export const TodayView: React.FC<TodayViewProps> = ({
  selectedDay,
  onSelectDay,
  habits,
  onToggleHabit,
  schedule,
  disciplineScore,
}) => {
  const dayBlocks = schedule
    .filter((b) => b.days.includes(selectedDay))
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;

  const handleToggle = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    // If completing the last habit, trigger celebratory confetti
    if (habit && !habit.completed && completedCount + 1 === totalCount) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
    }
    onToggleHabit(id);
  };

  // Estimated stats for today
  const mealsSavedToday = habits.find((h) => h.id === 'h-mealprep-lunch')?.completed ? 17 : 0;
  const trainingDone = habits.find((h) => h.category === 'run' || h.category === 'gym')?.completed;
  const sleepSecured = habits.find((h) => h.id === 'h-sleep-target')?.completed;

  const currentDayLabel = DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label || selectedDay;

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Ejecución Diaria: {currentDayLabel}</span>
            {disciplineScore === 100 && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" /> Día Perfecto
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400">
            Control de hábitos no negociables y rutina de alto rendimiento.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {DAYS_OF_WEEK.map((d) => {
            const isSelected = d.id === selectedDay;
            return (
              <button
                key={d.id}
                id={`day-select-${d.id}`}
                onClick={() => onSelectDay(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards of the day */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Discipline Meter */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Disciplina de Hoy
            </span>
            <Flame className={`w-4 h-4 ${disciplineScore >= 80 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{disciplineScore}%</span>
            <span className="text-xs text-slate-400">({completedCount} de {totalCount} hábitos)</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                disciplineScore === 100
                  ? 'bg-emerald-400'
                  : disciplineScore >= 60
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${disciplineScore}%` }}
            />
          </div>
        </div>

        {/* Money Kept / Saved today */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ahorro Meal Prep Hoy
            </span>
            <Euro className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              +{mealsSavedToday > 0 ? `${mealsSavedToday}€` : '0€'}
            </span>
            <span className="text-xs text-slate-400">vs comer en Madrid</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {mealsSavedToday > 0
              ? '✅ 17€ netos retenidos en tu cuenta hoy.'
              : 'Marca la comida Meal Prep para registrar el ahorro.'}
          </p>
        </div>

        {/* Cognitive / Energy Status */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Estado Biológico & Foco
            </span>
            <Zap className={`w-4 h-4 ${trainingDone ? 'text-blue-400' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-400">
              {trainingDone ? '+30%' : '+0%'}
            </span>
            <span className="text-xs text-slate-400">Dopamina basal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {trainingDone
              ? '✅ Sensibilidad a la insulina y claridad mental óptima.'
              : 'Pendiente de activar el sistema cardiovascular/muscular.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Habit Checklist (Left) & Schedule for Selected Day (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Habit Checklist */}
        <div className="lg:col-span-7 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Checklist de Hábitos No Negociables</span>
              </h3>
              <p className="text-xs text-slate-400">
                Haz clic en cada hábito para registrar tu ejecución hoy.
              </p>
            </div>
            <button
              onClick={() => {
                habits.forEach((h) => {
                  if (!h.completed) handleToggle(h.id);
                });
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Completar Todos
            </button>
          </div>

          <div className="space-y-2.5">
            {habits.map((habit) => {
              return (
                <div
                  key={habit.id}
                  id={`habit-card-${habit.id}`}
                  onClick={() => handleToggle(habit.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                    habit.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="focus:outline-none cursor-pointer"
                    >
                      {habit.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${habit.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono">{habit.time}</span>
                        <span>•</span>
                        <span className="capitalize">{habit.category}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    habit.completed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    +{habit.impactScore} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Madrid Insight Banner */}
          <div className="mt-5 p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-start gap-3 text-xs text-blue-300">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-blue-200">Protocolo Madrid en Primavera/Otoño/Invierno:</p>
              <p className="text-slate-300 mt-0.5">
                La radiación matinal en Madrid (a 650m de altitud) sincroniza tu reloj maestro supraquiasmático. 
                15 minutos de paseo o carrera antes de las 08:30 garantizan melatonina endógena a las 22:30.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Day Timeline */}
        <div className="lg:col-span-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Cronograma: {currentDayLabel}</h3>
                <p className="text-xs text-slate-400">Estructura por bloques de alta concentración</p>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                {dayBlocks.length} bloques
              </span>
            </div>

            <div className="space-y-3">
              {dayBlocks.map((block) => {
                let badgeClass = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
                if (block.category === 'run') badgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                if (block.category === 'gym') badgeClass = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
                if (block.category === 'rest') badgeClass = 'bg-slate-700/40 text-slate-300 border-slate-600/40';
                if (block.category === 'nutrition') badgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                return (
                  <div
                    key={block.id}
                    className="p-3 bg-slate-800/90 border border-slate-700/50 rounded-xl hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {block.timeStart} - {block.timeEnd}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {block.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1.5">{block.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{block.description}</p>
                    {block.location && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span>{block.location}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Madrid Location recommendation */}
          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lugares Clave en Madrid
            </h4>
            <div className="space-y-1.5">
              {MADRID_HOTSPOTS.slice(0, 2).map((spot) => (
                <div key={spot.name} className="text-[11px] bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  <span className="font-semibold text-white">{spot.name}</span>
                  <span className="text-slate-400"> — {spot.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
