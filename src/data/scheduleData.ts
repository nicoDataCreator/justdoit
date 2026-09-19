import { ScheduleBlock, DecisionBattle, HabitItem, DayOfWeek, PersonalBudget, MonthMilestone } from '../types';

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'Lun' },
  { id: 'martes', label: 'Martes', short: 'Mar' },
  { id: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { id: 'jueves', label: 'Jueves', short: 'Jue' },
  { id: 'viernes', label: 'Viernes', short: 'Vie' },
  { id: 'sabado', label: 'Sábado', short: 'Sáb' },
  { id: 'domingo', label: 'Domingo', short: 'Dom' },
];

export const INITIAL_BUDGET: PersonalBudget = {
  monthlyIncome: 2300, // 2.300 € mínimo
  foodAtHome: 400, // 400 € comida en casa
  homeUtilities: 600, // 600 € casa + limpieza + internet + teléfono
  mobilityExtras: 200, // 200 € extras movilidad
  miscellaneousExtras: 200, // 200 € extras lo que sea / ocio
};

export const SIX_MONTH_MILESTONES: MonthMilestone[] = [
  {
    month: 1,
    label: 'Mes 1',
    savedAccumulated: 900,
    savedImperfect: 450,
    milestoneTitle: 'Inercia de Hierro (+900 €)',
    description: 'Primer mes completado: Comida en casa clavada (400€) y presupuesto blindado. 900€ limpios ahorrados.',
  },
  {
    month: 2,
    label: 'Mes 2',
    savedAccumulated: 1800,
    savedImperfect: 900,
    milestoneTitle: 'Consolidación del Hábito (+1.800 €)',
    description: 'Ya superas 1 mes entero de gastos fijos totales en el banco. Cero ansiedad financiera.',
  },
  {
    month: 3,
    label: 'Mes 3',
    savedAccumulated: 2700,
    savedImperfect: 1350,
    milestoneTitle: 'Fondo de Emergencia Inicial (+2.700 €)',
    description: '2 meses completos de supervivencia asegurados sin depender de ninguna nómina inminente.',
  },
  {
    month: 4,
    label: 'Mes 4',
    savedAccumulated: 3600,
    savedImperfect: 1800,
    milestoneTitle: 'Muro Antifrágil (+3.600 €)',
    description: 'Rutina automatizada: Correr a las 7 am, Gym a las 19 h y sol a las 14 h sin gastar de más.',
  },
  {
    month: 5,
    label: 'Mes 5',
    savedAccumulated: 4500,
    savedImperfect: 2250,
    milestoneTitle: 'Colchón de Seguridad Superior (+4.500 €)',
    description: 'Más de 3 meses de gastos fijos blindados (600€ casa + 400€ comida + 400€ extras x 3). Paz mental absoluta.',
  },
  {
    month: 6,
    label: 'Mes 6',
    savedAccumulated: 5400,
    savedImperfect: 2700,
    milestoneTitle: 'Objetivo Semestral Conquistado (+5.400 €)',
    description: '¡5.400 € NETOS acumulados en 6 meses! Capital listo para cuenta remunerada, fondos indexados o proyectos propios.',
  },
];

export const INITIAL_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'block-morning-run',
    timeStart: '07:00',
    timeEnd: '08:00',
    title: 'Correr Matinal (Zona 2)',
    category: 'run',
    description: 'Activación aeróbica de 7:00 a 8:00 am. Ritmo cómodo y constante para activar el metabolismo sin fatiga.',
    location: 'Exterior / Parque / Madrid Río / Retiro',
    days: ['lunes', 'martes', 'jueves'],
  },
  {
    id: 'block-morning-rest',
    timeStart: '07:15',
    timeEnd: '08:00',
    title: 'Activación Suave & Hidratación',
    category: 'rest',
    description: 'Día de descanso de carrera. 500ml de agua, movilidad suave y preparación matinal con calma.',
    location: 'Casa',
    days: ['miercoles', 'viernes'],
  },
  {
    id: 'block-breakfast-home',
    timeStart: '08:00',
    timeEnd: '08:45',
    title: 'Desayuno en Casa (Presupuesto Ahorro)',
    category: 'nutrition',
    description: 'Desayuno nutritivo en casa (huevos, avena, café de especialidad casero). 0€ en cafeterías.',
    location: 'Casa',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-work-morning',
    timeStart: '09:00',
    timeEnd: '14:00',
    title: 'Jornada Laboral - Bloque Mañana',
    category: 'work',
    description: 'Trabajo de 9:00 am a 17:00 pm. Foco ininterrumpido en tareas de alto valor. Entregar resultados clave.',
    location: 'Puesto de trabajo / Oficina / Remoto',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-lunch-reading-sun',
    timeStart: '14:00',
    timeEnd: '15:00',
    title: 'Lectura + Sol (14:00 h) & Comida en Casa',
    category: 'nutrition',
    description: 'Pausa de las 14:00 h: Almuerzo casero (clave de los 400€/mes en comida) + 20-30 min de lectura al sol para recargar vitamina D y foco.',
    location: 'Casa / Terraza / Parque cercano con sol',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-work-afternoon',
    timeStart: '15:00',
    timeEnd: '17:00',
    title: 'Jornada Laboral - Bloque Tarde',
    category: 'work',
    description: 'Cierre de la jornada laboral hasta las 17:00 pm. Revisión final, tareas operativas y desconexión puntual a las 17:00.',
    location: 'Puesto de trabajo / Oficina / Remoto',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-transition-rest',
    timeStart: '17:00',
    timeEnd: '18:45',
    title: 'Desconexión Laboral & Tiempo Personal',
    category: 'rest',
    description: 'Fin de jornada laboral a las 17:00. Tiempo libre, gestiones del hogar, descanso o recados antes del entrenamiento.',
    location: 'Casa / Ciudad',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-gym-evening',
    timeStart: '19:00',
    timeEnd: '20:30',
    title: 'GYM: Fuerza & Hipertrofia (19:00 h)',
    category: 'gym',
    description: 'Entrenamiento de gimnasio a las 19:00 h (hora flexible pero fijada a las 19h). Sobrecarga progresiva, torso/pierna/empuje/tirón.',
    location: 'Gimnasio',
    days: ['lunes', 'martes', 'jueves', 'viernes'],
  },
  {
    id: 'block-dinner-home',
    timeStart: '21:00',
    timeEnd: '22:00',
    title: 'Cena en Casa & Cocina Ahorro',
    category: 'nutrition',
    description: 'Cena saludable preparada en casa. Mantener el presupuesto estricto de 400€ en comida evitando delivery o restaurantes.',
    location: 'Casa',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  },
  {
    id: 'block-sleep-target',
    timeStart: '23:00',
    timeEnd: '06:45',
    title: 'Sueño Reparador (23:00 - 06:45)',
    category: 'rest',
    description: 'Descanso sagrado de 7h45min para rendir al 100% en el trabajo de 9 a 17h, correr a las 7am y levantar en el gym a las 19h.',
    location: 'Dormitorio',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  },
  // Fines de semana
  {
    id: 'block-weekend-morning-sun',
    timeStart: '09:30',
    timeEnd: '11:00',
    title: 'Activación de Fin de Semana & Paseo',
    category: 'rest',
    description: 'Paseo tranquilo al aire libre, café con calma y desconexión.',
    location: 'Parque / Ciudad',
    days: ['sabado', 'domingo'],
  },
  {
    id: 'block-weekend-reading-sun',
    timeStart: '14:00',
    timeEnd: '15:30',
    title: 'Lectura + Sol de Fin de Semana (14:00 h)',
    category: 'social',
    description: 'Sesión de lectura reposada bajo el sol de las 14:00 h. Nutrición mental y recarga solar.',
    location: 'Terraza / Parque / Lugar soleado',
    days: ['sabado', 'domingo'],
  },
  {
    id: 'block-weekend-mealprep',
    timeStart: '11:00',
    timeEnd: '13:30',
    title: 'Compra Inteligente (Súper/Mercado) & Cocina',
    category: 'nutrition',
    description: 'Compra planificada para asegurar el presupuesto de 400€/mes en comida y dejar listas opciones para la semana.',
    location: 'Supermercado & Cocina',
    days: ['domingo'],
  },
];

export const INITIAL_DECISIONS: DecisionBattle[] = [
  {
    id: 'decision-food',
    nameGood: 'Comer en Casa Todos los Días',
    valGood: '400 € / mes (13€/día)',
    metricGood: 35,
    nameBad: 'Comer fuera / Delivery frecuente',
    valBad: '650-800 € / mes (+250€ leak)',
    metricBad: 100,
    annualSavings: 3000,
    insight: 'Comer en casa todos los días te permite clavar tus 400€/mes en comida y proteger tus 900€ de ahorro mensual neto (5.400€ en 6 meses).',
    category: 'finance',
  },
  {
    id: 'decision-gym',
    nameGood: 'Ir al GYM a las 19:00 h (L, M, J, V)',
    valGood: '4 sesiones/semana cumplidas',
    metricGood: 95,
    nameBad: 'Posponer el GYM por pereza a las 19:00',
    valBad: '0 sesiones y culpa acumulada',
    metricBad: 25,
    insight: 'A las 19:00 ponte la ropa de entreno sin pensar. La regla de los 5 minutos hace que una vez en la puerta del gym termines la rutina completa.',
    category: 'cognition',
  },
  {
    id: 'decision-run',
    nameGood: 'Correr a las 7:00 am (L, M, J)',
    valGood: 'Zona 2 matinal completada',
    metricGood: 90,
    nameBad: 'Quedarse en la cama hasta las 8:30',
    valBad: 'Sin cardio y energía apagada',
    metricBad: 35,
    insight: 'Salir a las 7:00 am te deja la victoria física asegurada antes de empezar tu jornada de trabajo de 9:00 a 17:00.',
    category: 'recovery',
  },
  {
    id: 'decision-sun-reading',
    nameGood: 'Lectura + Sol a las 14:00 h',
    valGood: 'Vitamina D + 20 páginas leídas',
    metricGood: 85,
    nameBad: 'Mirar el móvil encerrado a las 14:00',
    valBad: 'Pico de cortisol y fatiga visual',
    metricBad: 30,
    insight: 'Romper la jornada laboral de 9 a 17h a las 14:00 con sol y lectura resetea la mente para la segunda mitad del día.',
    category: 'cognition',
  },
];

export const MADRID_HOTSPOTS = [
  {
    name: 'Parque del Buen Retiro',
    type: 'Carrera 7:00 am & Sol 14:00 h',
    tip: 'Circuito de tierra blanda para articulaciones y bancos con sol directo a las 14:00 h para lectura.',
  },
  {
    name: 'Madrid Río',
    type: 'Carrera Matinal Continua (7:00 am)',
    tip: 'Tramos rectos sin cruces ideales para mantener pulsaciones en Zona 2 sin interrupciones.',
  },
  {
    name: 'Parque del Oeste / Templo de Debod',
    type: 'Lectura + Sol de Fin de Semana',
    tip: 'Vistas despejadas hacia la sierra y césped soleado perfecto a las 14:00 h los sábados y domingos.',
  },
  {
    name: 'Mercado / Supermercado de Barrio',
    type: 'Control Presupuesto Comida (400€/mes)',
    tip: 'Comprar legumbres, huevos, pollo/pescado, fruta y verdura de temporada para comer sano y en presupuesto.',
  },
];

export function getHabitsForDay(day: DayOfWeek): HabitItem[] {
  const isWeekend = day === 'sabado' || day === 'domingo';
  
  const baseHabits: HabitItem[] = [];

  // Correr lunes, martes y jueves a las 7 am
  if (day === 'lunes' || day === 'martes' || day === 'jueves') {
    baseHabits.push({
      id: 'h-run-7am',
      name: 'Correr a las 7:00 am (Zona 2 controlada)',
      category: 'run',
      impactScore: 20,
      time: '07:00 - 08:00',
      completed: false,
    });
  } else if (day === 'miercoles' || day === 'viernes') {
    baseHabits.push({
      id: 'h-rest-active-am',
      name: 'Activación matinal & Hidratación (500ml)',
      category: 'rest',
      impactScore: 10,
      time: '07:15',
      completed: false,
    });
  }

  // Trabajo de 9 am a 5 pm (Lunes a Viernes)
  if (!isWeekend) {
    baseHabits.push({
      id: 'h-work-9-5',
      name: 'Jornada Laboral Cumplida (09:00 am a 17:00 pm)',
      category: 'work',
      impactScore: 25,
      time: '09:00 - 17:00',
      completed: false,
    });
  }

  // Lectura + sol a las 14 horas (+ fines de semana)
  baseHabits.push({
    id: 'h-reading-sun-14h',
    name: 'Lectura + Sol a las 14:00 h (20-30 min al exterior)',
    category: isWeekend ? 'social' : 'rest',
    impactScore: 15,
    time: '14:00 - 15:00',
    completed: false,
  });

  // Comer en casa para ahorrar todos los días
  baseHabits.push({
    id: 'h-home-meals',
    name: 'Comer en casa (Desayuno, Comida, Cena) - Presupuesto 400€/mes',
    category: 'nutrition',
    impactScore: 20,
    time: 'Todo el día',
    completed: false,
  });

  // GYM lunes, martes, jueves, viernes a las 19 horas
  if (day === 'lunes' || day === 'martes' || day === 'jueves' || day === 'viernes') {
    baseHabits.push({
      id: 'h-gym-19h',
      name: 'GYM a las 19:00 h (Fuerza / Hipertrofia)',
      category: 'gym',
      impactScore: 20,
      time: '19:00 - 20:30',
      completed: false,
    });
  }

  // Fin de semana hábito extra
  if (isWeekend) {
    baseHabits.push({
      id: 'h-weekend-prep',
      name: day === 'domingo' ? 'Compra semanal (400€ comida) & Meal Prep' : 'Descanso activo & Ocio dentro de los 200€ extras',
      category: 'nutrition',
      impactScore: 15,
      time: 'Mañana',
      completed: false,
    });
  }

  // Control financiero del día
  baseHabits.push({
    id: 'h-budget-control',
    name: 'Cero fugas de dinero (Ahorro diario protegido: 30€/día = 900€/mes)',
    category: 'nutrition',
    impactScore: 15,
    time: 'Cierre día',
    completed: false,
  });

  // Sueño reparador
  baseHabits.push({
    id: 'h-sleep-target',
    name: 'En la cama a las 23:00 h para despertar con energía',
    category: 'rest',
    impactScore: 15,
    time: '23:00',
    completed: false,
  });

  return baseHabits;
}

