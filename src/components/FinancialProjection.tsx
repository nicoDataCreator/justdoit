import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Euro, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const FinancialProjection: React.FC = () => {
  const [monthlyTarget, setMonthlyTarget] = useState<number>(2300);
  const [slipPercentage, setSlipPercentage] = useState<number>(40); // 40% less saved
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7); // 7% APY
  const [horizonYears, setHorizonYears] = useState<number>(10);

  const monthlyImperfect = Math.round(monthlyTarget * (1 - slipPercentage / 100));

  // Compute compound interest projection dataset
  const chartData = useMemo(() => {
    const data = [];
    let perfectBalance = 0;
    let imperfectBalance = 0;
    let perfectContributed = 0;
    let imperfectContributed = 0;

    const rate = annualReturnRate / 100;

    for (let year = 0; year <= horizonYears; year++) {
      if (year === 0) {
        data.push({
          year: `Año 0`,
          disciplina: 0,
          deslices: 0,
          aportadoMeta: 0,
          diferencia: 0,
        });
      } else {
        // Annual approximation with monthly contributions
        perfectContributed += monthlyTarget * 12;
        imperfectContributed += monthlyImperfect * 12;

        perfectBalance = (perfectBalance + monthlyTarget * 12) * (1 + rate);
        imperfectBalance = (imperfectBalance + monthlyImperfect * 12) * (1 + rate);

        data.push({
          year: `Año ${year}`,
          disciplina: Math.round(perfectBalance),
          deslices: Math.round(imperfectBalance),
          aportadoMeta: Math.round(perfectContributed),
          diferencia: Math.round(perfectBalance - imperfectBalance),
        });
      }
    }
    return data;
  }, [monthlyTarget, monthlyImperfect, annualReturnRate, horizonYears]);

  const finalYear = chartData[chartData.length - 1];
  const perfectFinal = finalYear?.disciplina || 0;
  const imperfectFinal = finalYear?.deslices || 0;
  const gapFinal = perfectFinal - imperfectFinal;
  const totalInvested = (monthlyTarget * 12) * horizonYears;
  const totalInterestEarned = perfectFinal - totalInvested;

  const formatK = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M€`;
    if (val >= 1000) return `${Math.round(val / 1000)}k€`;
    return `${val}€`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Simulador Financiero: Interés Compuesto & Disciplina</span>
          </h2>
          <p className="text-sm text-slate-400">
            Comparativa matemática: Cumplir la meta de ahorro mensual vs caer en deslices frecuentes.
          </p>
        </div>

        {/* Horizon selector buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {[5, 10, 15, 20].map((years) => (
            <button
              key={years}
              onClick={() => setHorizonYears(years)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                horizonYears === years
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {years} Años
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ahorro mensual meta */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ahorro Mensual Neto (Meta)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {monthlyTarget.toLocaleString('es-ES')}€
            </span>
            <span className="text-xs text-slate-400">/ mes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            vs {monthlyImperfect.toLocaleString('es-ES')}€ con deslices (-{slipPercentage}%)
          </p>
        </div>

        {/* KPI 2: Patrimonio Final con Disciplina */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Patrimonio en {horizonYears} Años (Meta)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {formatK(perfectFinal)}
            </span>
            <span className="text-xs text-slate-400">al {annualReturnRate}% APY</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {perfectFinal.toLocaleString('es-ES')} € acumulados
          </p>
        </div>

        {/* KPI 3: Brecha o Pérdida por Deslices */}
        <div className="bg-slate-800/80 border border-rose-500/30 p-4 rounded-2xl bg-rose-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Coste de la Indisciplina
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              -{formatK(gapFinal)}
            </span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2">
            Dinero perdido para siempre por hábitos no ejecutados
          </p>
        </div>

        {/* KPI 4: Interés compuesto puro */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Rendimiento de Mercado
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              +{formatK(totalInterestEarned)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Intereses puros que tu dinero generó trabajando por ti
          </p>
        </div>
      </div>

      {/* Main Grid: Chart + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart View */}
        <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                📈 Curva de Crecimiento del Patrimonio
              </h3>
              <p className="text-xs text-slate-400">
                Línea Verde: Disciplina 100% | Línea Roja: Deslices Frecuentes
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Retorno anual: {annualReturnRate}%
            </span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="disciplinaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="deslicesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: any, name: any) => {
                    const label = name === 'disciplina' ? 'Disciplina 100%' : name === 'deslices' ? 'Deslices Frecuentes' : name;
                    return [`${Number(value).toLocaleString('es-ES')} €`, label];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {value === 'disciplina' ? 'Disciplina 100% (Meta)' : 'Deslices Frecuentes (-40%)'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="disciplina"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#disciplinaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="deslices"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#deslicesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-center text-xs text-slate-400 mt-3 italic">
            El interés compuesto recompensa de forma asimétrica la constancia a partir del año 4.
          </p>
        </div>

        {/* Sliders and Configuration */}
        <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white">Parámetros del Simulador</h3>

          {/* Monthly target */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Ahorro Mensual Objetivo</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                {monthlyTarget.toLocaleString('es-ES')} €
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="50"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>500€</span>
              <span>2.300€ (Base)</span>
              <span>5.000€</span>
            </div>
          </div>

          {/* Slip % */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Erosión por Deslices Frecuentes</span>
              <span className="text-rose-400 font-mono font-bold">-{slipPercentage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={slipPercentage}
              onChange={(e) => setSlipPercentage(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>-10%</span>
              <span>-40% (Por defecto)</span>
              <span>-70%</span>
            </div>
          </div>

          {/* Return Rate */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Rentabilidad Anual Estimada (APY)</span>
              <span className="text-blue-400 font-mono font-bold">{annualReturnRate}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>3% (Conservador)</span>
              <span>7% (S&P 500 real)</span>
              <span>12%</span>
            </div>
          </div>

          {/* Key Insight Box */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> La Regla del Ahorro en Madrid:
            </p>
            Alcanzar <strong>{formatK(perfectFinal)}</strong> en {horizonYears} años te otorga independencia financiera suficiente para cubrir el coste de vida completo en la capital con una tasa de retiro segura del 4%.
          </div>
        </div>
      </div>
    </div>
  );
};
