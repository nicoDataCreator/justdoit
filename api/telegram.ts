// Vercel Serverless Function: /api/telegram
// Handles both outbound notifications AND incoming Webhook messages from @VisuWeek_bot

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Api-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || req.query?.botToken || '').trim();
  const defaultChatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || req.query?.chatId || '').trim();

  // Helper to generate Madrid day info
  const getMadridInfo = () => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' }).toLowerCase();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });
    return { dayOfWeek, timeStr, dateStr };
  };

  // 1. GET requests: Status check or Webhook registration
  if (req.method === 'GET') {
    const action = req.query?.action;

    // Action: Set Webhook directly with Telegram
    if (action === 'setWebhook' && botToken) {
      const webhookUrl = req.query?.url;
      if (!webhookUrl) {
        return res.status(400).json({ ok: false, error: 'Falta el parámetro url para el webhook' });
      }

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        const tgData = await tgRes.json();
        return res.status(200).json(tgData);
      } catch (err: any) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }

    // Action: Get Webhook Info
    if (action === 'getWebhookInfo' && botToken) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const tgData = await tgRes.json();
        return res.status(200).json(tgData);
      } catch (err: any) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }

    // Default: Return server configuration status
    return res.status(200).json({
      configured: Boolean(botToken && defaultChatId),
      botTokenSet: Boolean(botToken),
      chatIdSet: Boolean(defaultChatId),
      maskedChatId: defaultChatId ? `...${defaultChatId.slice(-4)}` : null,
      environment: process.env.NODE_ENV || 'production',
    });
  }

  // 2. POST requests: Incoming Telegram Webhook OR Outbound App Dispatch
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};

    // Check if this is an explicit action from the UI to set the webhook
    if (payload.action === 'setWebhook') {
      const targetUrl = payload.url || (process.env.APP_URL ? `${process.env.APP_URL}/api/telegram` : '');
      if (!botToken || !targetUrl) {
        return res.status(400).json({ ok: false, error: 'Se requiere botToken y URL de destino para el webhook' });
      }
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetUrl)}`);
      const tgData = await tgRes.json();
      return res.status(200).json(tgData);
    }

    if (!botToken) {
      return res.status(400).json({
        ok: false,
        error: 'Falta TELEGRAM_BOT_TOKEN en las variables de entorno de Vercel.',
      });
    }

    // Check if this is an INCOMING update from Telegram Webhook (user typing to the bot)
    const isIncomingTelegramUpdate = Boolean(payload.message && typeof payload.message === 'object' && payload.message.chat);
    
    let targetChatId = defaultChatId;
    let replyText = '';

    if (isIncomingTelegramUpdate) {
      targetChatId = payload.message.chat.id.toString();
      const userText = (payload.message.text || '').trim().toLowerCase();
      const userName = payload.message.from?.first_name || 'Nico';
      const { dayOfWeek, timeStr, dateStr } = getMadridInfo();

      const isRunningDay = ['lunes', 'martes', 'jueves'].includes(dayOfWeek);
      const isGymDay = ['lunes', 'martes', 'jueves', 'viernes'].includes(dayOfWeek);

      // Handle user commands
      if (userText.includes('hola') || userText.includes('/start') || userText.includes('buenas') || userText.includes('hey')) {
        replyText = `👋 <b>¡Hola ${userName}!</b> Soy tu asistente <b>@VisuWeek_bot</b> para tu <b>Semana Perfecta Madrid</b>.\n\n` +
          `Estoy conectado y listo para acompañarte en tu rutina:\n` +
          `• 🏃 <b>Running 7:00 am</b> (Lunes, Martes, Jueves)\n` +
          `• 💼 <b>Trabajo Foco</b> (09:00 - 17:00)\n` +
          `• ☀️ <b>Lectura + Sol</b> (14:00)\n` +
          `• 🍲 <b>Comida en Casa</b> (Meta: 400€/mes)\n` +
          `• 🏋️ <b>Gimnasio 19:00 h</b> (L, M, J, V)\n` +
          `• 💰 <b>Ahorro:</b> 900 € / mes (5.400 € a 6 meses)\n\n` +
          `<b>Comandos rápidos:</b>\n` +
          `👉 /resumen - Ver resumen diario y disciplina\n` +
          `👉 /rutina - Horario y bloques de hoy\n` +
          `👉 /ahorro - Finanzas y proyección a 6 meses\n` +
          `👉 /checkin - Registrar que cumpliste hoy`;
      } else if (userText.includes('/resumen') || userText.includes('resumen')) {
        replyText = `📊 <b>RESUMEN DIARIO: SEMANA PERFECTA MADRID</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📅 <b>${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</b> • ${timeStr} CET\n` +
          `🎯 <b>Disciplina:</b> 100% | 🔥 <b>Racha:</b> Activa\n\n` +
          `⚡ <b>RUTINA DE HOY (${dayOfWeek.toUpperCase()}):</b>\n` +
          `• ${isRunningDay ? '🏃 Running 07:00 am (Zona 2): Cumplido' : '🧘 Mañana: Descanso/Movilidad'}\n` +
          `• 💼 Trabajo Foco (09:00 - 17:00): 8h completadas\n` +
          `• ☀️ Lectura + Sol (14:00): 45 min de Vitamina D y calma\n` +
          `• 🍲 Comida en Casa: 13,30€ ahorrados hoy (Meta 400€/mes)\n` +
          `• ${isGymDay ? '🏋️ Gimnasio 19:00 h: Sesión de fuerza completada' : '🧘 Tarde: Descanso'}\n\n` +
          `💰 <b>Ahorro del mes:</b> 900 € | <b>Meta 6 meses:</b> 5.400 € acumulados\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🧠 <b>¡A descansar! Mañana a las 07:00 am zapatillas listas.</b>`;
      } else if (userText.includes('/rutina') || userText.includes('rutina') || userText.includes('horario')) {
        replyText = `📅 <b>HORARIO DE HOY (${dayOfWeek.toUpperCase()} - MADRID)</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• 07:00 - 07:45 🏃 ${isRunningDay ? 'Running Zona 2 (Retiro/Madrid)' : 'Movilidad matutina / Paseo ligero'}\n` +
          `• 08:00 - 08:50 🚿 Ducha, desayuno en casa & planning\n` +
          `• 09:00 - 14:00 💼 Trabajo Bloque Foco (0 distracciones)\n` +
          `• 14:00 - 14:45 ☀️ Lectura + Sol (Vitamina D al aire libre)\n` +
          `• 14:45 - 15:15 🍲 Comida casera (Presupuesto 400€/mes)\n` +
          `• 15:15 - 17:00 💼 Trabajo Bloque Cierre\n` +
          `• 17:00 - 19:00 🚶 Transición / Recados / Desconexión\n` +
          `• 19:00 - 20:30 🏋️ ${isGymDay ? 'Gimnasio: Fuerza & Hipertrofia' : 'Descanso / Paseo'}\n` +
          `• 21:00 - 21:45 🥗 Cena ligera en casa\n` +
          `• 23:00 😴 Sueño regenerativo (7h 45m objetivo)`;
      } else if (userText.includes('/ahorro') || userText.includes('ahorro') || userText.includes('finanzas')) {
        replyText = `💰 <b>SISTEMA FINANCIERO: OBJETIVO 6 MESES</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📥 <b>Ingresos mensuales mínimos:</b> 2.300 €\n\n` +
          `📤 <b>Gastos estructurados:</b> 1.400 €\n` +
          `• 🏡 Casa + Limpieza + Internet + Teléfono: <b>600 €</b>\n` +
          `• 🛒 Comida en casa (todos los días): <b>400 €</b>\n` +
          `• 🚗 Extras movilidad: <b>200 €</b>\n` +
          `• 🎟️ Extras ocio / imprevistos: <b>200 €</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💎 <b>AHORRO NETO MENSUAL:</b> <b>900 € / mes</b> (39,1%)\n` +
          `🎯 <b>PROYECCIÓN A 6 MESES:</b> <b>5.400 € acumulados</b>\n` +
          `📈 <b>Proyección a 1 año:</b> 10.800 € libres`;
      } else if (userText.includes('/checkin') || userText.includes('checkin') || userText.includes('hecho') || userText.includes('listo')) {
        replyText = `✅ <b>¡Check-in registrado con éxito, ${userName}!</b>\n\n` +
          `Has protegido tu racha de hábitos hoy. Cada día cumplido suma +30 € de ahorro protegido y máximo rendimiento cognitivo.\n\n` +
          `¡Sigue así! Nos vemos mañana a las 7:00 am. 🔥`;
      } else {
        replyText = `Entendido, ${userName} 👍\n\n` +
          `Escribe uno de los comandos para interactuar:\n` +
          `• /resumen - Resumen completo de rendimiento\n` +
          `• /rutina - Horario detallado de hoy\n` +
          `• /ahorro - Balance y proyección de 5.400€\n` +
          `• /checkin - Confirmar tus hábitos de hoy`;
      }
    } else {
      // OUTBOUND DISPATCH from the Web Application
      if (!targetChatId) {
        return res.status(400).json({
          ok: false,
          error: 'Falta TELEGRAM_CHAT_ID. Configúralo en Vercel > Settings > Environment Variables.',
        });
      }

      if (typeof payload.message === 'string' && payload.message.trim()) {
        replyText = payload.message;
      } else {
        const score = payload.disciplineScoreToday || '100%';
        const streak = payload.streakDays || 5;
        const day = payload.dayOfWeek ? String(payload.dayOfWeek).toUpperCase() : 'HOY';
        const habitsList = Array.isArray(payload.habitsCompleted) && payload.habitsCompleted.length > 0
          ? payload.habitsCompleted.map((h: any) => `• ${h.name} (${h.time})`).join('\n')
          : '• Todos los bloques ejecutados';

        replyText = `🌟 *Check-in: Semana Perfecta Madrid*\n\n` +
          `📅 *Día:* ${day}\n` +
          `🎯 *Disciplina:* ${score}\n` +
          `🔥 *Racha activa:* ${streak} días\n` +
          `💰 *Ahorro mensual:* 900€ / mes (5.400€ a 6 meses)\n\n` +
          `📋 *Hábitos cumplidos:* \n${habitsList}\n\n` +
          `📍 *Horario:* 9-17h Trabajo • 7am Run • 14h Sol • 19h Gym • Casa (400€/mes)\n` +
          `⏱️ *Hora:* ${new Date().toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' })}`;
      }
    }

    // Send reply via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: replyText,
        parse_mode: isIncomingTelegramUpdate ? 'HTML' : 'Markdown',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return res.status(response.status || 400).json({
        ok: false,
        error: data.description || 'Error devuelto por la API de Telegram.',
        telegramCode: data.error_code,
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Mensaje procesado y entregado en Telegram',
      messageId: data.result?.message_id,
    });
  } catch (err: any) {
    console.error('Telegram Handler Error:', err);
    return res.status(500).json({
      ok: false,
      error: `Error interno de servidor: ${err.message}`,
    });
  }
}
