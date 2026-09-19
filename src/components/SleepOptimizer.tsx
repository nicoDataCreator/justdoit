import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  BatteryCharging, 
  Coffee, 
  Eye, 
  Zap 
} from 'lucide-react';

export const SleepOptimizer: React.FC = () => {
  const [bedtime, setBedtime] = useState<string>('23:00');
  const [fallAsleepMinutes, setFallAsleepMinutes] = useState<number>(15);

  // Calculate 90-minute sleep cycles
  const calculateCycles = () => {
    const [hours, minutes] = bedtime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + fallAsleepMinutes, 0, 0);

    const cycles = [];
    for (let c = 3; c <= 6; c++) {
      const cycleDate = new Date(date.getTime() + c * 90 * 60 * 1000);
      const hStr = cycleDate.getHours().toString().padStart(2, '0');
      const mStr = cycleDate.getMinutes().toString().padStart(2, '0');
      const totalHours = (c * 1.5).toFixed(1);

      cycles.push({
        cycleCount: c,
        time: `${hStr}:${mStr}`,
        durationHours: totalHours,
        isOptimal: c === 5, // 5 cycles = 7.5 hours + 15min = 7h 45m (~8h target)
        qualityLabel:
          c === 5
            ? 'Óptimo (Semana Perfecta)'
            : c === 6
            ? 'Super Recuperador'
            : c === 4
            ? 'Mínimo Aceptable'
            : 'Deficitario',
      });
    }
    return cycles;
  };

  const cycles = calculateCycles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-400" />
          <span>Optimizador de Sueño & Ritmo Circadiano</span>
        </h2>
        <p className="text-sm text-slate-400">
          Arquitectura del descanso biológico: sincronización de melatonina, ciclos REM de 90 minutos y recuperación hormonal.
        </p>
      </div>

      {/* Main Grid: Sleep Cycle Calculator + Circadian Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sleep Calculator */}
        <div className="lg:col-span-7 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Calculadora de Ciclos REM (90 Min)</h3>
              <p className="text-xs text-slate-400">
                Despertar en la cúspide de un ciclo evita la "inercia del sueño" y la fatiga matinal.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Dr. Matthew Walker
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Hora de acostarse (Apagar luces)
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Semana Perfecta: 23:00 h
              </span>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Latencia para conciliar el sueño
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={fallAsleepMinutes}
                  onChange={(e) => setFallAsleepMinutes(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-blue-400 w-12 text-right">
                  {fallAsleepMinutes} m
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Promedio saludable: 10 a 20 min
              </span>
            </div>
          </div>

          {/* Results: Suggested Wakeup Times */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Horas óptimas para despertar sin alarma disruptiva:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cycles.map((item) => (
                <div
                  key={item.cycleCount}
                  className={`p-3.5 rounded-xl border transition ${
                    item.isOptimal
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/50 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-2xl font-bold text-white">
                      {item.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.isOptimal
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.qualityLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>{item.cycleCount} Ciclos de 90m</span>
                    <span>~{item.durationHours} horas de sueño</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Circadian Protocol Guidelines */}
        <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Protocolo Circadiano 24 Horas
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Reglas biológicas no negociables para sincronizar tus ritmos ultradianos.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">07:00 - 08:30: Luz Solar en Ojos</h4>
                  <p className="text-slate-400 mt-0.5">
                    10-15 minutos de fotones naturales (Retiro o terraza) detienen la secreción de melatonina y programan el temporizador de sueño para las 23:00.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">14:00: Toque de Queda de Cafeína</h4>
                  <p className="text-slate-400 mt-0.5">
                    La vida media de la cafeína es de 6 horas. Un café a las 17:00 mantiene un 25% de bloqueo de los receptores de adenosina a medianoche.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <Eye className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">21:30: Filtro de Luz Azul</h4>
                  <p className="text-slate-400 mt-0.5">
                    Apagar pantallas o activar modo noche estricto. La luz azul de los smartphones destruye hasta un 50% de la fase REM.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">23:00: Habitación Fría & Oscuridad Total</h4>
                  <p className="text-slate-400 mt-0.5">
                    Baja las persianas completamente (la ventaja de Madrid) y mantén la temperatura a 18-19°C.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Cumplir 5 ciclos regulares aumenta tu testosterona / hormona de crecimiento hasta un <strong>35%</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
