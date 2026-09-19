import { ScheduleBlock, DecisionBattle, HabitItem, DayOfWeek } from '../types';

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'Lun' },
  { id: 'martes', label: 'Martes', short: 'Mar' },
  { id: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { id: 'jueves', label: 'Jueves', short: 'Jue' },
  { id: 'viernes', label: 'Viernes', short: 'Vie' },
  { id: 'sabado', label: 'Sábado', short: 'Sáb' },
  { id: 'domingo', label: 'Domingo', short: 'Dom' },
];

export const INITIAL_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'block-morning-run-1',
    timeStart: '07:00',
    timeEnd: '07:45',
    title: 'Carrera Matinal (Zona 2)',
    category: 'run',
    description: '45 min activación aeróbica y luz solar para anclar el ritmo circadiano.',
    location: 'Parque del Retiro / Madrid Río',
    days: ['lunes', 'martes', 'jueves'],
  },
  {
    id: 'block-morning-rest-1',
    timeStart: '07:00',
    timeEnd: '07:45',
    title: 'Descanso Activo / Hidratación',
    category: 'rest',
    description: 'Electrolitos, estiramientos suaves y respiración diafragmática.',
    location: 'Casa',
    days: ['miercoles', 'viernes'],
  },
  {
    id: 'block-weekend-run',
    timeStart: '08:30',
    timeEnd: '10:00',
    title: 'Tirada Larga / Trail',
    category: 'run',
    description: 'Rodaje largo o salida a la sierra (Navacerrada/Cercedilla) o Casa de Campo.',
    location: 'Casa de Campo / Sierra de Guadarrama',
    days: ['sabado'],
  },
  {
    id: 'block-weekend-rest',
    timeStart: '09:00',
    timeEnd: '10:00',
    title: 'Paseo Recuperador & Sol',
    category: 'rest',
    description: 'Caminar 10.000 pasos bajo la luz natural matutina.',
    location: 'Parque del Oeste / Templo de Debod',
    days: ['domingo'],
  },
  {
    id: 'block-work-deep',
    timeStart: '08:00',
    timeEnd: '14:00',
    title: 'Trabajo Profundo & Comida Meal Prep',
    category: 'work',
    description: 'Bloque ininterrumpido sin reuniones de baja prioridad. Teléfono en modo avión. Almuerzo saludable preparado el domingo (13€/día).',
    location: 'Despacho / Coworking',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-weekend-life',
    timeStart: '10:30',
    timeEnd: '14:00',
    title: 'Proyectos Personales & Cultura',
    category: 'social',
    description: 'Lectura, aprendizajes o tiempo de calidad.',
    location: 'Cafeterías de especialidad / Museos Madrid',
    days: ['sabado'],
  },
  {
    id: 'block-weekend-mealprep',
    timeStart: '11:00',
    timeEnd: '14:00',
    title: 'Mercado de Abastos & Meal Prep Semanal',
    category: 'nutrition',
    description: 'Compra de producto fresco (Mercado de la Paz/Maravillas) y cocinado por lotes para L-V.',
    location: 'Mercado local & Cocina',
    days: ['domingo'],
  },
  {
    id: 'block-afternoon-work',
    timeStart: '14:30',
    timeEnd: '17:15',
    title: 'Trabajo Colaborativo & Cierre de Jornada',
    category: 'work',
    description: 'Reuniones estratégicas, emails y organización de prioridades del día siguiente.',
    location: 'Oficina / Home office',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  },
  {
    id: 'block-gym-sessions',
    timeStart: '17:30',
    timeEnd: '19:00',
    title: 'Gimnasio: Fuerza & Hipertrofia',
    category: 'gym',
    description: 'Rutina dividida (Torso / Pierna / Empuje / Tirón) con sobrecarga progresiva.',
    location: 'Gimnasio habitual',
    days: ['lunes', 'martes', 'jueves', 'viernes'],
  },
  {
    id: 'block-mobility-wednesday',
    timeStart: '17:30',
    timeEnd: '18:45',
    title: 'Movilidad Articular & Foam Roller',
    category: 'mobility',
    description: 'Descarga muscular, estiramientos de caderas y prevención de lesiones posturales.',
    location: 'Casa o estudio',
    days: ['miercoles'],
  },
  {
    id: 'block-dinner-winddown',
    timeStart: '20:30',
    timeEnd: '22:00',
    title: 'Cena Ligera + Desconexión Digital',
    category: 'nutrition',
    description: 'Proteína limpia + verduras. Apagado de pantallas, luces cálidas y lectura.',
    location: 'Casa',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  },
  {
    id: 'block-sleep-sacred',
    timeStart: '23:00',
    timeEnd: '06:45',
    title: 'Sueño No Negociable (8h / 5 Ciclos)',
    category: 'rest',
    description: 'Habitación a 18-19°C, oscuridad total (persianas de Madrid abajo). Máxima recuperación hormonal.',
    location: 'Dormitorio',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  },
];

export const INITIAL_DECISIONS: DecisionBattle[] = [
  {
    id: 'decision-food',
    nameGood: 'Comer en Casa (Meal Prep)',
    valGood: '13€ / día',
    metricGood: 35, // gasto menor = 35% del coste
    nameBad: 'Comer Fuera (Menú Madrid / Delivery)',
    valBad: '30€ / día',
    metricBad: 100,
    annualSavings: 6205, // (30-13) * 365 días laborables o anual
    insight: 'Ahorro anual directo: ~6.200€ + Control milimétrico de sodio, aceites vegetales refinados y macros.',
    category: 'finance',
  },
  {
    id: 'decision-training',
    nameGood: 'Entrenar a Primera / 17:30',
    valGood: '+30% Foco & Dopamina',
    metricGood: 95,
    nameBad: 'Saltarse el Entreno por "Cansancio"',
    valBad: '-30% Energía Mental',
    metricBad: 40,
    insight: 'El ejercicio físico regula el ritmo circadiano y la sensibilidad a la insulina mejor que cualquier estimulante.',
    category: 'cognition',
  },
  {
    id: 'decision-sleep',
    nameGood: 'Dormir a las 23:00 (8h completas)',
    valGood: '5 Ciclos REM / Profundo',
    metricGood: 100,
    nameBad: 'Quedarse en Redes / Series hasta las 24:30',
    valBad: '3 Ciclos Fraccionados',
    metricBad: 55,
    insight: 'Perder 1h de sueño nocturno reduce la recuperación muscular hasta un 40% y eleva la grelina (hambre por ultraprocesados) un 28%.',
    category: 'recovery',
  },
  {
    id: 'decision-social',
    nameGood: 'Cerveza 0,0% / Agua con Gas en el Afterwork',
    valGood: 'Sueño profundo intacto',
    metricGood: 90,
    nameBad: '3 Cañas con Alcohol un Jueves Noche',
    valBad: 'HRV destruido y niebla mental',
    metricBad: 30,
    insight: 'El alcohol bloquea la fase REM del sueño. Cambiarlo entre semana protege tu rendimiento cognitivo del viernes.',
    category: 'cognition',
  },
];

export const MADRID_HOTSPOTS = [
  {
    name: 'Parque del Buen Retiro',
    type: 'Carrera & Sol matinal',
    tip: 'El perímetro de tierra (4,5 km) es ideal para articulaciones antes de las 08:30 h.',
  },
  {
    name: 'Madrid Río',
    type: 'Intervalos & Bicicleta',
    tip: 'Línea recta llana de más de 8 km, perfecta para tiradas controladas sin semáforos.',
  },
  {
    name: 'Casa de Campo',
    type: 'Desconexión & Trail',
    tip: 'La zona del Lago y el Pinar ofrecen desnivel y aire puro para los fines de semana.',
  },
  {
    name: 'Mercado de la Paz / Maravillas',
    type: 'Meal Prep de Calidad',
    tip: 'Pescado blanco, huevos camperos y carne de pasto a mejor precio y frescura que el súper estándar.',
  },
];

export function getHabitsForDay(day: DayOfWeek): HabitItem[] {
  const isWeekend = day === 'sabado' || day === 'domingo';
  
  const baseHabits: HabitItem[] = [
    {
      id: 'h-morning-sun',
      name: 'Luz solar matinal (10-15 min en exterior)',
      category: 'rest',
      impactScore: 15,
      time: '07:00 - 08:00',
      completed: false,
    },
    {
      id: 'h-hydration',
      name: 'Hidratación óptima (500ml agua + pizca sal marina/electrolitos)',
      category: 'nutrition',
      impactScore: 10,
      time: '07:15',
      completed: false,
    },
  ];

  if (day === 'lunes' || day === 'martes' || day === 'jueves') {
    baseHabits.push({
      id: 'h-run',
      name: 'Carrera Zona 2 (45 min sin picos de pulso)',
      category: 'run',
      impactScore: 20,
      time: '07:00',
      completed: false,
    });
  } else if (day === 'miercoles' || day === 'viernes') {
    baseHabits.push({
      id: 'h-mobility-am',
      name: 'Descanso activo o estiramientos matinales',
      category: 'mobility',
      impactScore: 15,
      time: '07:15',
      completed: false,
    });
  }

  if (!isWeekend) {
    baseHabits.push(
      {
        id: 'h-deepwork',
        name: 'Bloque Trabajo Profundo (sin teléfono ni notificaciones)',
        category: 'work',
        impactScore: 25,
        time: '08:30 - 13:30',
        completed: false,
      },
      {
        id: 'h-mealprep-lunch',
        name: 'Comida Meal Prep casera (ahorro 17€ vs restaurante)',
        category: 'nutrition',
        impactScore: 15,
        time: '14:00',
        completed: false,
      },
      {
        id: 'h-gym',
        name: day === 'miercoles' ? 'Sesión de Movilidad & Foam Roller' : 'Sesión Gimnasio / Fuerza',
        category: day === 'miercoles' ? 'mobility' : 'gym',
        impactScore: 20,
        time: '17:30',
        completed: false,
      }
    );
  } else {
    baseHabits.push(
      {
        id: 'h-weekend-active',
        name: day === 'sabado' ? 'Tirada larga o ruta de montaña' : 'Mercado de abastos & Meal Prep semanal',
        category: day === 'sabado' ? 'run' : 'nutrition',
        impactScore: 25,
        time: '10:00',
        completed: false,
      },
      {
        id: 'h-weekend-mental',
        name: 'Desconexión laboral & tiempo libre de calidad',
        category: 'social',
        impactScore: 20,
        time: 'Tarde',
        completed: false,
      }
    );
  }

  baseHabits.push(
    {
      id: 'h-digital-sunset',
      name: 'Desconexión de pantallas 1h antes de dormir',
      category: 'rest',
      impactScore: 15,
      time: '21:30',
      completed: false,
    },
    {
      id: 'h-sleep-target',
      name: 'En la cama antes de las 23:00 (objetivo: 8 horas)',
      category: 'rest',
      impactScore: 25,
      time: '23:00',
      completed: false,
    }
  );

  return baseHabits;
}
