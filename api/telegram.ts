// Vercel Serverless Function: /api/telegram
export default async function handler(req: any, res: any) {
  // Enable CORS for frontend requests
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

  // Status check
  if (req.method === 'GET') {
    const hasBotToken = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.trim());
    const hasChatId = Boolean(process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim());
    const hasSecretKey = Boolean(process.env.API_SECRET_KEY && process.env.API_SECRET_KEY.trim());

    return res.status(200).json({
      configured: hasBotToken && hasChatId,
      botTokenSet: hasBotToken,
      chatIdSet: hasChatId,
      secretKeySet: hasSecretKey,
      maskedChatId: hasChatId ? `...${process.env.TELEGRAM_CHAT_ID!.slice(-4)}` : null,
      environment: process.env.NODE_ENV || 'production',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || '').trim();
    const chatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || '').trim();

    if (!botToken) {
      return res.status(400).json({
        ok: false,
        error: 'Falta TELEGRAM_BOT_TOKEN. Configúralo en Vercel > Settings > Environment Variables.',
      });
    }

    if (!chatId) {
      return res.status(400).json({
        ok: false,
        error: 'Falta TELEGRAM_CHAT_ID. Configúralo en Vercel > Settings > Environment Variables.',
      });
    }

    const payload = req.body || {};
    let textMessage = payload.message;

    if (!textMessage) {
      const score = payload.disciplineScoreToday || '100%';
      const streak = payload.streakDays || 5;
      const day = payload.dayOfWeek ? String(payload.dayOfWeek).toUpperCase() : 'HOY';
      const habitsList = Array.isArray(payload.habitsCompleted) && payload.habitsCompleted.length > 0
        ? payload.habitsCompleted.map((h: any) => `• ${h.name} (${h.time})`).join('\n')
        : '• Todos los bloques ejecutados';

      textMessage = `🌟 *Check-in: Semana Perfecta Madrid*\n\n` +
        `📅 *Día:* ${day}\n` +
        `🎯 *Disciplina:* ${score}\n` +
        `🔥 *Racha activa:* ${streak} días\n` +
        `💰 *Ahorro mensual:* 900€ / mes (5.400€ a 6 meses)\n\n` +
        `📋 *Hábitos cumplidos:* \n${habitsList}\n\n` +
        `📍 *Horario:* 9-17h Trabajo • 7am Run • 14h Sol • 19h Gym • Casa (400€/mes)\n` +
        `⏱️ *Hora:* ${new Date().toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' })}`;
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMessage,
        parse_mode: 'Markdown',
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
      message: '¡Mensaje enviado a Telegram con éxito!',
      messageId: data.result?.message_id,
    });
  } catch (err: any) {
    console.error('Vercel Telegram serverless function error:', err);
    return res.status(500).json({
      ok: false,
      error: `Error interno de servidor: ${err.message}`,
    });
  }
}
