import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Euro, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SIX_MONTH_MILESTONES } from '../data/scheduleData';

export const FinancialProjection: React.FC = () => {
  // User's exact baseline budget
  const [income, setIncome] = useState<number>(2300); // 2300 € min
  const [foodCost, setFoodCost] = useState<number>(400); // 400 € comida en casa
  const [homeCost, setHomeCost] = useState<number>(600); // 600 € casa + limpieza + internet + teléfono
  const [mobilityCost, setMobilityCost] = useState<number>(200); // 200 € extras movilidad
  const [extraMiscCost, setExtraMiscCost] = useState<number>(200); // 200 € extras lo que sea

  // Slips simulation
  const [dinnersOutPerMonth, setDinnersOutPerMonth] = useState<number>(6); // ~1.5 per week
  const [extraOverage, setExtraOverage] = useState<number>(150); // extra expenses over budget

  // Long-term rate
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7); // 7% APY index fund
  const [viewMode, setViewMode] = useState<'6months' | 'longterm'>('6months');
  const [longtermYears, setLongtermYears] = useState<number>(3); // 3 years default

  // Base financial calculations
  const totalBudgetedExpenses = foodCost + homeCost + mobilityCost + extraMiscCost; // 1400 €
  const monthlySavingsDisciplined = Math.max(0, income - totalBudgetedExpenses); // 900 €
  const savingsRateDisciplined = Math.round((monthlySavingsDisciplined / income) * 100);

  // Leak calculations: Eating out cost delta in Madrid (~25€ menu/dinner vs ~4€ home meal = ~21€ delta)
  const leakPerDinner = 25; 
  const monthlyFoodLeak = dinnersOutPerMonth * leakPerDinner;
  const monthlyImperfectExpenses = totalBudgetedExpenses + monthlyFoodLeak + extraOverage;
  const monthlySavingsImperfect = Math.max(0, income - monthlyImperfectExpenses);
  const monthlyLeakTotal = monthlySavingsDisciplined - monthlySavingsImperfect;

  // 6-Month dataset
  const sixMonthsData = useMemo(() => {
    const months = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];
    return months.map((label, index) => {
      const m = index + 1;
      const disciplined = monthlySavingsDisciplined * m;
      const imperfect = monthlySavingsImperfect * m;
      const gap = disciplined - imperfect;

      return {
        month: label,
        mesNum: m,
        disciplina: disciplined,
        deslices: imperfect,
        perdida: gap,
        ahorroMensual: monthlySavingsDisciplined,
      };
    });
  }, [monthlySavingsDisciplined, monthlySavingsImperfect]);

  // Long-term dataset
  const longTermData = useMemo(() => {
    const data = [];
    let perfectBalance = 0;
    let imperfectBalance = 0;
    const rate = annualReturnRate / 100;

    for (let year = 0; year <= longtermYears; year++) {
      if (year === 0) {
        data.push({
          period: 'Inicio',
          disciplina: 0,
          deslices: 0,
          diferencia: 0,
        });
      } else {
        perfectBalance = (perfectBalance + monthlySavingsDisciplined * 12) * (1 + rate);
        imperfectBalance = (imperfectBalance + monthlySavingsImperfect * 12) * (1 + rate);
        data.push({
          period: `Año ${year}`,
          disciplina: Math.round(perfectBalance),
          deslices: Math.round(imperfectBalance),
          diferencia: Math.round(perfectBalance - imperfectBalance),
        });
      }
    }
    return data;
  }, [monthlySavingsDisciplined, monthlySavingsImperfect, annualReturnRate, longtermYears]);

  const sixMonthDisciplinedTotal = monthlySavingsDisciplined * 6; // 5.400 €
  const sixMonthImperfectTotal = monthlySavingsImperfect * 6; // ~2.700 €
  const sixMonthGap = sixMonthDisciplinedTotal - sixMonthImperfectTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Proyección Financiera & Ahorro a 6 Meses</span>
          </h2>
          <p className="text-sm text-slate-400">
            Ingresos mensuales de {income.toLocaleString('es-ES')}€, control de gastos fijos y meta estricta de ahorro acumulado.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('6months')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === '6months'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Proyección a 6 Meses
          </button>
          <button
            onClick={() => setViewMode('longterm')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'longterm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📈 Visión 1 a 5 Años
          </button>
        </div>
      </div>

      {/* Primary KPI Cards for User's Exact Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ahorro Neto Mensual */}
        <div className="bg-slate-800/80 border border-emerald-500/30 p-4 rounded-2xl bg-emerald-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Euro className="w-3.5 h-3.5 text-emerald-400" /> Ahorro Neto Mensual (Meta)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              +{monthlySavingsDisciplined.toLocaleString('es-ES')}€
            </span>
            <span className="text-xs text-slate-400">/ mes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Tasa de ahorro: <strong className="text-emerald-400">{savingsRateDisciplined}%</strong> de tus ingresos ({income}€)
          </p>
        </div>

        {/* KPI 2: Total acumulado a 6 meses */}
        <div className="bg-slate-800/80 border border-blue-500/30 p-4 rounded-2xl bg-blue-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Meta Cumplida a 6 Meses
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {sixMonthDisciplinedTotal.toLocaleString('es-ES')}€
            </span>
            <span className="text-xs text-blue-300/80">acumulados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Cubre casi <strong>4 meses enteros</strong> de tus gastos totales ({totalBudgetedExpenses}€/m)
          </p>
        </div>

        {/* KPI 3: Coste de Deslices en 6 Meses */}
        <div className="bg-slate-800/80 border border-rose-500/30 p-4 rounded-2xl bg-rose-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Fuga por Indisciplina (6 Meses)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              -{sixMonthGap.toLocaleString('es-ES')}€
            </span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2">
            Dinero perdido si comes fuera o te pasas en extras (-{monthlyLeakTotal}€/mes)
          </p>
        </div>

        {/* KPI 4: Ahorro Anual (12 Meses) */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Proyección a 1 Año (12 Meses)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {(monthlySavingsDisciplined * 12).toLocaleString('es-ES')}€
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Capital libre para invertir o fondo de tranquilidad absoluta
          </p>
        </div>
      </div>

      {/* Interactive Budget Breakdown Bar */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Desglose de tu Presupuesto Mensual</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ingresos: <strong>{income} €</strong> | Gastos totales: <strong>{totalBudgetedExpenses} €</strong> | Ahorro neto: <strong className="text-emerald-400">{monthlySavingsDisciplined} €</strong>
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold self-start sm:self-auto">
            {savingsRateDisciplined}% Ahorro Protegido
          </span>
        </div>

        {/* Visual proportional bar */}
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 hover:opacity-90 transition-all duration-300"
            style={{ width: `${(monthlySavingsDisciplined / income) * 100}%` }}
            title={`Ahorro: ${monthlySavingsDisciplined}€ (${Math.round((monthlySavingsDisciplined / income) * 100)}%)`}
          />
          <div
            className="bg-blue-500 hover:opacity-90 transition-all duration-300"
            style={{ width: `${(homeCost / income) * 100}%` }}
            title={`Casa/Limpieza/Internet/Tlf: ${homeCost}€ (${Math.round((homeCost / income) * 100)}%)`}
          />
          <div
            className="bg-amber-500 hover:opacity-90 transition-all duration-300"
            style={{ width: `${(foodCost / income) * 100}%` }}
            title={`Comida en casa: ${foodCost}€ (${Math.round((foodCost / income) * 100)}%)`}
          />
          <div
            className="bg-purple-500 hover:opacity-90 transition-all duration-300"
            style={{ width: `${(mobilityCost / income) * 100}%` }}
            title={`Extras movilidad: ${mobilityCost}€ (${Math.round((mobilityCost / income) * 100)}%)`}
          />
          <div
            className="bg-pink-500 hover:opacity-90 transition-all duration-300"
            style={{ width: `${(extraMiscCost / income) * 100}%` }}
            title={`Extras ocio/lo que sea: ${extraMiscCost}€ (${Math.round((extraMiscCost / income) * 100)}%)`}
          />
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">Ahorro Neto: {monthlySavingsDisciplined}€ ({savingsRateDisciplined}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-300 font-medium">Casa/Limp/Int/Tlf: {homeCost}€</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300 font-medium">Comida en Casa: {foodCost}€</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-300 font-medium">Movilidad: {mobilityCost}€</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span className="text-slate-300 font-medium">Extras Ocio: {extraMiscCost}€</span>
          </div>
        </div>
      </div>

      {/* Main Chart + Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Area */}
        <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {viewMode === '6months' ? (
                  <span>🎯 Evolución Mes a Mes: Cumplir Todo vs Deslices</span>
                ) : (
                  <span>📈 Crecimiento a Largo Plazo con Interés Compuesto</span>
                )}
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                +900 € / mes
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {viewMode === '6months'
                ? 'Proyección exacta mes a mes de los 6 meses de disciplina cumplida.'
                : `Proyección a ${longtermYears} años reinvirtiendo el excedente al ${annualReturnRate}% APY.`}
            </p>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === '6months' ? (
                  <BarChart data={sixMonthsData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}€`}
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
                        const label = name === 'disciplina' ? 'Disciplina 100% (Meta)' : 'Con Deslices Frecuentes';
                        return [`${Number(value).toLocaleString('es-ES')} €`, label];
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-slate-300 font-medium">
                          {value === 'disciplina' ? 'Cumpliendo Todo (+900€/mes)' : 'Con Deslices en Comida/Extras'}
                        </span>
                      )}
                    />
                    <Bar dataKey="disciplina" fill="#10b981" radius={[6, 6, 0, 0]} name="disciplina" />
                    <Bar dataKey="deslices" fill="#ef4444" radius={[6, 6, 0, 0]} name="deslices" />
                  </BarChart>
                ) : (
                  <AreaChart data={longTermData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
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
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${Math.round(val / 1000)}k€`}
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
                        const label = name === 'disciplina' ? 'Disciplina 100%' : 'Con Deslices';
                        return [`${Number(value).toLocaleString('es-ES')} €`, label];
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-slate-300 font-medium">
                          {value === 'disciplina' ? 'Patrimonio Disciplinado' : 'Patrimonio con Deslices'}
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
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>A los 6 meses habrás alcanzado <strong>{sixMonthDisciplinedTotal.toLocaleString('es-ES')} €</strong> garantizados.</span>
            </span>
            <span className="text-rose-400">
              Diferencia frente a deslices: <strong>-{sixMonthGap.toLocaleString('es-ES')} €</strong>
            </span>
          </div>
        </div>

        {/* Right: Personal Budget Adjuster Sandbox */}
        <div className="lg:col-span-4 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Ajustador de Presupuesto
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Income Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Ingresos Mensuales:</span>
                <span className="text-emerald-400 font-mono font-bold">{income.toLocaleString('es-ES')} €</span>
              </div>
              <input
                type="range"
                min="2000"
                max="4000"
                step="50"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Mínimo base: 2.300 €</span>
            </div>

            {/* Food at home */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Comida en casa (todos los días):</span>
                <span className="text-amber-400 font-mono font-bold">{foodCost} €</span>
              </div>
              <input
                type="range"
                min="300"
                max="600"
                step="25"
                value={foodCost}
                onChange={(e) => setFoodCost(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Home / Utilities */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Casa + limpieza + internet + tlf:</span>
                <span className="text-blue-400 font-mono font-bold">{homeCost} €</span>
              </div>
              <input
                type="range"
                min="500"
                max="900"
                step="25"
                value={homeCost}
                onChange={(e) => setHomeCost(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Extras mobility */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Extras movilidad / transporte:</span>
                <span className="text-purple-400 font-mono font-bold">{mobilityCost} €</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                step="25"
                value={mobilityCost}
                onChange={(e) => setMobilityCost(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Extras lo que sea */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Extras ocio / imprevistos / lo que sea:</span>
                <span className="text-pink-400 font-mono font-bold">{extraMiscCost} €</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                step="25"
                value={extraMiscCost}
                onChange={(e) => setExtraMiscCost(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Deslices Simulator in Food */}
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2 mt-2">
              <span className="text-xs font-bold text-rose-300 block">
                Simular Deslices: Comer fuera en Madrid
              </span>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Comidas/Cenas fuera al mes:</span>
                <span className="font-mono text-rose-400 font-bold">{dinnersOutPerMonth} veces</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={dinnersOutPerMonth}
                onChange={(e) => setDinnersOutPerMonth(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[10px] text-rose-300/80">
                Fuga generada: -{dinnersOutPerMonth * leakPerDinner}€/mes (-{(dinnersOutPerMonth * leakPerDinner) * 6}€ en 6 meses).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Detailed Milestones Timeline */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Hitos Paso a Paso de tu Proyección a 6 Meses</span>
            </h3>
            <p className="text-xs text-slate-400">
              Qué consigues exactamente cada mes al cumplir la rutina y el presupuesto:
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Total 6 Meses: {sixMonthDisciplinedTotal.toLocaleString('es-ES')} €
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIX_MONTH_MILESTONES.map((item) => {
            const calculatedAccum = monthlySavingsDisciplined * item.month;
            return (
              <div
                key={item.month}
                className="bg-slate-900/70 border border-slate-700/50 rounded-xl p-4 space-y-2.5 relative hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.label}
                  </span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    +{calculatedAccum.toLocaleString('es-ES')} €
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {item.milestoneTitle}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(item.month / 6) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
