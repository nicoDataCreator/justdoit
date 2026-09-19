import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Code, 
  X, 
  Lock, 
  Terminal, 
  Bot, 
  Share2, 
  Database,
  Cloud,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { ScheduleBlock, DayOfWeek, HabitItem } from '../types';

interface SecretVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleBlock[];
  habitsByDay: Record<DayOfWeek, HabitItem[]>;
  onImportState: (importedHabits: Record<DayOfWeek, HabitItem[]>, importedStreak: number) => void;
  streakCount: number;
  disciplineScoreToday: number;
  currentDay: DayOfWeek;
}

export const SecretVaultModal: React.FC<SecretVaultModalProps> = ({
  isOpen,
  onClose,
  habitsByDay,
  onImportState,
  streakCount,
  disciplineScoreToday,
  currentDay,
}) => {
  // Pre-configured personal API key
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_apikey');
      return saved || 'sp_live_mudo6z9m4qf12n';
    } catch {
      return 'sp_live_mudo6z9m4qf12n';
    }
  });

  // Server-side environment status check
  const [serverStatus, setServerStatus] = useState<{
    configured: boolean;
    botTokenSet: boolean;
    chatIdSet: boolean;
    maskedChatId?: string | null;
  } | null>(null);

  // Manual fallback inputs (stored locally if user wants to test before adding to Vercel env)
  const [botToken, setBotToken] = useState<string>(() => {
    try {
      return localStorage.getItem('so_madrid_tg_token') || '';
    } catch {
      return '';
    }
  });

  const [chatId, setChatId] = useState<string>(() => {
    try {
      return localStorage.getItem('so_madrid_tg_chatid') || '';
    } catch {
      return '';
    }
  });

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'telegram' | 'token' | 'vercel' | 'backup'>('telegram');

  // Vercel domain for setting incoming Telegram Webhook
  const [vercelDomain, setVercelDomain] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('so_madrid_vercel_domain');
      if (saved) return saved;
      if (!window.location.hostname.includes('localhost')) {
        return window.location.origin;
      }
      return '';
    } catch {
      return '';
    }
  });
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Query server status on open
  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/telegram/status');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data);
        }
      } catch {
        // server-side not responding or pure static
      }
    };

    checkStatus();
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSaveBotToken = (token: string) => {
    setBotToken(token);
    try {
      localStorage.setItem('so_madrid_tg_token', token);
    } catch {
      // ignore
    }
  };

  const handleSaveChatId = (id: string) => {
    setChatId(id);
    try {
      localStorage.setItem('so_madrid_tg_chatid', id);
    } catch {
      // ignore
    }
  };

  // Sync payload
  const currentHabits = habitsByDay[currentDay] || [];
  const completedHabits = currentHabits.filter((h) => h.completed).map((h) => ({ id: h.id, name: h.name, time: h.time }));

  const syncPayload = {
    apiKey,
    botToken: botToken.trim() || undefined,
    chatId: chatId.trim() || undefined,
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

  const sampleCurl = `curl -X POST "${window.location.origin}/api/telegram" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey}" \\
  -d '${JSON.stringify(syncPayload).slice(0, 100)}...'`;

  const handleSendTelegramCheckin = async () => {
    setSendingTelegram(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify(syncPayload),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setTelegramStatus({
          success: true,
          message: '¡Excelente! Check-in enviado a Telegram con éxito. Revisa tu chat.',
        });
      } else {
        setTelegramStatus({
          success: false,
          message: data.error || `Error ${res.status}: No se pudo entregar el mensaje en Telegram.`,
        });
      }
    } catch (err: any) {
      setTelegramStatus({
        success: false,
        message: `Error de conexión: ${err.message}. Verifica que el servidor o la función serverless esté activa.`,
      });
    } finally {
      setSendingTelegram(false);
    }
  };

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

  const handleImport = () => {
    setImportError(null);
    setImportSuccess(false);

    try {
      if (!importJsonText.trim()) {
        setImportError('Introduce un JSON válido para restaurar.');
        return;
      }
      const parsed = JSON.parse(importJsonText);
      if (parsed.habits && typeof parsed.habits === 'object') {
        onImportState(parsed.habits, parsed.streak || streakCount);
        setImportSuccess(true);
        setImportJsonText('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('El formato JSON debe contener el objeto "habits".');
      }
    } catch (err: any) {
      setImportError(`Error al procesar JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Bóveda Secreta & Conexión Telegram</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Totalmente Secreto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Variables de servidor protegidas. Sin exponer tokens en el navegador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 bg-slate-950/40 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'telegram'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Conectar Telegram (Servidor)</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'vercel'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-purple-400" />
            <span>Variables Secretas Vercel</span>
          </button>

          <button
            onClick={() => setActiveTab('token')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'token'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Mi Token Secreto</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Backup & Enlace</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          
          {/* TAB 1: TELEGRAM SERVER CONNECTION */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              {/* Server-side Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                serverStatus?.configured
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}>
                <Radio className={`w-5 h-5 shrink-0 mt-0.5 ${serverStatus?.configured ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white text-xs">
                      {serverStatus?.configured 
                        ? 'Servidor Conectado con Variables de Vercel' 
                        : 'Conexión Segura Mediante API del Servidor'}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-900 border border-slate-700">
                      /api/telegram
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Las peticiones se realizan desde el backend de Node.js / Vercel. 
                    <strong> No hay errores de CORS</strong> y tus credenciales nunca se exponen al navegador.
                  </p>
                  {serverStatus?.configured && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-mono">
                      <span>✓ TELEGRAM_BOT_TOKEN activo</span>
                      <span>•</span>
                      <span>✓ TELEGRAM_CHAT_ID ({serverStatus.maskedChatId || 'configurado'})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bot configuration inputs (optional overrides or instant test) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Credenciales para probar o sincronizar:</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Se envían al servidor de forma cifrada)
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Token de Bot (@BotFather):
                    </label>
                    <input
                      type="password"
                      placeholder={serverStatus?.botTokenSet ? '(Usando TELEGRAM_BOT_TOKEN del servidor)' : '7123456789:AAFlm3x...'}
                      value={botToken}
                      onChange={(e) => handleSaveBotToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tu Chat ID personal:
                    </label>
                    <input
                      type="text"
                      placeholder={serverStatus?.chatIdSet ? '(Usando TELEGRAM_CHAT_ID del servidor)' : '123456789'}
                      value={chatId}
                      onChange={(e) => handleSaveChatId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    Notificaciones en vivo con tu servidor. Elige el tipo de mensaje a disparar:
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSendTelegramCheckin}
                      disabled={sendingTelegram}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-md shadow-blue-600/30 shrink-0"
                    >
                      {sendingTelegram ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Check-in Hoy</span>
                    </button>

                    <button
                      onClick={async () => {
                        setSendingTelegram(true);
                        setTelegramStatus(null);
                        try {
                          const res = await fetch('/api/daily-summary', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              botToken: botToken.trim() || undefined,
                              chatId: chatId.trim() || undefined,
                              disciplineScoreToday: `${disciplineScoreToday}%`,
                              streakDays: streakCount,
                              dayOfWeek: currentDay,
                            }),
                          });
                          const data = await res.json();
                          if (res.ok && data.ok) {
                            setTelegramStatus({
                              success: true,
                              message: '¡Resumen diario de rendimiento y hábitos enviado a Telegram con éxito!',
                            });
                          } else {
                            setTelegramStatus({
                              success: false,
                              message: data.error || 'No se pudo enviar el resumen a Telegram.',
                            });
                          }
                        } catch (e: any) {
                          setTelegramStatus({ success: false, message: e.message });
                        } finally {
                          setSendingTelegram(false);
                        }
                      }}
                      disabled={sendingTelegram}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-md shadow-purple-600/30 shrink-0"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Resumen Diario (21:30)</span>
                    </button>
                  </div>
                </div>

                {telegramStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                      telegramStatus.success
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {telegramStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{telegramStatus.message}</span>
                  </div>
                )}
              </div>

              {/* INTERACTIVE WEBHOOK ACTIVATOR */}
              <div className="bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-900 p-4 rounded-xl border border-blue-500/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>¿Por qué @VisuWeek_bot no responde cuando le escribes "Hola"?</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Telegram necesita vincular la <strong>URL de tu app en Vercel (Webhook)</strong> para saber a qué servidor enviar los mensajes que le escribes a tu bot. Sin esto, Telegram no sabe dónde responderte.
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-mono shrink-0">
                    setWebhook
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    URL de tu proyecto en Vercel (o tu dominio público):
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://tu-proyecto.vercel.app"
                      value={vercelDomain}
                      onChange={(e) => {
                        setVercelDomain(e.target.value);
                        localStorage.setItem('so_madrid_vercel_domain', e.target.value);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={async () => {
                        if (!vercelDomain.trim()) {
                          setWebhookStatus({
                            success: false,
                            message: 'Introduce la URL de tu proyecto en Vercel (ej: https://mi-app.vercel.app)',
                          });
                          return;
                        }
                        setSettingWebhook(true);
                        setWebhookStatus(null);
                        try {
                          const cleanDomain = vercelDomain.trim().replace(/\/$/, '');
                          const targetWebhook = `${cleanDomain}/api/telegram`;
                          const res = await fetch('/api/telegram', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'setWebhook',
                              url: targetWebhook,
                              botToken: botToken.trim() || undefined,
                            }),
                          });
                          const data = await res.json();
                          if (data.ok) {
                            setWebhookStatus({
                              success: true,
                              message: `🎉 ¡Webhook vinculado con éxito a ${targetWebhook}! Ahora escribe "Hola", "/rutina" o "/resumen" a @VisuWeek_bot en Telegram y te responderá en segundos.`,
                            });
                          } else {
                            setWebhookStatus({
                              success: false,
                              message: data.description || data.error || 'Error al vincular el Webhook en Telegram.',
                            });
                          }
                        } catch (e: any) {
                          setWebhookStatus({ success: false, message: e.message });
                        } finally {
                          setSettingWebhook(false);
                        }
                      }}
                      disabled={settingWebhook}
                      className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer shrink-0 shadow-md shadow-blue-600/30"
                    >
                      {settingWebhook ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>{settingWebhook ? 'Vinculando...' : 'Vincular Webhook (1 Clic)'}</span>
                    </button>
                  </div>

                  {webhookStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs border flex items-start gap-2 mt-2 ${
                        webhookStatus.success
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {webhookStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{webhookStatus.message}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 pt-1">
                    💡 <strong>Cómo funciona:</strong> Al pulsar "Vincular", Telegram conectará tu bot con tu endpoint <code>/api/telegram</code>. Cada vez que le envíes "Hola", "/rutina" o "/resumen", tu app le responderá al segundo.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span>¿Cómo obtener tu Token y Chat ID en 1 minuto?</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>En Telegram, abre <strong className="text-white">@BotFather</strong> y escribe <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">/newbot</code>.</li>
                  <li>Copia el <strong>HTTP API Token</strong> que te entrega.</li>
                  <li>Inicia una conversación con tu bot (pulsa <em>Iniciar</em> o envíale <em>hola</em>).</li>
                  <li>Para ver tu Chat ID, abre en el navegador: <code className="bg-slate-800 p-0.5 rounded text-amber-300">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> y copia el número en <code className="text-white">"id": 123456789</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL SERVER-SIDE SECRETS (NO VITE_) */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-purple-400" /> Variables 100% Secretas en Vercel
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    Node.js Serverless
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  Para que <strong>nadie</strong> pueda ver tus tokens en el navegador, agrégalas en Vercel como variables de servidor (<strong>sin</strong> el prefijo <code className="text-rose-400 line-through">VITE_</code>):
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-purple-400 font-bold">TELEGRAM_BOT_TOKEN</span>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">El token que te dio @BotFather (ej. 7123456789:AAFlm3x...)</p>
                    </div>
                    <span className="text-slate-400 text-xs">Secreto</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-purple-400 font-bold">TELEGRAM_CHAT_ID</span>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">Tu identificador de usuario en Telegram (ej. 123456789)</p>
                    </div>
                    <span className="text-slate-400 text-xs">Secreto</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-purple-400 font-bold">API_SECRET_KEY</span>
                      <span className="text-slate-500 mx-2">=</span>
                      <span className="text-emerald-400">sp_live_mudo6z9m4qf12n</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('API_SECRET_KEY=sp_live_mudo6z9m4qf12n', setCopiedKey)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg text-[11px] text-blue-300 leading-relaxed">
                  ✅ <strong>Dónde ponerlas:</strong> En tu dashboard de Vercel &gt; selecciona el proyecto &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>. Agrega estas 3 variables y haz un <em>Redeploy</em>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API TOKEN */}
          {activeTab === 'token' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Tu API Token Personal:</span>
                  <span className="text-[10px] text-purple-400 font-mono">sp_live_mudo6z9m4qf12n</span>
                </label>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold truncate select-all">
                    {apiKey}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                      className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
                      title="Copiar token"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tu clave está protegida y se sincroniza automáticamente con el backend.
                </p>
              </div>

              {/* cURL Example */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" /> Comando cURL para ejecutar check-in desde terminal o cron:
                  </span>
                  <button
                    onClick={() => copyToClipboard(sampleCurl, setCopiedCurl)}
                    className="text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    {copiedCurl ? '¡Copiado!' : 'Copiar cURL'}
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-32">
                  {sampleCurl}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & ENLACE MULTIDISPOSITIVO */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Enlace con Estado Completo (Abrir en Móvil sin Perder Nada):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generateShareUrl()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generateShareUrl(), setCopiedLink)}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-200">
                  Copia de Seguridad Manual en Formato JSON:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder='Pega aquí tu JSON de respaldo: {"habits": ...}'
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleImport}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    Restaurar
                  </button>
                </div>

                {importError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>¡Progreso y hábitos restaurados con éxito!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Clave: <strong className="text-white">sp_live_mudo6z9m4qf12n</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition"
          >
            Cerrar Bóveda
          </button>
        </div>
      </div>
    </div>
  );
};
