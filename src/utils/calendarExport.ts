import { ScheduleBlock } from '../types';

export function exportScheduleToICS(blocks: ScheduleBlock[]): void {
  const dayMap: Record<string, string> = {
    lunes: 'MO',
    martes: 'TU',
    miercoles: 'WE',
    jueves: 'TH',
    viernes: 'FR',
    sabado: 'SA',
    domingo: 'SU',
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Rutina Semanal Personal//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Mi Rutina Semanal Personal (9-17h, Gym 19h, Correr 7am)',
    'X-WR-TIMEZONE:Europe/Madrid',
  ];

  // Calculate the upcoming Monday date in YYYYMMDD format
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon...
  const distanceToMonday = (1 - dayOfWeek + 7) % 7;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + (distanceToMonday === 0 ? 0 : distanceToMonday));

  const yyyy = mondayDate.getFullYear();
  const mm = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const dd = String(mondayDate.getDate()).padStart(2, '0');
  const baseMondayDate = `${yyyy}${mm}${dd}`;

  blocks.forEach((block, index) => {
    const daysRule = block.days.map((d) => dayMap[d]).filter(Boolean).join(',');
    if (!daysRule) return;

    const startH = block.timeStart.replace(':', '') + '00';
    const endH = block.timeEnd.replace(':', '') + '00';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:rutina-personal-${index}-${Date.now()}@semana-perfecta.local`);
    lines.push(`DTSTAMP:${yyyy}${mm}${dd}T080000Z`);
    lines.push(`DTSTART;TZID=Europe/Madrid:${baseMondayDate}T${startH}`);
    lines.push(`DTEND;TZID=Europe/Madrid:${baseMondayDate}T${endH}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${daysRule}`);
    lines.push(`SUMMARY:${escapeICS(block.title)}`);
    lines.push(`DESCRIPTION:${escapeICS(block.description + (block.location ? `\\nUbicación: ${block.location}` : ''))}`);
    if (block.location) {
      lines.push(`LOCATION:${escapeICS(block.location)}`);
    }
    lines.push('STATUS:CONFIRMED');

    // Add reminder alarm 15 minutes before event
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT15M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Recordatorio: ${escapeICS(block.title)}`);
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Mi_Rutina_Semanal_Personal.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeICS(str: string): string {
  return str.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}
