import { DayOfWeek } from '../types';

export function getMadridDate(): Date {
  // Return current Date adjusted or represented in Europe/Madrid
  const now = new Date();
  const madridString = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
  return new Date(madridString);
}

export function getMadridDayOfWeek(): DayOfWeek {
  const d = getMadridDate();
  const dayIndex = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const map: Record<number, DayOfWeek> = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
  };
  return map[dayIndex] || 'lunes';
}

export function formatMadridTime(date: Date = getMadridDate()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseMinutesFromTimeStr(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
