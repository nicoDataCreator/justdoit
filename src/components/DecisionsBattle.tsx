import React, { useState } from 'react';
import { 
  Scale, 
  Euro, 
  Zap, 
  Moon, 
  HelpCircle, 
  TrendingDown, 
  TrendingUp, 
  Lightbulb, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { DecisionBattle } from '../types';
import { INITIAL_DECISIONS } from '../data/scheduleData';

export const DecisionsBattle: React.FC = () => {
  const [dinnersOutPerWeek, setDinnersOutPerWeek] = useState<number>(3);
  const [skippedWorkoutsPerWeek, setSkippedWorkoutsPerWeek] = useState<number>(1);
  const [lateNightsPerWeek, setLateNightsPerWeek] = useState<number>(2);

  // Madrid specific calculations
  const costPerMealOut = 30; // Madrid average restaurant or delivery dinner
  const costPerMealHome = 13; // Quality meal prep
  const deltaPerMeal = costPerMealOut - costPerMealHome; // 17€ per slip

  const weeklyFoodLeak = dinnersOutPerWeek * deltaPerMeal;
  const monthlyFoodLeak = weeklyFoodLeak * 4.33;
  const annualFoodLeak = monthlyFoodLeak * 12;

  // 10 year compound value of this leak at 7%
  let compound10Years = 0;
  for (let y = 1; y <= 10; y++) {
    compound10Years = (compound10Years + annualFoodLeak) * 1.07;
  }

  // Energy drag score
  const energyPenalty = skippedWorkoutsPerWeek * 12 + lateNightsPerWeek * 15;
  const energyLevel = Math.max(25, 100 - energyPenalty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-emerald-400" />
          <span>Batalla de Decisiones Diarias: El Efecto Compuesto</span>
        </h2>
        <p className="text-sm text-slate-400">
          La excelencia no es un acto aislado, sino el resultado microscópico de tus elecciones cotidianas en Madrid.
        </p>
      </div>

      {/* Main 2-column layout: Classical Decisions Comparison + Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classical Decision Cards with visual bars (Elevated from user's original design) */}
        <div className="lg:col-span-7 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white">
              ⚖️ Micro-Decisiones Clave y su Impacto
            </h3>
            <span className="text-xs text-slate-400">Ratio Beneficio / Coste</span>
          </div>

          <div className="space-y-6">
            {INITIAL_DECISIONS.map((item) => (
              <div key={item.id} className="space-y-2.5">
                {/* Good Choice */}
                <div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="text-emerald-400">✅</span> {item.nameGood}
                    </span>
                    <span className="text-emerald-400 font-mono">{item.valGood}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${item.metricGood}%` }}
                    />
                  </div>
                </div>

                {/* Bad Choice */}
                <div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-rose-400">❌</span> {item.nameBad}
                    </span>
                    <span className="text-rose-400 font-mono">{item.valBad}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${item.metricBad}%` }}
                    />
                  </div>
                </div>

                {/* Insight */}
                <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.insight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Simulation Sandbox: "Calcula tus Deslices Semanales" */}
        <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Simulador del Coste Real de los Deslices
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Descubre el impacto financiero y energético acumulado de tus excepciones cotidianas en Madrid.
            </p>

            {/* Controls */}
            <div className="space-y-4">
              {/* Dinners out slider */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-300">Comer/Cenar fuera o Delivery (Madrid)</span>
                  <span className="text-rose-400 font-mono font-bold">{dinnersOutPerWeek} días/sem</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={dinnersOutPerWeek}
                  onChange={(e) => setDinnersOutPerWeek(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0 (100% Meal Prep)</span>
                  <span>7 (Todos los días)</span>
                </div>
              </div>

              {/* Skipped workouts slider */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-300">Saltarse el gimnasio o carrera</span>
                  <span className="text-amber-400 font-mono font-bold">{skippedWorkoutsPerWeek} días/sem</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={skippedWorkoutsPerWeek}
                  onChange={(e) => setSkippedWorkoutsPerWeek(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0 (Disciplina total)</span>
                  <span>5 (Sedentarismo)</span>
                </div>
              </div>

              {/* Late nights slider */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-300">Dormir pasada la medianoche (&gt;24:00)</span>
                  <span className="text-purple-400 font-mono font-bold">{lateNightsPerWeek} días/sem</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={lateNightsPerWeek}
                  onChange={(e) => setLateNightsPerWeek(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0 (Sueño sagrado 23h)</span>
                  <span>7 (Insomnio/Pantallas)</span>
                </div>
              </div>
            </div>

            {/* Dynamic Results Box */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Fuga de dinero anual evitable:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  -{Math.round(annualFoodLeak).toLocaleString('es-ES')} € / año
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Coste de oportunidad a 10 años (7% APY):</span>
                <span className="font-mono font-extrabold text-amber-400 text-base">
                  -{Math.round(compound10Years).toLocaleString('es-ES')} €
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Índice biológico estimado:</span>
                <span className={`font-mono font-bold text-sm ${energyLevel > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {energyLevel}% Capacidad Máxima
                </span>
              </div>
            </div>
          </div>

          {/* Quick takeaway tip */}
          <div className="mt-5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Reducir a solo 1 comida fuera por semana te devuelve más de <strong>1.700€ limpios al año</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Psychology & Anti-Friction protocols */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          Protocolos de Neurociencia contra la Tentación (James Clear & Huberman)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-white mb-1">1. Fricción para el Delivery</h4>
            <p className="text-slate-400 leading-relaxed">
              Borra las tarjetas bancarias de las apps de delivery. Cada paso extra reduce un 60% las compras impulsivas a las 21:00.
            </p>
          </div>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-white mb-1">2. La Regla de los 5 Minutos de Gym</h4>
            <p className="text-slate-400 leading-relaxed">
              Si te da pereza, comprométete solo a calentar 5 minutos en el gimnasio. El 92% de las veces completarás la sesión entera.
            </p>
          </div>
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-white mb-1">3. Toque de Queda Fotónico</h4>
            <p className="text-slate-400 leading-relaxed">
              A partir de las 21:30, baja las luces de techo en tu piso de Madrid y usa lámparas cálidas de suelo. La melatonina sube de forma natural.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
