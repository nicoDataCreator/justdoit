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
    'PRODID:-//Sistema Operativo Semana Perfecta Madrid//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Semana Perfecta Madrid',
    'X-WR-TIMEZONE:Europe/Madrid',
  ];

  // Pick a base Monday for recurrent event definition
  // e.g. 20260921 (next Monday)
  const baseMondayDate = '20260921';

  blocks.forEach((block, index) => {
    const daysRule = block.days.map((d) => dayMap[d]).filter(Boolean).join(',');
    if (!daysRule) return;

    const startH = block.timeStart.replace(':', '') + '00';
    const endH = block.timeEnd.replace(':', '') + '00';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:semana-perfecta-${index}-${Date.now()}@madrid.so`);
    lines.push(`DTSTAMP:20260919T120000Z`);
    lines.push(`DTSTART;TZID=Europe/Madrid:${baseMondayDate}T${startH}`);
    lines.push(`DTEND;TZID=Europe/Madrid:${baseMondayDate}T${endH}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${daysRule}`);
    lines.push(`SUMMARY:${escapeICS(block.title)}`);
    lines.push(`DESCRIPTION:${escapeICS(block.description + (block.location ? `\\nUbicación: ${block.location}` : ''))}`);
    if (block.location) {
      lines.push(`LOCATION:${escapeICS(block.location)}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Semana_Perfecta_Madrid.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeICS(str: string): string {
  return str.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}
