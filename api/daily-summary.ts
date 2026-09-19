// Vercel Serverless Function: /api/daily-summary
// Diseñado para ser ejecutado automáticamente por Vercel Cron o llamadas externas
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || req.query?.botToken || '').trim();
    const chatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || req.query?.chatId || '').trim();

    if (!botToken || !chatId) {
      return res.status(400).json({
        ok: false,
        error: 'TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID son obligatorios en las variables de entorno de Vercel.',
      });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      timeZone: 'Europe/Madrid' 
    });
    const timeStr = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'Europe/Madrid' 
    });

    const dayOfWeek = (req.body?.dayOfWeek || now.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' })).toLowerCase();
    const isRunningDay = ['lunes', 'martes', 'jueves'].includes(dayOfWeek);
    const isGymDay = ['lunes', 'martes', 'jueves', 'viernes'].includes(dayOfWeek);
    const isWeekend = ['sabado', 'domingo'].includes(dayOfWeek);

    const score = req.body?.disciplineScoreToday || '100%';
    const streak = req.body?.streakDays || 5;

    const messageText = `📊 *RESUMEN DIARIO: SEMANA PERFECTA MADRID*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}* • ${timeStr} CET\n` +
      `🎯 *Disciplina:* ${score} | 🔥 *Racha:* ${streak} días\n\n` +
      `⚡ *RUTINA CLAVE DE HOY:*\n` +
      `• ${isRunningDay ? '🏃 *Running 07:00 am (Zona 2):* Cumplido' : '🧘 *Mañana:* Movilidad / Descanso'}\n` +
      `• ${!isWeekend ? '💼 *Trabajo Foco (09:00 - 17:00):* 8h completadas' : '🏖️ *Fin de semana:* Recuperación cognitiva'}\n` +
      `• ☀️ *Lectura + Sol (14:00):* 45 min de Vitamina D y calma\n` +
      `• 🍲 *Comida en Casa:* +13,30€ ahorrados hoy (Meta 400€/mes)\n` +
      `• ${isGymDay ? '🏋️ *Gimnasio 19:00 h:* Sesión de fuerza completada' : '🧘 *Tarde:* Descanso'}\n\n` +
      `💰 *SALUD FINANCIERA (OBJETIVO 6 MESES):*\n` +
      `• 📥 Ingresos mes: *2.300 €*\n` +
      `• 🏡 Casa + Limpieza + Net + Tlf: *600 €*\n` +
      `• 🛒 Comida en casa: *400 €*\n` +
      `• 🚗 Extras (200€ Movilidad + 200€ Imprevistos): *400 €*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💎 *Ahorro mensual protegido:* *900 € / mes*\n` +
      `🎯 *Proyección 6 meses:* *5.400 € acumulados*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧠 *Mentalidad:* La consistencia genera libertad. A descansar para mañana a las 7:00 am.`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return res.status(response.status || 400).json({
        ok: false,
        error: data.description || 'Error devuelto por la API de Telegram.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Resumen diario enviado con éxito a Telegram',
      messageId: data.result?.message_id,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
