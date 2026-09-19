import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Share2, 
  Download, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  CheckCircle2,
  Code
} from 'lucide-react';
import { ScheduleBlock, DayOfWeek, HabitItem } from '../types';
import { exportScheduleToICS } from '../utils/calendarExport';

interface SyncManagerProps {
  schedule: ScheduleBlock[];
  habitsByDay: Record<DayOfWeek, HabitItem[]>;
  onImportState: (importedHabits: Record<DayOfWeek, HabitItem[]>, importedStreak: number) => void;
  streakCount: number;
  disciplineScoreToday: number;
  currentDay: DayOfWeek;
}

export const SyncManager: React.FC<SyncManagerProps> = ({
  schedule,
  habitsByDay,
  onImportState,
  streakCount,
  disciplineScoreToday,
  currentDay,
}) => {
  // API Key & Webhook state
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_apikey');
      if (saved) return saved;
      const newKey = 'sp_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('so_madrid_apikey', newKey);
      return newKey;
    } catch {
      return 'sp_live_user_madrid';
    }
  });

  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('so_madrid_webhook') || '';
    } catch {
      return '';
    }
  });

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Save webhook to storage
  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    try {
      localStorage.setItem('so_madrid_webhook', url);
    } catch {
      // ignore
    }
  };

  const handleRegenerateKey = () => {
    if (window.confirm('¿Deseas generar una nueva API Key / Token personal?')) {
      const newKey = 'sp_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
      setApiKey(newKey);
      try {
        localStorage.setItem('so_madrid_apikey', newKey);
      } catch {
        // ignore
      }
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Generate current sync payload
  const currentHabits = habitsByDay[currentDay] || [];
  const completedHabits = currentHabits.filter((h) => h.completed).map((h) => ({ id: h.id, name: h.name, time: h.time }));

  const syncPayload = {
    apiKey,
    timestamp: new Date().toISOString(),
    dayOfWeek: currentDay,
    disciplineScoreToday: `${disciplineScoreToday}%`,
    streakDays: streakCount,
    monthlySavingsTarget: 900,
    sixMonthAccumulatedTarget: 5400,
    habitsTotal: currentHabits.length,
    habitsCompletedCount: completedHabits.length,
    habitsCompleted: completedHabits,
    routine: {
      work: '09:00 - 17:00 (L-V)',
      running: '07:00 am (L, M, J)',
      gym: '19:00 h (L, M, J, V)',
      readingAndSun: '14:00 h (+ fines de semana)',
      meals: 'Comer en casa todos los días (Presupuesto: 400€/mes)',
    },
  };

  // Webhook sender
  const handleSendWebhook = async () => {
    if (!webhookUrl) {
      setWebhookStatus({
        success: false,
        message: 'Por favor introduce una URL de Webhook válida (ej. Zapier, Make, Notion o tu endpoint).',
      });
      return;
    }

    setSendingWebhook(true);
    setWebhookStatus(null);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(syncPayload),
      });

      if (res.ok) {
        setWebhookStatus({
          success: true,
          message: `Check-in enviado con éxito. Código de respuesta: ${res.status}.`,
        });
      } else {
        setWebhookStatus({
          success: false,
          message: `El servidor respondió con código ${res.status}. Verifica que el endpoint acepte POST.`,
        });
      }
    } catch (err: any) {
      setWebhookStatus({
        success: false,
        message: `Error al enviar: ${err.message || 'Error de red o CORS en el webhook'}. Asegúrate de que el endpoint permita peticiones desde navegador.`,
      });
    } finally {
      setSendingWebhook(false);
    }
  };

  // Generate shareable URL with state
  const generateShareUrl = () => {
    try {
      const stateObj = {
        key: apiKey,
        streak: streakCount,
        habits: habitsByDay,
      };
      const jsonStr = JSON.stringify(stateObj);
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
      return `${window.location.origin}${window.location.pathname}?syncData=${encoded}`;
    } catch {
      return `${window.location.origin}${window.location.pathname}?syncKey=${apiKey}`;
    }
  };

  // Handle Import JSON
  const handleImport = () => {
    setImportError(null);
    setImportSuccess(false);

    try {
      if (!importJsonText.trim()) {
        setImportError('Introduce un JSON válido para importar.');
        return;
      }
      const parsed = JSON.parse(importJsonText);
      if (parsed.habits && typeof parsed.habits === 'object') {
        onImportState(parsed.habits, parsed.streak || streakCount);
        setImportSuccess(true);
        setImportJsonText('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('El formato JSON no contiene la propiedad "habits" requerida.');
      }
    } catch (err: any) {
      setImportError(`Error al procesar JSON: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-blue-400" />
            <span>Sincronización, API Key & Exportación de Calendario</span>
          </h2>
          <p className="text-sm text-slate-400">
            Descarga tu calendario (.ics), envía tus check-ins mediante API o Webhook y sincroniza tu progreso en cualquier dispositivo.
          </p>
        </div>

        {/* Quick ICS download button */}
        <button
          id="btn-sync-download-ics"
          onClick={() => exportScheduleToICS(schedule)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Bajar a Calendario (.ICS)</span>
        </button>
      </div>

      {/* Grid: 3 Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module 1: Personal API Key & Webhook Sync */}
        <div className="lg:col-span-6 bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Tu Clave Personal (API Key / Sync Token)</span>
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Activa
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Esta clave identifica tu cuenta y tus datos de rutina. Úsala para conectar con tus automatizaciones (Notion, Telegram, Make, Zapier o scripts locales).
          </p>

          {/* API Key Box */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-blue-300 truncate select-all">{apiKey}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Copiar API Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRegenerateKey}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Regenerar clave"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Webhook Endpoint Configuration */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              URL de Webhook / API de Notificación:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://hook.eu1.make.com/... o tu bot de Telegram"
                value={webhookUrl}
                onChange={(e) => handleSaveWebhook(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                id="btn-send-webhook"
                onClick={handleSendWebhook}
                disabled={sendingWebhook}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
              >
                {sendingWebhook ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Enviar Check-in</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Al pulsar "Enviar Check-in", se envía un POST con tus hábitos de hoy ({disciplineScoreToday}% completado) y tu racha de {streakCount} días.
            </p>

            {webhookStatus && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  webhookStatus.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                {webhookStatus.message}
              </div>
            )}
          </div>

          {/* JSON Payload Preview */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Code className="w-3.5 h-3.5 text-blue-400" /> Payload JSON enviado a la API:
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(syncPayload, null, 2), setCopiedJson)}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                {copiedJson ? '¡Copiado!' : 'Copiar JSON'}
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-44 scrollbar-thin">
              {JSON.stringify(syncPayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Module 2: Calendario & Enlace Compartible */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Calendar Download & Sync Instructions */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Bajar a Calendario (.ICS)</span>
              </h3>
              <span className="text-xs text-slate-400">Google / Apple / Outlook</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Exporta tus eventos no negociables configurados con exactitud:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span><strong>Correr:</strong> L, M, J a las 7:00 am</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span><strong>Trabajo:</strong> L-V de 9:00 a 17:00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span><strong>Lectura + Sol:</strong> 14:00 h (+findes)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span><strong>GYM:</strong> L, M, J, V a las 19:00 h</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => exportScheduleToICS(schedule)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo .ICS</span>
              </button>
              <a
                href="https://calendar.google.com/calendar/r/settings/export"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition"
              >
                <span>Importar a Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Share Link with State */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Enlace Compartible con Estado</span>
              </h3>
              <span className="text-xs text-slate-400">Multi-dispositivo</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Genera una URL directa que incluye tu clave y el estado de tus hábitos marcados para abrirlo en tu móvil sin perder nada.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generateShareUrl()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate select-all"
              />
              <button
                onClick={() => copyToClipboard(generateShareUrl(), setCopiedLink)}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Copia de Seguridad & Importar Progreso</span>
              </h3>
              <span className="text-xs text-slate-400">JSON</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder='Pega aquí tu JSON de backup {"habits": ...}'
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleImport}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Restaurar
              </button>
            </div>

            {importError && (
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>¡Hábitos y progreso restaurados exitosamente!</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
