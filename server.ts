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

  // Send check-in or custom message to Telegram completely server-side
  app.post(['/api/telegram', '/api/telegram/send'], async (req, res) => {
    try {
      // Prioritize totally secret server-side environment variables
      const botToken = (process.env.TELEGRAM_BOT_TOKEN || req.body?.botToken || '').trim();
      const chatId = (process.env.TELEGRAM_CHAT_ID || req.body?.chatId || '').trim();

      if (!botToken) {
        return res.status(400).json({
          ok: false,
          error: 'Falta el TELEGRAM_BOT_TOKEN. Configúralo en las variables de entorno de Vercel/servidor o proporciónalo en el formulario.',
        });
      }

      if (!chatId) {
        return res.status(400).json({
          ok: false,
          error: 'Falta el TELEGRAM_CHAT_ID. Configúralo en las variables de entorno de Vercel/servidor o proporciónalo en el formulario.',
        });
      }

      const payload = req.body || {};
      let textMessage = payload.message;

      // If no custom text is sent, construct the rich daily Madrid check-in message
      if (!textMessage) {
        const score = payload.disciplineScoreToday || '100%';
        const streak = payload.streakDays || 5;
        const day = payload.dayOfWeek ? String(payload.dayOfWeek).toUpperCase() : 'HOY';
        const habitsList = Array.isArray(payload.habitsCompleted) && payload.habitsCompleted.length > 0
          ? payload.habitsCompleted.map((h: any) => `• ${h.name} (${h.time})`).join('\n')
          : '• Todos los bloques clave ejecutados';

        textMessage = `🌟 *Check-in: Semana Perfecta Madrid*\n\n` +
          `📅 *Día:* ${day}\n` +
          `🎯 *Disciplina diaria:* ${score}\n` +
          `🔥 *Racha activa:* ${streak} días\n` +
          `💰 *Ahorro mensual:* 900€ / mes (5.400€ a 6 meses)\n\n` +
          `📋 *Hábitos cumplidos:* \n${habitsList}\n\n` +
          `📍 *Horario clave:* 9-17h Trabajo • 7am Run • 14h Sol • 19h Gym • Casa (400€/mes)\n` +
          `⏱️ *Hora Madrid:* ${new Date().toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' })}`;
      }

      // Call Telegram API from the server (NO browser CORS restrictions, NO token exposure)
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const telegramResponse = await fetch(telegramUrl, {
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
