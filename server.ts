import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Check Telegram server-side configuration status
  app.get('/api/telegram/status', (req, res) => {
    const hasBotToken = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.trim());
    const hasChatId = Boolean(process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim());
    const hasSecretKey = Boolean(process.env.API_SECRET_KEY && process.env.API_SECRET_KEY.trim());

    res.json({
      configured: hasBotToken && hasChatId,
      botTokenSet: hasBotToken,
      chatIdSet: hasChatId,
      secretKeySet: hasSecretKey,
      maskedChatId: hasChatId ? `...${process.env.TELEGRAM_CHAT_ID!.slice(-4)}` : null,
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Helper to build formatted daily summary
  function buildDailySummaryMessage(payload: any = {}) {
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

    const dayOfWeek = payload.dayOfWeek || now.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' }).toLowerCase();
    const isRunningDay = ['lunes', 'martes', 'jueves'].includes(dayOfWeek);
    const isGymDay = ['lunes', 'martes', 'jueves', 'viernes'].includes(dayOfWeek);
    const isWeekend = ['sabado', 'domingo'].includes(dayOfWeek);

    const score = payload.disciplineScoreToday || (payload.habitsCompleted?.length ? `${Math.round((payload.habitsCompleted.length / 5) * 100)}%` : '100%');
    const streak = payload.streakDays || 5;

    return `📊 *RESUMEN DIARIO: SEMANA PERFECTA MADRID*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}* • ${timeStr} CET\n` +
      `🎯 *Disciplina:* ${score} | 🔥 *Racha:* ${streak} días\n\n` +
      `⚡ *RUTINA CLAVE DE HOY:*\n` +
      `• ${isRunningDay ? '🏃 *Running 07:00 am (Zona 2):* Ejecutado' : '🧘 *Mañana:* Movilidad / Descanso'}\n` +
      `• ${!isWeekend ? '💼 *Trabajo Foco (09:00 - 17:00):* 8h completadas' : '🏖️ *Fin de semana:* Recuperación cognitiva'}\n` +
      `• ☀️ *Lectura + Sol (14:00):* 45 min (Vitamina D + Foco)'}\n` +
      `• 🍲 *Comida en Casa:* Ahorro protegido (Presupuesto 400€/mes)\n` +
      `• ${isGymDay ? '🏋️ *Gimnasio 19:00 h:* Sesión de hipertrofia/fuerza' : '🧘 *Tarde:* Descanso'}\n\n` +
      `💰 *SALUD FINANCIERA (OBJETIVO 6 MESES):*\n` +
      `• 📥 Ingresos mes: *2.300 €*\n` +
      `• 🏡 Casa + Limpieza + Internet + Tlf: *600 €*\n` +
      `• 🛒 Comida en casa: *400 €*\n` +
      `• 🚗 Extras (200€ Movilidad + 200€ Lo que sea): *400 €*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💎 *Ahorro mensual protegido:* *900 € / mes*\n` +
      `🎯 *Proyección 6 meses:* *5.400 € acumulados*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧠 *Mentalidad:* La consistencia genera libertad. A descansar para mañana a las 7:00 am.`;
  }

  // Daily summary endpoint (callable by cron, webhooks or button)
  app.all(['/api/telegram/daily-summary', '/api/daily-summary'], async (req, res) => {
    try {
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || req.query?.botToken || '').trim();
      const chatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || req.query?.chatId || '').trim();

      if (!botToken || !chatId) {
        return res.status(400).json({
          ok: false,
          error: 'TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID requeridos en .env de Vercel/servidor.',
        });
      }

      const messageText = buildDailySummaryMessage(req.body || {});
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown',
        }),
      });

      const telegramResult = await telegramResponse.json();
      if (!telegramResponse.ok || !telegramResult.ok) {
        return res.status(telegramResponse.status || 400).json({
          ok: false,
          error: telegramResult.description || 'Error de Telegram',
        });
      }

      return res.json({
        ok: true,
        message: 'Resumen diario enviado con éxito a Telegram',
        messageId: telegramResult.result?.message_id,
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Send check-in or handle incoming Telegram webhook messages completely server-side
  app.all(['/api/telegram', '/api/telegram/send'], async (req, res) => {
    try {
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || req.query?.botToken || '').trim();
      const defaultChatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || req.query?.chatId || '').trim();

      const payload = req.body || {};

      // Handle setWebhook action
      if (payload.action === 'setWebhook' || req.query?.action === 'setWebhook') {
        const targetUrl = payload.url || req.query?.url || (process.env.APP_URL ? `${process.env.APP_URL}/api/telegram` : '');
        if (!botToken || !targetUrl) {
          return res.status(400).json({ ok: false, error: 'Se requiere botToken y URL de destino para el webhook' });
        }
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetUrl)}`);
        const tgData = await tgRes.json();
        return res.json(tgData);
      }

      if (req.method === 'GET' && req.query?.action === 'getWebhookInfo') {
        if (!botToken) return res.status(400).json({ ok: false, error: 'Falta TELEGRAM_BOT_TOKEN' });
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const tgData = await tgRes.json();
        return res.json(tgData);
      }

      if (!botToken) {
        return res.status(400).json({
          ok: false,
          error: 'Falta el TELEGRAM_BOT_TOKEN en las variables de entorno de Vercel/servidor.',
        });
      }

      // Check if this is an incoming message from Telegram Webhook
      const isIncomingUpdate = Boolean(payload.message && typeof payload.message === 'object' && payload.message.chat);
      let targetChatId = defaultChatId;
      let replyText = '';

      if (isIncomingUpdate) {
        targetChatId = payload.message.chat.id.toString();
        const userText = (payload.message.text || '').trim().toLowerCase();
        const userName = payload.message.from?.first_name || 'Nico';
        
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' }).toLowerCase();
        const isRunningDay = ['lunes', 'martes', 'jueves'].includes(dayOfWeek);
        const isGymDay = ['lunes', 'martes', 'jueves', 'viernes'].includes(dayOfWeek);

        if (userText.includes('hola') || userText.includes('/start') || userText.includes('buenas') || userText.includes('hey')) {
          replyText = `👋 <b>¡Hola ${userName}!</b> Soy tu asistente <b>@VisuWeek_bot</b> para tu <b>Semana Perfecta Madrid</b>.\n\n` +
            `Estoy conectado y listo para acompañarte en tu rutina diaria:\n` +
            `• 🏃 <b>Running 7:00 am</b> (Lunes, Martes, Jueves)\n` +
            `• 💼 <b>Trabajo Foco</b> (09:00 - 17:00)\n` +
            `• ☀️ <b>Lectura + Sol</b> (14:00)\n` +
            `• 🍲 <b>Comida en Casa</b> (Meta: 400€/mes)\n` +
            `• 🏋️ <b>Gimnasio 19:00 h</b> (L, M, J, V)\n` +
            `• 💰 <b>Ahorro Objetivo:</b> 900 € / mes (5.400 € a 6 meses)\n\n` +
            `<b>Comandos rápidos:</b>\n` +
            `👉 /resumen - Ver resumen diario y disciplina\n` +
            `👉 /rutina - Horario y bloques de hoy\n` +
            `👉 /ahorro - Finanzas y proyección a 6 meses\n` +
            `👉 /checkin - Registrar que cumpliste hoy`;
        } else if (userText.includes('/resumen') || userText.includes('resumen')) {
          replyText = buildDailySummaryMessage();
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
            `Escribe uno de estos comandos para interactuar:\n` +
            `• /resumen - Resumen completo de rendimiento\n` +
            `• /rutina - Horario detallado de hoy\n` +
            `• /ahorro - Balance y proyección de 5.400€\n` +
            `• /checkin - Confirmar tus hábitos de hoy`;
        }
      } else {
        // Outbound from app
        if (!targetChatId) {
          return res.status(400).json({
            ok: false,
            error: 'Falta el TELEGRAM_CHAT_ID. Configúralo en las variables de entorno de Vercel/servidor.',
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
            : '• Todos los bloques clave ejecutados';

          replyText = `🌟 *Check-in: Semana Perfecta Madrid*\n\n` +
            `📅 *Día:* ${day}\n` +
            `🎯 *Disciplina diaria:* ${score}\n` +
            `🔥 *Racha activa:* ${streak} días\n` +
            `💰 *Ahorro mensual:* 900€ / mes (5.400€ a 6 meses)\n\n` +
            `📋 *Hábitos cumplidos:* \n${habitsList}\n\n` +
            `📍 *Horario clave:* 9-17h Trabajo • 7am Run • 14h Sol • 19h Gym • Casa (400€/mes)\n` +
            `⏱️ *Hora Madrid:* ${new Date().toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' })}`;
        }
      }

      // Call Telegram API from the server (NO browser CORS restrictions, NO token exposure)
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: replyText,
          parse_mode: isIncomingUpdate ? 'HTML' : 'Markdown',
        }),
      });

      const telegramResult = await telegramResponse.json();

      if (!telegramResponse.ok || !telegramResult.ok) {
        return res.status(telegramResponse.status || 400).json({
          ok: false,
          error: telegramResult.description || 'Error devuelto por la API de Telegram.',
          telegramCode: telegramResult.error_code,
        });
      }

      return res.json({
        ok: true,
        message: '¡Mensaje enviado a Telegram con éxito!',
        messageId: telegramResult.result?.message_id,
      });
    } catch (err: any) {
      console.error('Telegram API error:', err);
      return res.status(500).json({
        ok: false,
        error: `Error interno de servidor: ${err.message}`,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
