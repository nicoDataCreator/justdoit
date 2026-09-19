import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Filter, 
  Clock, 
  MapPin, 
  Check, 
  Layers, 
  Dumbbell, 
  Briefcase, 
  Salad, 
  Moon, 
  Flame
} from 'lucide-react';
import { ScheduleBlock, ActivityType, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../data/scheduleData';
import { exportScheduleToICS } from '../utils/calendarExport';

interface MasterScheduleProps {
  schedule: ScheduleBlock[];
}

export const MasterSchedule: React.FC<MasterScheduleProps> = ({ schedule }) => {
  const [activeCategory, setActiveCategory] = useState<ActivityType | 'all'>('all');
  const [includeWeekend, setIncludeWeekend] = useState<boolean>(true);
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);

  const displayedDays = includeWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  const filterButtons = [
    { id: 'all', label: 'Todos los Bloques', icon: Layers },
    { id: 'run', label: 'Carrera (Zona 2)', icon: Flame },
    { id: 'work', label: 'Trabajo Profundo', icon: Briefcase },
    { id: 'gym', label: 'Gym & Fuerza', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrición / Meal Prep', icon: Salad },
    { id: 'rest', label: 'Descanso / Sueño', icon: Moon },
  ] as const;

  // Time slots for matrix representation (matching the user's core schedule)
  const timeSlots = [
    { time: '07:00 - 08:00', label: '07:00', title: 'Correr (7:00 am L,M,J) / Activación' },
    { time: '09:00 - 14:00', label: '09:00', title: 'Trabajo (9:00 am a 17:00 pm) - Mañana' },
    { time: '14:00 - 15:00', label: '14:00', title: 'Lectura + Sol (14:00 h) & Comida en Casa' },
    { time: '15:00 - 17:00', label: '15:00', title: 'Trabajo - Tarde (Cierre a las 17:00)' },
    { time: '19:00 - 20:30', label: '19:00', title: 'GYM (L, M, J, V a las 19:00 h)' },
    { time: '21:00 - 22:00', label: '21:00', title: 'Cena en Casa (Ahorro)' },
    { time: '23:00 - 06:45', label: '23:00', title: 'Sueño Reparador (23:00 a 06:45)' },
  ];

  // Helper to get block for a specific time slot and day
  const getBlockForSlotAndDay = (slotTimeLabel: string, day: DayOfWeek): ScheduleBlock | undefined => {
    return schedule.find((b) => {
      const matchDay = b.days.includes(day);
      if (!matchDay) return false;
      if (activeCategory !== 'all' && b.category !== activeCategory) return false;

      if (slotTimeLabel === '07:00') {
        return b.timeStart.startsWith('07') || (['sabado', 'domingo'].includes(day) && b.timeStart.startsWith('09'));
      }
      if (slotTimeLabel === '09:00') {
        return b.timeStart === '09:00' || (['sabado', 'domingo'].includes(day) && (b.timeStart === '11:00' || b.timeStart === '09:30'));
      }
      if (slotTimeLabel === '14:00') {
        return b.timeStart === '14:00';
      }
      if (slotTimeLabel === '15:00') {
        return b.timeStart === '15:00';
      }
      if (slotTimeLabel === '19:00') {
        return b.timeStart === '19:00';
      }
      if (slotTimeLabel === '21:00') {
        return b.timeStart === '21:00' || b.timeStart === '20:30';
      }
      if (slotTimeLabel === '23:00') {
        return b.timeStart === '23:00';
      }
      return false;
    });
  };

  const getTagStyle = (category: ActivityType) => {
    switch (category) {
      case 'run':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'gym':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'mobility':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'work':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'nutrition':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'social':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'rest':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <span>Planificación Maestra: Semana Perfecta</span>
          </h2>
          <p className="text-sm text-slate-400">
            Arquitectura horaria optimizada para rendimiento cognitivo, físico y descanso en Madrid.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Toggle Weekend */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setIncludeWeekend(false)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                !includeWeekend ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laboral (L-V)
            </button>
            <button
              onClick={() => setIncludeWeekend(true)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                includeWeekend ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semana Total (L-D)
            </button>
          </div>

          {/* Export to ICS */}
          <button
            onClick={() => exportScheduleToICS(schedule)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Descargar .ICS
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isSelected = activeCategory === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveCategory(btn.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Master Matrix Table */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-28 text-slate-400">Horario</th>
                {displayedDays.map((d) => (
                  <th key={d.id} className="py-3.5 px-3 text-center min-w-[130px]">
                    <span className="text-white font-bold">{d.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-sm">
              {/* 07:00 Morning Block */}
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-400 align-middle">
                  07:00
                </td>
                {displayedDays.map((day) => {
                  const block = getBlockForSlotAndDay('07:00', day.id);
                  return (
                    <td key={day.id} className="py-2.5 px-2 text-center align-middle">
                      {block ? (
                        <button
                          onClick={() => setSelectedBlock(block)}
                          className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer hover:scale-[1.02] ${getTagStyle(
                            block.category
                          )}`}
                        >
                          {block.category === 'run' && '🏃 '}
                          {block.category === 'rest' && '😴 '}
                          {block.title.split(' ')[0]} {block.title.split(' ')[1] || ''}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 08:00 - 14:00 Deep Work & Meal prep */}
              <tr className="bg-slate-900/30 hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-300 align-middle">
                  08:00 - 14:00
                </td>
                {!includeWeekend ? (
                  <td colSpan={5} className="py-3 px-4 text-center">
                    <div className="py-2 px-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      <span>💼 Bloque de Trabajo Profundo (Sin distracciones) + Almuerzo Meal Prep (13€/día)</span>
                    </div>
                  </td>
                ) : (
                  <>
                    <td colSpan={5} className="py-3 px-4 text-center">
                      <div className="py-2 px-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs font-medium">
                        💼 Trabajo Profundo + Comida Meal Prep
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center align-middle">
                      <button
                        onClick={() => setSelectedBlock(schedule.find((b) => b.id === 'block-weekend-life') || null)}
                        className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:scale-[1.02] transition"
                      >
                        🎨 Proyectos & Vida
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-center align-middle">
                      <button
                        onClick={() => setSelectedBlock(schedule.find((b) => b.id === 'block-weekend-mealprep') || null)}
                        className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:scale-[1.02] transition"
                      >
                        🛒 Mercado & Meal Prep
                      </button>
                    </td>
                  </>
                )}
              </tr>

              {/* 17:30 Gym / Movilidad */}
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-400 align-middle">
                  17:30
                </td>
                {displayedDays.map((day) => {
                  const block = getBlockForSlotAndDay('17:30', day.id);
                  return (
                    <td key={day.id} className="py-2.5 px-2 text-center align-middle">
                      {block ? (
                        <button
                          onClick={() => setSelectedBlock(block)}
                          className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer hover:scale-[1.02] ${getTagStyle(
                            block.category
                          )}`}
                        >
                          {block.category === 'gym' && '🏋️ Gym'}
                          {block.category === 'mobility' && '🧘 Movilidad'}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 20:30 Cena Ligera */}
              <tr className="bg-slate-900/30 hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-amber-400 align-middle">
                  20:30
                </td>
                <td colSpan={displayedDays.length} className="py-3 px-4 text-center">
                  <div className="py-2 px-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
                    <Salad className="w-4 h-4 text-amber-400" />
                    <span>🥗 Cena Ligera + Desconexión Digital (Apagado progresivo de pantallas)</span>
                  </div>
                </td>
              </tr>

              {/* 23:00 Sacred Sleep */}
              <tr className="hover:bg-slate-800/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-xs text-emerald-400 align-middle">
                  23:00
                </td>
                <td colSpan={displayedDays.length} className="py-3 px-4 text-center">
                  <div className="py-2 px-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
                    <Moon className="w-4 h-4 text-emerald-400" />
                    <span>🛌 SUEÑO NO NEGOCIABLE (Objetivo: 8 Horas / 5 Ciclos REM Completos)</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bento Breakdown: Weekly Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-blue-400 mb-1">
            <Dumbbell className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Fuerza & Gym</span>
          </div>
          <p className="text-2xl font-black text-white">4 Sesiones</p>
          <p className="text-xs text-slate-400 mt-1">
            Lunes, Martes, Jueves y Viernes (Torso / Pierna / Empuje / Tirón)
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Cardio & Running</span>
          </div>
          <p className="text-2xl font-black text-white">3-4 Sesiones</p>
          <p className="text-xs text-slate-400 mt-1">
            Zona 2 matinal en Retiro/Madrid Río + Tirada larga de sábado
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-indigo-400 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Trabajo Profundo</span>
          </div>
          <p className="text-2xl font-black text-white">30 Horas</p>
          <p className="text-xs text-slate-400 mt-1">
            6 horas diarias de alta concentración y valor añadido
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-amber-400 mb-1">
            <Salad className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Meal Prep</span>
          </div>
          <p className="text-2xl font-black text-white">100% Casero</p>
          <p className="text-xs text-slate-400 mt-1">
            Cocinado domingos con producto de mercado local
          </p>
        </div>
      </div>

      {/* Block Details Modal if selected */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getTagStyle(selectedBlock.category)}`}>
                  {selectedBlock.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedBlock.title}</h3>
                <p className="text-xs font-mono text-blue-400 mt-0.5">
                  {selectedBlock.timeStart} - {selectedBlock.timeEnd} • {selectedBlock.days.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {selectedBlock.description}
            </p>

            {selectedBlock.location && (
              <div className="flex items-center gap-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 mb-5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Ubicación recomendada:</strong> {selectedBlock.location}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
