import type {
  CargoModuleDef,
  DepartmentMessage,
  DifficultyConfig,
  DifficultyId,
  InteractableContent,
  InteractableId,
  LaunchFailureMode,
  RocketModule,
  RoleDefinition,
  RoleId,
  RoomDefinition,
  RoomId,
} from '../types/mission';

export const GROUND_FLOOR_Y = 0.63;
export const EYE_HEIGHT = 1.75;

export const DIFFICULTY_CONFIGS: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'EASY · LEO',
    badge: 'Earth Orbit (LEO)',
    targetBody: 'earth',
    targetName: 'Earth Orbit (LEO)',
    subtitle: '412 km orbital insertion, science payload validation, and ocean recovery.',
    maxMassKg: 6500,
    maxVolumeM3: 11.5,
    maxBudgetM: 150,
    minSciencePts: 40,
    maxScienceDisplay: 140,
    minDeltaVMps: 3200,
    minCommsMbps: 24,
    maxScheduleDays: 240,
    baseRiskPct: 5,
    maxAllowedRiskPct: 26,
    briefingObjective:
      'Complete the 6 cooperative phases (72 minigames) to design, verify, and operate an Earth Orbit (LEO) mission within margins.',
  },
  medium: {
    id: 'medium',
    label: 'MEDIUM · THE MOON',
    badge: 'The Moon',
    targetBody: 'moon',
    targetName: 'The Moon',
    subtitle: 'Translunar injection, polar survey, high Δv budget, and Earth return.',
    maxMassKg: 5000,
    maxVolumeM3: 9.5,
    maxBudgetM: 100,
    minSciencePts: 75,
    maxScienceDisplay: 160,
    minDeltaVMps: 4500,
    minCommsMbps: 28,
    maxScheduleDays: 225,
    baseRiskPct: 8,
    maxAllowedRiskPct: 22,
    briefingObjective:
      'Pass all 4 cooperative Gates (G13, G23, G43, G53) and validate all 6 Annex C pillars to reach The Moon and return safely.',
  },
  hard: {
    id: 'hard',
    label: 'HARD · MARS',
    badge: 'Mars Expedition',
    targetBody: 'mars',
    targetName: 'Mars Expedition',
    subtitle: 'Interplanetary transfer, strict mass cap, DSN links, and anomaly recovery.',
    maxMassKg: 3800,
    maxVolumeM3: 8.0,
    maxBudgetM: 80,
    minSciencePts: 100,
    maxScienceDisplay: 180,
    minDeltaVMps: 5400,
    minCommsMbps: 34,
    maxScheduleDays: 215,
    baseRiskPct: 12,
    maxAllowedRiskPct: 18,
    briefingObjective:
      'Orchestrate tight mass, power, data, budget, and resilience limits to complete the Mars Expedition.',
  },
};

export const ROLES: RoleDefinition[] = [
  {
    id: 'systems',
    pdfRoleLabel: 'Mecánico (Operaciones / Space Systems Architect)',
    name: 'Mecánico · Operaciones',
    shortName: 'Mecánico · Ops',
    roomId: 'systems',
    roomName: 'Taller Mecánico y Estructura',
    colorHex: '#F97316',
    colorNumber: 0xf97316,
    accentBgClass: 'bg-orange-500',
    accentTextClass: 'text-orange-400',
    accentBorderClass: 'border-orange-500/40',
    focusQuestion: '¿Cabe, equilibra y resiste?',
    specialty: 'Masa, volumen 2D/3D, estructura, vibración y reparaciones (M* / O15*–O17*)',
    description:
      'Calcula masa y centro de masas, encaja módulos en cofia, ensaya vibración M33*/M52 y ejecuta mantenimiento/reparación O15*–O17*.',
  },
  {
    id: 'finance',
    pdfRoleLabel: 'Gestor de proyecto (Program Manager)',
    name: 'Gestor de proyecto',
    shortName: 'Gestor',
    roomId: 'finance',
    roomName: 'Centro de Gestión y Presupuesto',
    colorHex: '#EAB308',
    colorNumber: 0xeab308,
    accentBgClass: 'bg-yellow-500',
    accentTextClass: 'text-yellow-400',
    accentBorderClass: 'border-yellow-500/40',
    focusQuestion: '¿Es viable en coste, plazo y riesgo?',
    specialty: 'Presupuesto, Gantt, matriz de riesgos, Gates G13/G23/G43/G53 y operación O11*–O14*',
    description:
      'Coordina partidas presupuestarias y reservas UFE, cronograma crítico, mitigación de riesgos, votaciones Gate y gestión de emergencias.',
  },
  {
    id: 'science',
    pdfRoleLabel: 'Científico (Environmental & Life Support Officer)',
    name: 'Científico',
    shortName: 'Científico',
    roomId: 'science',
    roomName: 'Laboratorio Científico y Carga Útil',
    colorHex: '#22C55E',
    colorNumber: 0x22c55e,
    accentBgClass: 'bg-emerald-500',
    accentTextClass: 'text-emerald-400',
    accentBorderClass: 'border-emerald-500/40',
    focusQuestion: '¿Qué descubrimos y con qué calidad?',
    specialty: 'Objetivos, instrumentos, datos, cobertura, calibración y hallazgos (C* / A11–A13)',
    description:
      'Formula hipótesis y experimentos, selecciona instrumentos, calibra señal/SNR en tierra y dirige observaciones y descubrimientos orbitales.',
  },
  {
    id: 'pilot',
    pdfRoleLabel: 'Ingeniero (Orbital Dynamics Specialist)',
    name: 'Ingeniero',
    shortName: 'Ingeniero',
    roomId: 'pilot',
    roomName: 'Centro de Ingeniería, Energía y Enlace',
    colorHex: '#3B82F6',
    colorNumber: 0x3b82f6,
    accentBgClass: 'bg-blue-500',
    accentTextClass: 'text-blue-400',
    accentBorderClass: 'border-blue-500/40',
    focusQuestion: '¿Cómo alimentamos, volamos y enlazamos?',
    specialty: 'Potencia, baterías, arquitectura SpaceWire, Δv, comms y software (I* / B11–B12)',
    description:
      'Diseña redes solares/baterías, enlaces S/Ka DSN, almacenamiento SSR, cálculo orbital Δv, depuración eléctrica/SW y operación en órbita.',
  },
];

export const ROLE_MAP: Record<RoleId, RoleDefinition> = {
  systems: ROLES[0],
  finance: ROLES[1],
  science: ROLES[2],
  pilot: ROLES[3],
};

function makeRoleRoomObstacles(cx: number, cz: number) {
  return [
    { x: cx, z: cz - 0.8, radius: 2.1 },
    { x: cx - 4.6, z: cz + 3.3, radius: 1.6 },
    { x: cx + 4.6, z: cz + 3.3, radius: 2.0 },
    { x: cx - 4.8, z: cz - 1.8, radius: 1.7 },
    { x: cx + 4.8, z: cz - 1.8, radius: 1.7 },
    { x: cx, z: cz - 8.8, radius: 1.8 },
  ];
}

export const ROOMS: RoomDefinition[] = [
  {
    id: 'overview',
    name: 'Mapa de Instalaciones — Complejo Espacial',
    shortLabel: 'Mapa 3D',
    type: 'overview',
    accentColorHex: '#38BDF8',
    center: [0, 3.0, -4],
    cameraOffset: [78, 68, 78],
    description:
      'Vista aérea del complejo espacial con 6 instalaciones conectadas para las 6 fases del programa.',
  },
  {
    id: 'hangar',
    name: 'Hangar del Cohete (VAB)',
    shortLabel: 'Hangar Cohete',
    type: 'common',
    accentColorHex: '#38BDF8',
    center: [0, 4.5, 0],
    cameraOffset: [30, 24, 30],
    firstPerson: {
      spawn: [0, GROUND_FLOOR_Y + EYE_HEIGHT, 14.5],
      initialYaw: 0,
      initialPitch: 0.22,
      walkRadius: 18.8,
      obstacles: [
        { x: 0, z: 0, radius: 6.4 },
        { x: -4.6, z: -3.2, radius: 2.0 },
        { x: -5.2, z: -3.6, radius: 1.6 },
        { x: 5.2, z: -3.6, radius: 1.6 },
        { x: 8.4, z: 5.2, radius: 1.8 },
        { x: -8.6, z: 5.4, radius: 1.8 },
      ],
      mezzanine: {
        elevation: 3.0,
        zMin: -17.0,
        zMax: -8.5,
        xHalfWidth: 14.2,
        rampWidth: 3.2,
        rampZStart: 2.5,
        rampZEnd: 10.0,
        sideCatwalkWidth: 3.2,
      },
    },
    description:
      'Hangar de ensamblaje vertical con inspección de etapas, cronograma maestro de 6 fases, consola de lanzamiento y plataforma de carga.',
  },
  {
    id: 'meeting',
    name: 'Sala de Reuniones y Gates Cooperativos',
    shortLabel: 'Sala Gates',
    type: 'common',
    accentColorHex: '#06B6D4',
    center: [0, 2.2, -46],
    cameraOffset: [24, 20, 24],
    firstPerson: {
      spawn: [0, GROUND_FLOOR_Y + EYE_HEIGHT, -46 + 9.2],
      initialYaw: 0,
      initialPitch: -0.04,
      walkRadius: 12.2,
      obstacles: [{ x: 0, z: -46 + 1.2, radius: 4.1 }],
      mezzanine: {
        elevation: 2.6,
        zMin: -11.4,
        zMax: -4.8,
        xHalfWidth: 10.6,
        rampWidth: 3.0,
        rampZEnd: 3.2,
      },
    },
    description:
      'Sala holográfica para votaciones cooperativas (G13, G23, G43, G53), gestión de emergencias O13* y auditoría cruzada.',
  },
  {
    id: 'systems',
    name: 'Taller Mecánico y Estructura',
    shortLabel: 'Taller Mecánico',
    type: 'private',
    ownerRole: 'systems',
    accentColorHex: '#F97316',
    center: [-44, 2.2, -28],
    cameraOffset: [23, 19, 23],
    firstPerson: {
      spawn: [-44, GROUND_FLOOR_Y + EYE_HEIGHT, -28 + 8.6],
      initialYaw: 0,
      initialPitch: -0.05,
      walkRadius: 11.7,
      obstacles: makeRoleRoomObstacles(-44, -28),
      mezzanine: {
        elevation: 2.6,
        zMin: -11.0,
        zMax: -4.6,
        xHalfWidth: 10.2,
        rampWidth: 3.0,
        rampZEnd: 3.2,
      },
    },
    description:
      'Estación de Mecánico · Operaciones: balanzas de masa M11/M41, encaje en cofia M12/M32, vibración M33*/M52 y reparaciones O15*–O17*.',
  },
  {
    id: 'finance',
    name: 'Centro de Gestión y Presupuesto',
    shortLabel: 'Gestión Proyecto',
    type: 'private',
    ownerRole: 'finance',
    accentColorHex: '#EAB308',
    center: [-44, 2.2, 28],
    cameraOffset: [23, 19, 23],
    firstPerson: {
      spawn: [-44, GROUND_FLOOR_Y + EYE_HEIGHT, 28 + 8.6],
      initialYaw: 0,
      initialPitch: -0.05,
      walkRadius: 11.7,
      obstacles: makeRoleRoomObstacles(-44, 28),
      mezzanine: {
        elevation: 2.6,
        zMin: -11.0,
        zMax: -4.6,
        xHalfWidth: 10.2,
        rampWidth: 3.0,
        rampZEnd: 3.2,
      },
    },
    description:
      'Oficina del Gestor de Proyecto: reparto presupuestario G11/G31/G41, Gantt G12/G32/G42, matriz de riesgos G21/G33 y operaciones O11*–O14*.',
  },
  {
    id: 'science',
    name: 'Laboratorio Científico y Carga Útil',
    shortLabel: 'Lab Científico',
    type: 'private',
    ownerRole: 'science',
    accentColorHex: '#22C55E',
    center: [44, 2.2, -28],
    cameraOffset: [23, 19, 23],
    firstPerson: {
      spawn: [44, GROUND_FLOOR_Y + EYE_HEIGHT, -28 + 8.6],
      initialYaw: 0,
      initialPitch: -0.05,
      walkRadius: 11.7,
      obstacles: makeRoleRoomObstacles(44, -28),
      mezzanine: {
        elevation: 2.6,
        zMin: -11.0,
        zMax: -4.6,
        xHalfWidth: 10.2,
        rampWidth: 3.0,
        rampZEnd: 3.2,
      },
    },
    description:
      'Sala blanca del Científico: hipótesis C11, instrumentos C12/C41, cobertura C23, calibración C51–C53 y resultados orbitales A11–A13.',
  },
  {
    id: 'pilot',
    name: 'Centro de Ingeniería, Energía y Enlace',
    shortLabel: 'Ingeniería',
    type: 'private',
    ownerRole: 'pilot',
    accentColorHex: '#3B82F6',
    center: [44, 2.2, 28],
    cameraOffset: [23, 19, 23],
    firstPerson: {
      spawn: [44, GROUND_FLOOR_Y + EYE_HEIGHT, 28 + 8.6],
      initialYaw: 0,
      initialPitch: -0.05,
      walkRadius: 11.7,
      obstacles: makeRoleRoomObstacles(44, 28),
      mezzanine: {
        elevation: 2.6,
        zMin: -11.0,
        zMax: -4.6,
        xHalfWidth: 10.2,
        rampWidth: 3.0,
        rampZEnd: 3.2,
      },
    },
    description:
      'Puesto del Ingeniero: redes eléctricas I11/I21/I41, enlace DSN I12/I22/I43, memoria I13, Δv I42, pruebas I51–I53 y operación B11–B12.',
  },
];

export const ROOM_MAP: Record<RoomId, RoomDefinition> = ROOMS.reduce(
  (acc, room) => {
    acc[room.id] = room;
    return acc;
  },
  {} as Record<RoomId, RoomDefinition>,
);

export const ROCKET_MODULES: RocketModule[] = [
  {
    id: 'sys-solid-boosters',
    roleId: 'systems',
    name: 'Propulsores Sólidos S-1',
    category: 'Propulsión Sólida',
    description: 'Desbloqueado al confirmar cálculo orbital y propulsivo I42.',
    costM: 14,
    massKg: 950,
    powerW: -10,
    sciencePts: 5,
    riskPct: 4,
  },
  {
    id: 'sys-cryo-engine',
    roleId: 'systems',
    name: 'Clúster Criogénico Avanzado',
    category: 'Propulsión Líquida',
    description: 'Desbloqueado al validar combustible y Δv en I42.',
    costM: 26,
    massKg: 1300,
    powerW: -20,
    sciencePts: 10,
    riskPct: 11,
  },
  {
    id: 'sys-rcs-structure',
    roleId: 'systems',
    name: 'Anillo Estructural & RCS',
    category: 'Estructura',
    description: 'Desbloqueado al confirmar estructura preliminar M13.',
    costM: 12,
    massKg: 320,
    powerW: -15,
    sciencePts: 5,
    riskPct: -6,
  },
  {
    id: 'fin-solar-standard',
    roleId: 'finance',
    name: 'Alas Solares Conceptuales',
    category: 'Potencia',
    description: 'Desbloqueado al confirmar diseño energético I21.',
    costM: 10,
    massKg: 260,
    powerW: 95,
    sciencePts: 0,
    riskPct: 2,
  },
  {
    id: 'fin-solar-heavy',
    roleId: 'finance',
    name: 'Matriz Solar Cuádruple Final',
    category: 'Potencia Alta',
    description: 'Desbloqueado al confirmar energía total I41 y paneles M43.',
    costM: 20,
    massKg: 520,
    powerW: 215,
    sciencePts: 5,
    riskPct: 4,
  },
  {
    id: 'fin-thermal-shield',
    roleId: 'finance',
    name: 'Escudo Térmico Certificado',
    category: 'Protección',
    description: 'Desbloqueado al aprobar cambios de línea base en Gate G43.',
    costM: 14,
    massKg: 340,
    powerW: 25,
    sciencePts: 5,
    riskPct: -8,
  },
  {
    id: 'sci-spectrometer',
    roleId: 'science',
    name: 'Espectrómetro de Masas IR',
    category: 'Instrumento',
    description: 'Desbloqueado al confirmar instrumentos iniciales C12.',
    costM: 15,
    massKg: 400,
    powerW: -35,
    sciencePts: 35,
    riskPct: 3,
  },
  {
    id: 'sci-hd-camera',
    roleId: 'science',
    name: 'Telescopio Orbital HD-200',
    category: 'Óptica',
    description: 'Desbloqueado al confirmar instrumentos definitivos C41.',
    costM: 18,
    massKg: 360,
    powerW: -40,
    sciencePts: 40,
    riskPct: 4,
  },
  {
    id: 'sci-microgravity-lab',
    roleId: 'science',
    name: 'Laboratorio Microgravedad',
    category: 'Biología',
    description: 'Desbloqueado al confirmar equipamiento final C41.',
    costM: 22,
    massKg: 650,
    powerW: -55,
    sciencePts: 50,
    riskPct: 6,
  },
  {
    id: 'plt-sband-link',
    roleId: 'pilot',
    name: 'Mástil Telemetría Banda S',
    category: 'Comunicaciones',
    description: 'Desbloqueado al confirmar diseño de comunicaciones I22.',
    costM: 9,
    massKg: 190,
    powerW: -20,
    sciencePts: 10,
    riskPct: -4,
  },
  {
    id: 'plt-kaband-dish',
    roleId: 'pilot',
    name: 'Antena Parabólica Ka-Band',
    category: 'Enlace Profundo',
    description: 'Desbloqueado al confirmar comunicaciones finales I43.',
    costM: 20,
    massKg: 390,
    powerW: -45,
    sciencePts: 25,
    riskPct: 3,
  },
  {
    id: 'plt-abort-guidance',
    roleId: 'pilot',
    name: 'Guía Autónoma y Torre de Escape',
    category: 'Seguridad',
    description: 'Desbloqueado al confirmar masa y arquitectura final M41.',
    costM: 16,
    massKg: 230,
    powerW: -30,
    sciencePts: 15,
    riskPct: -9,
  },
];

export const MODULE_MAP: Record<string, RocketModule> = ROCKET_MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, RocketModule>,
);

export function canAccessRoom(roomId: RoomId, roleId: RoleId): boolean {
  if (roomId === 'overview' || roomId === 'hangar' || roomId === 'meeting') {
    return true;
  }
  const room = ROOM_MAP[roomId];
  return room.ownerRole === roleId;
}

export const LAUNCH_CINEMATIC_DURATIONS: Record<LaunchFailureMode, number> = {
  phase1_pad_fire: 8.5,
  phase2_pad_crash: 9.0,
  phase3_maxq_buckle: 9.5,
  phase4_blackout: 9.5,
  phase5_payload_loss: 10.0,
  phase6_reentry_burn: 10.5,
  phase7_nav_miss: 10.5,
  phase8_early_meco: 10.0,
  phase9_rough_descent: 11.0,
  phase10_success: 18.0,
};

export const INITIAL_DEPT_MESSAGES: DepartmentMessage[] = [
  {
    id: 'msg-init-1',
    fromRole: 'science',
    toRole: 'pilot',
    senderName: 'Científico',
    text: 'Objetivos C11 e instrumentos C12 listos para dimensionar vatios en I11 y datos en C13/I13.',
    timestamp: '00:01:00',
  },
  {
    id: 'msg-init-2',
    fromRole: 'systems',
    toRole: 'finance',
    senderName: 'Mecánico · Ops',
    text: 'Revisando masa preliminar M11 y empaquetado de cofia M12 antes del Gate cooperativo G13.',
    timestamp: '00:01:30',
  },
  {
    id: 'msg-init-3',
    fromRole: 'finance',
    toRole: 'all',
    senderName: 'Gestor de proyecto',
    text: 'Completen sus 3 minijuegos de Fase 1. Al terminar los 12 de cada fase validaremos en la Sala de Reuniones (Gates G13/G23/G43/G53).',
    timestamp: '00:02:00',
  },
];

export const INTERACTABLES_MAP: Record<InteractableId, InteractableContent> = {
  // === TALLER MECÁNICO Y ESTRUCTURA (systems) ===
  'sys-computer': {
    id: 'sys-computer',
    roomId: 'systems',
    kind: 'computer',
    hoverLabel: 'Estación CAD Mecánico · Masa, Volumen y Reparación',
    title: 'Estación CAD Estructural y Telemetría Mecánica',
    subtitle: 'Mecánico · Operaciones · Minijuegos M* y O15*–O17*',
    summary: 'Accede a todos los minijuegos de estructura, centro de masas, despliegue solar y diagnóstico de fallos.',
    dataPoints: [
      { label: 'Dominios', value: 'Masa (kg), Volumen (m³), CoG (mm)' },
      { label: 'Desafíos Críticos', value: 'M33*, O15*, O16*, O17*' },
    ],
  },
  'sys-drawer': {
    id: 'sys-drawer',
    roomId: 'systems',
    kind: 'drawer',
    hoverLabel: 'Cajón Técnico · Manual de Mecánico y Estructura',
    title: 'Dossier de Campo · Mecánico y Operaciones',
    subtitle: 'Guía de Fases 1–6 y Reglas Estructurales',
    summary: 'Consulta tolerancias de cofia, límites de centro de gravedad y minijuegos asignados a este puesto.',
    dataPoints: [
      { label: 'Factor Seguridad', value: '>= 1.35x (Objetivo 1.40x)' },
      { label: 'Desviación CoG', value: '<= 18 mm laterales' },
    ],
  },
  'sys-whiteboard': {
    id: 'sys-whiteboard',
    roomId: 'systems',
    kind: 'whiteboard',
    hoverLabel: 'Pizarra de Cargas Max-Q, Vibración y Estructura',
    title: 'Pizarra de Dinámica Estructural y Notas',
    subtitle: 'Taller Mecánico · Criterios M13, M23, M33*, M43, M52, O17*',
    summary: 'Fórmulas estructurales y acceso directo a los minijuegos de diseño, vibración y paneles solares.',
    dataPoints: [
      { label: 'Presión Max-Q', value: '32.4 kPa @ T+68s' },
      { label: 'Amortiguamiento M33*', value: '>= 60% Requerido' },
    ],
    formulas: [
      'Factor Seguridad = Carga Rotura / Carga Límite >= 1.40',
      'CoG_x = Σ(m_i · x_i) / Σ(m_i) <= ±18 mm',
      'Potencia Solar ∝ Área (m²) · cos(θ)',
    ],
  },
  'sys-comms': {
    id: 'sys-comms',
    roomId: 'systems',
    kind: 'comms',
    hoverLabel: 'Radio Interdepartamental · Taller Mecánico',
    title: 'Canal de Coordinación Mecánica',
    subtitle: 'Comunicación con Ciencia, Ingeniería y Gestión',
    summary: 'Coordina límites de masa con Ciencia e Ingeniería y cambios estructurales antes de cada Gate.',
    dataPoints: [
      { label: 'Enlace Hangar', value: 'ACTIVO' },
      { label: 'Canal Gates', value: 'G13 / G23 / G43 / G53' },
    ],
  },
  'sys-bench': {
    id: 'sys-bench',
    roomId: 'systems',
    kind: 'bench',
    hoverLabel: 'Banco de Balanza, Montaje y Ensayo M11/M21/M31/M41/M51',
    title: 'Banco de Integración Mecánica y Balanza',
    subtitle: 'Montaje físico, balanza de masa y mantenimiento O15*',
    summary: 'Ejecuta aquí tus minijuegos de balanza de masa, constructor modular 3D y montaje secuencial.',
    dataPoints: [
      { label: 'Minijuegos de Banco', value: 'M11, M21, M31, M41, M51, O15*' },
      { label: 'Integridad Cofia', value: 'Verificación 6×4 m' },
    ],
  },
  'sys-manuals': {
    id: 'sys-manuals',
    roomId: 'systems',
    kind: 'manuals',
    hoverLabel: 'Estantería Normas NASA-STD-5001 y Glosario',
    title: 'Biblioteca de Normativa Estructural',
    subtitle: 'Estándares de Vibración, Acoplamiento y Reparación',
    summary: 'Consulta los criterios causales de Anexo B/C y reglas de aceptación mecánicas.',
    dataPoints: [{ label: 'Norma', value: 'NASA-STD-5001B' }],
    manualSections: [
      { code: 'MEC-01', heading: 'Encaje Volumétrico y Holgura', body: 'Ningún módulo puede invadir la zona de deformación dinámica de la cofia (>85% ocupación).' },
      { code: 'MEC-02', heading: 'Validación Vibratoria M33* y M52', body: 'Todos los nodos críticos (interetapa, óptica, faldón) deben sondear y amortiguar resonancias.' },
    ],
  },

  // === CENTRO DE GESTIÓN Y PRESUPUESTO (finance) ===
  'fin-computer': {
    id: 'fin-computer',
    roomId: 'finance',
    kind: 'computer',
    hoverLabel: 'Terminal de Gestión · Presupuesto, Riesgos y Operaciones',
    title: 'Consola de Programa, Finanzas y Riesgos',
    subtitle: 'Gestor de proyecto · Minijuegos G* y O11*–O14*',
    summary: 'Gestiona presupuestos G11/G31/G41, comparador G22, supervisión de pruebas G51 y anomalías O11*/O14*.',
    dataPoints: [
      { label: 'Reserva UFE Mínima', value: '>= 12–15% Presupuesto' },
      { label: 'Gates Cooperativos', value: 'G13, G23, G43, G53' },
    ],
  },
  'fin-drawer': {
    id: 'fin-drawer',
    roomId: 'finance',
    kind: 'drawer',
    hoverLabel: 'Cajón de Gestión · Guía de Programa y Costes',
    title: 'Dossier Ejecutivo del Gestor de Proyecto',
    subtitle: 'Reglas de Viabilidad, Holguras y Votación',
    summary: 'Consulta tus responsabilidades en las 6 fases y el checklist de aprobación de Gates.',
    dataPoints: [
      { label: 'Minijuegos por Fase', value: '3 propios + Gate cooperativo' },
      { label: 'Criterio Clave', value: 'Sin bloques críticos abiertos' },
    ],
  },
  'fin-whiteboard': {
    id: 'fin-whiteboard',
    roomId: 'finance',
    kind: 'whiteboard',
    hoverLabel: 'Pizarra de Riesgos G21/G33 e Incidencias G52',
    title: 'Pizarra de Matriz de Riesgos y Prioridades',
    subtitle: 'Gestión · G21, G33, G52, O12*',
    summary: 'Revisa y lanza directamente los minijuegos de mitigación de riesgos, incidencias NCR y priorización.',
    dataPoints: [
      { label: 'Matriz', value: '5×5 Probabilidad × Impacto' },
      { label: 'Meta', value: 'Riesgo <= Tope de Dificultad' },
    ],
    formulas: [
      'Presupuesto Libre = Techo - (Asignado + Reserva UFE)',
      'Holgura Crítica = Plazo Máximo - Fin Ruta Crítica >= 10 d',
    ],
  },
  'fin-comms': {
    id: 'fin-comms',
    roomId: 'finance',
    kind: 'comms',
    hoverLabel: 'Terminal Radio del Gestor de Proyecto',
    title: 'Despacho de Comunicaciones de Programa',
    subtitle: 'Convocatoria de Revisiones y Solicitudes de Cambio',
    summary: 'Comunica prioridades de presupuesto, convoca votaciones Gate y coordina respuestas a anomalías.',
    dataPoints: [{ label: 'Red', value: '4 Divisiones Conectadas' }],
  },
  'fin-bench': {
    id: 'fin-bench',
    roomId: 'finance',
    kind: 'bench',
    hoverLabel: 'Mesa de Auditoría y Trazabilidad de Evidencias',
    title: 'Mesa de Auditoría y Control de Calidad',
    subtitle: 'Supervisión de Pruebas y Cierre Documental',
    summary: 'Revisa trazabilidad entre decisiones confirmadas, dependencias invalidadas y evidencias de ensayo.',
    dataPoints: [{ label: 'Estándar', value: 'NPR 7120.5F' }],
  },
  'fin-manuals': {
    id: 'fin-manuals',
    roomId: 'finance',
    kind: 'manuals',
    hoverLabel: 'Estantería de Gobernanza y Reglas Gate',
    title: 'Manual de Gobernanza y Control de Programa',
    subtitle: 'Protocolos de Votación G13/G23/G43/G53',
    summary: 'Normativa para resolución cooperativa, gestión de cambios ECR y evaluación final O14*.',
    dataPoints: [{ label: 'Quórum Gate', value: '4 votos registrados (>=3 GO)' }],
    manualSections: [
      { code: 'GES-01', heading: 'Reserva UFE Obligatoria', body: 'Mantener al menos 12–15% sin asignar absorbe cambios de Fase 4 y reparaciones.' },
      { code: 'GES-02', heading: 'Cierre de Incidencias NCR', body: 'No se puede firmar GO en G53 si existen incidencias críticas abiertas en G52.' },
    ],
  },

  // === LABORATORIO CIENTÍFICO (science) ===
  'sci-computer': {
    id: 'sci-computer',
    roomId: 'science',
    kind: 'computer',
    hoverLabel: 'Estación Científica · Datos, Señal y Operaciones A11',
    title: 'Consola de Ciencia, Cobertura y Espectrometría',
    subtitle: 'Científico · Minijuegos C* y A11–A13',
    summary: 'Controla cuotas de datos C13, cobertura orbital C23, precisión C31, calidad C52 y observaciones A11.',
    dataPoints: [
      { label: 'Dominios', value: 'Ciencia (pts), Datos (GB), SNR (%)' },
      { label: 'Operaciones', value: 'A11, A12, A13 en Fase 6' },
    ],
  },
  'sci-drawer': {
    id: 'sci-drawer',
    roomId: 'science',
    kind: 'drawer',
    hoverLabel: 'Cajón de Laboratorio · Hipótesis y Protocolos C*',
    title: 'Cuaderno Científico de Campaña',
    subtitle: 'Científico · Selección C11/C21/C42 y Validación C53/A13',
    summary: 'Revisa tus objetivos por fase y abre los minijuegos de cartas de hipótesis, ranking e informes finales.',
    dataPoints: [
      { label: 'Meta Científica', value: 'Según dificultad (65–105 pts)' },
      { label: 'Cobertura Mínima', value: '>= 70% zonas objetivo' },
    ],
  },
  'sci-whiteboard': {
    id: 'sci-whiteboard',
    roomId: 'science',
    kind: 'whiteboard',
    hoverLabel: 'Pizarra de Objetivos Científicos y Bandas Espectrales',
    title: 'Pizarra de Retorno Científico y Ventanas',
    subtitle: 'Laboratorio · Ecuaciones de Cobertura y Datos',
    summary: 'Coordina con el equipo la demanda eléctrica y de bajada de tus instrumentos.',
    dataPoints: [{ label: 'Banda Espectral', value: '280 – 2,400 nm UV/IR' }],
    formulas: [
      'Datos Netos (GB/d) = Datos Brutos · (1 - Compresión%)',
      'Calidad Señal >= 85% (Offset, Ganancia, Filtro)',
    ],
  },
  'sci-comms': {
    id: 'sci-comms',
    roomId: 'science',
    kind: 'comms',
    hoverLabel: 'Consola de Enlace Científico',
    title: 'Canal de Coordinación Científica',
    subtitle: 'Enlace con Ingeniería y Mecánico',
    summary: 'Comunica requerimientos de masa, potencia y ventanas DSN para tus experimentos.',
    dataPoints: [{ label: 'Prioridad', value: 'Carga Útil & Datos' }],
  },
  'sci-bench': {
    id: 'sci-bench',
    roomId: 'science',
    kind: 'bench',
    hoverLabel: 'Banco Óptico y Calibración C12/C22/C32/C41/C51/A12',
    title: 'Banco Óptico y Calibración de Sensores',
    subtitle: 'Integración de Instrumentos y Análisis Espectral',
    summary: 'Ejecuta aquí la selección de instrumentos C12/C41, calibración C51 y análisis de gráficas A12.',
    dataPoints: [{ label: 'Sala Blanca', value: 'ISO Clase 5' }],
  },
  'sci-manuals': {
    id: 'sci-manuals',
    roomId: 'science',
    kind: 'manuals',
    hoverLabel: 'Estantería de Protocolos Científicos',
    title: 'Archivo de Metodología y Calibración',
    subtitle: 'Criterios Científicos y Cobertura',
    summary: 'Consulta fórmulas de compresión, relación SNR y reglas de validación experimental C53.',
    dataPoints: [{ label: 'Protocolo', value: 'CCSDS / COSPAR' }],
    manualSections: [
      { code: 'CIE-01', heading: 'Trazabilidad Hipótesis -> Instrumento -> Informe', body: 'Cada descubrimiento A13 debe respaldarse en mediciones de A12 e instrumentos C41.' },
      { code: 'CIE-02', heading: 'Equilibrio Ciencia vs Enlace', body: 'Más resolución aumenta GB/día; verifica con el Ingeniero que el enlace I32/I43 lo soporte.' },
    ],
  },

  // === CENTRO DE INGENIERÍA, ENERGÍA Y ENLACE (pilot) ===
  'plt-computer': {
    id: 'plt-computer',
    roomId: 'pilot',
    kind: 'computer',
    hoverLabel: 'Estación de Ingeniería · Energía, Bus y Software',
    title: 'Consola de Energía, Bus Electrónico y Operaciones B11',
    subtitle: 'Ingeniero · Minijuegos I* y B11–B12',
    summary: 'Diseña redes eléctricas I11/I31/I41, bus SpaceWire I23, depuración SW I53 y operación orbital B11.',
    dataPoints: [
      { label: 'Dominios', value: 'Vatios (W), Wh, Mbps, Δv (m/s)' },
      { label: 'Operaciones', value: 'B11 Energía · B12 Comms' },
    ],
  },
  'plt-drawer': {
    id: 'plt-drawer',
    roomId: 'pilot',
    kind: 'drawer',
    hoverLabel: 'Cajón de Ingeniería · Autonomía y Trayectoria',
    title: 'Cuaderno de Ingeniería de Sistemas y Vuelo',
    subtitle: 'Ingeniero · Autonomía I33 y Manual de Fases 1–6',
    summary: 'Revisa los cálculos de eclipse I33, requisitos de vuelo y tus 3 minijuegos por fase.',
    dataPoints: [
      { label: 'Autonomía Eclipse', value: '>= 6.0 horas (I33)' },
      { label: 'Margen Eléctrico', value: '>= +40 W nominal' },
    ],
  },
  'plt-whiteboard': {
    id: 'plt-whiteboard',
    roomId: 'pilot',
    kind: 'whiteboard',
    hoverLabel: 'Pizarra de Trayectoria Δv y Balance Eléctrico',
    title: 'Pizarra de Dinámica Orbital y Potencia',
    subtitle: 'Ingeniería · Ecuación de Tsiolkovsky y Enlaces',
    summary: 'Consulta Δv mínimo por destino y reglas de redundancia eléctrica/RF.',
    dataPoints: [
      { label: 'LEO / Luna / Marte', value: '3,200 / 4,500 / 5,400 m/s' },
    ],
    formulas: [
      'Δv = Isp · 9.81 · ln((m_seca + m_prop) / m_seca)',
      'Autonomía (h) = Batería (Wh) / Carga Crítica (W)',
      'Caudal Diario (GB) = Σ(Mbps · ventana_s / 8000)',
    ],
  },
  'plt-comms': {
    id: 'plt-comms',
    roomId: 'pilot',
    kind: 'comms',
    hoverLabel: 'Estación Red Terrena DSN y Enlace I12/I22/I32/I43/I51/B12',
    title: 'Centro de Comunicaciones y Enlace Terreno',
    subtitle: 'Antenas S/Ka, Ventanas DSN y Pruebas de Paquetes',
    summary: 'Lanza los minijuegos de dimensionamiento de antenas, estaciones DSN, ancho de banda y B12.',
    dataPoints: [{ label: 'Red Terrena', value: 'Madrid · Goldstone · Canberra' }],
  },
  'plt-bench': {
    id: 'plt-bench',
    roomId: 'pilot',
    kind: 'bench',
    hoverLabel: 'Banco de Potencia, Memoria, Propelente y Diagnóstico',
    title: 'Banco de Simulación Eléctrica y Propulsiva',
    subtitle: 'Memoria I13, Energía I21, Combustible I42, Verificación I52',
    summary: 'Ejecuta aquí almacenamiento SSR, perfil eclipse, calculadora Δv Tsiolkovsky y test I52.',
    dataPoints: [{ label: 'Isp Referencia', value: '445 s Criogénico' }],
  },
  'plt-manuals': {
    id: 'plt-manuals',
    roomId: 'pilot',
    kind: 'manuals',
    hoverLabel: 'Estantería de Ingeniería y Reglas de Enlace',
    title: 'Manual de Ingeniería de Vuelo y Potencia',
    subtitle: 'Criterios de Autonomía, Δv y FDIR',
    summary: 'Referencia técnica sobre dimensionamiento de baterías, antenas S/Ka y recuperación de fallos.',
    dataPoints: [{ label: 'Código', value: 'ENG-CCSDS-2026' }],
    manualSections: [
      { code: 'ING-01', heading: 'Regla de Redundancia RF', body: 'Toda misión debe combinar enlace científico Ka-Band con respaldo omnidireccional Banda S.' },
      { code: 'ING-02', heading: 'Margen de Propelente I42', body: 'Incluye mínimo 6% extra sobre el Δv nominal del destino elegido.' },
    ],
  },

  // === ROCKET HANGAR (11) ===
  'hng-nozzles': {
    id: 'hng-nozzles',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Toberas Principales y Faldón (I42 / M21)',
    title: 'Sección de Propulsión Principal y Toberas',
    subtitle: 'Hangar del Cohete · Etapa 1',
    summary: 'Inspección 3D de toberas regenerativas conectadas al cálculo de combustible I42 y montaje M51.',
    dataPoints: [
      { label: 'Empuje Base', value: '7.6 MN' },
      { label: 'Minijuegos Relacionados', value: 'I42 · M33* · M51' },
    ],
  },
  'hng-fuel-tank': {
    id: 'hng-fuel-tank',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Tanque Central Criogénico y Paneles (M11 / M43 / I21)',
    title: 'Tanque Central Al-Li 2195 y Anclaje Solar',
    subtitle: 'Hangar del Cohete · Fuselaje Core',
    summary: 'Cuerpo estructural donde se montan las alas solares diseñadas en I21/I41/M43.',
    dataPoints: [
      { label: 'Material', value: 'Al-Li 2195 Orthogrid' },
      { label: 'Minijuegos Relacionados', value: 'M11 · I21 · M43' },
    ],
  },
  'hng-interstage': {
    id: 'hng-interstage',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Interetapa Compuesta y Anillo RCS (M13 / M33* / M52)',
    title: 'Interetapa de Carbono y Anillo de Separación',
    subtitle: 'Hangar del Cohete · Zona Crítica Max-Q',
    summary: 'Zona sometida a ensayos de vibración M33* y verificación estructural M52.',
    dataPoints: [
      { label: 'Separación', value: 'Neumática No-Pirotécnica' },
      { label: 'Minijuegos Relacionados', value: 'M13 · M33* · M42 · M52' },
    ],
  },
  'hng-oxidizer-tank': {
    id: 'hng-oxidizer-tank',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Bahía de Servicio e Instrumentos (C12 / C41 / M53)',
    title: 'Etapa Superior y Bastidor de Instrumentos',
    subtitle: 'Hangar del Cohete · Etapa 2',
    summary: 'Aloja espectrómetros, bio-laboratorio e instrumentos calibrados en C51–C53 y acoplados en M53.',
    dataPoints: [
      { label: 'Instrumentos', value: 'C12 · C41 · M22 · M53' },
    ],
  },
  'hng-avionics': {
    id: 'hng-avionics',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Anillo de Aviónica y Antena Ka (I23 / I43 / I53)',
    title: 'Anillo de Aviónica SpaceWire y Cardán Ka',
    subtitle: 'Hangar del Cohete · Cerebro de Vuelo',
    summary: 'Integra el bus I23, el enlace Ka I43 y el software verificado I53.',
    dataPoints: [
      { label: 'Arquitectura', value: 'OBC RAD750 + SSR + Ka' },
    ],
  },
  'hng-fairing': {
    id: 'hng-fairing',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Cofia Aerodinámica y Envolvente (M12 / M32 / C41)',
    title: 'Cofia Compuesta y Torre de Escape',
    subtitle: 'Hangar del Cohete · Volumen Útil',
    summary: 'Protege el volumen asignado en M12/M32 y el telescopio HD de C41.',
    dataPoints: [
      { label: 'Diámetro Cofia', value: '5.2 m Compuesto' },
    ],
  },
  'hng-umbilical': {
    id: 'hng-umbilical',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Torre Umbilical de Servicio',
    title: 'Torre de Lanzamiento y Brazo Umbilical',
    subtitle: 'Hangar del Cohete · Enlace de Rampa',
    summary: 'Suministra energía de tierra, purga y enlace hasta la retracción en T-0.',
    dataPoints: [
      { label: 'Retracción', value: '0.8 s en Ignición' },
    ],
  },
  'hng-pad-console': {
    id: 'hng-pad-console',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Consola de Lanzamiento Pad 39A (Simular Vuelo)',
    title: 'Consola Terminal de Lanzamiento',
    subtitle: 'Hangar del Cohete · Auditoría Anexo C y Simulación',
    summary: 'Comprueba los 6 pilares de Anexo C y el Gate G53 y ejecuta la simulación de lanzamiento 3D.',
    dataPoints: [
      { label: 'Autorización', value: 'Gate G53 GO/NO-GO' },
    ],
  },
  'hng-cryo-pipes': {
    id: 'hng-cryo-pipes',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Esferas Criogénicas LOX/LH2 (I42)',
    title: 'Esferas Criogénicas y Colector de Llenado',
    subtitle: 'Hangar del Cohete · Propelente',
    summary: 'Abastece el propelente dimensionado en la calculadora orbital I42.',
    dataPoints: [
      { label: 'Flujo', value: '1,420 kg/s Criogénico' },
    ],
  },
  'hng-crane': {
    id: 'hng-crane',
    roomId: 'hangar',
    kind: 'hangar-part',
    hoverLabel: 'Grúa Puente de Integración 120T (M51)',
    title: 'Grúa Puente de Alta Bahía',
    subtitle: 'Hangar del Cohete · Ensamblaje M51/M53',
    summary: 'Posicionamiento de etapas e instrumentos para montaje M51 y acoplamiento M53.',
    dataPoints: [
      { label: 'Capacidad', value: '120 Toneladas Métricas' },
    ],
  },
  'hng-schedule': {
    id: 'hng-schedule',
    roomId: 'hangar',
    kind: 'schedule',
    hoverLabel: 'Cronograma Maestro Gantt · Fases 1–6 (G12 / G32 / G42)',
    title: 'Cronograma Maestro — Programa de 6 Fases y 72 Minijuegos',
    subtitle: 'Hangar · Planificación Integrada y Ruta Crítica',
    summary: 'Visualiza el progreso completo de las 6 fases, los 72 minijuegos, las holguras temporales y lanza cualquier tarea pendiente.',
    dataPoints: [
      { label: 'Horizonte', value: '6 Fases · 72 Minijuegos' },
      { label: 'Gates', value: 'G13 · G23 · G43 · G53' },
    ],
  },

  // === BRIEFING ROOM (1) ===
  'mtg-holo': {
    id: 'mtg-holo',
    roomId: 'meeting',
    kind: 'meeting-holo',
    hoverLabel: 'Mesa Holográfica · Gates G13/G23/G43/G53 y Recálculos',
    title: 'Sala de Reuniones · Gates Cooperativos y Recálculo Cruzado',
    subtitle: 'Briefing Room · Decisiones Multidisciplinares',
    summary: 'Ejecuta las votaciones de Gate (G13, G23, G43, G53), revisa recálculos por cambios de estado y resuelve emergencias O13*.',
    dataPoints: [
      { label: 'Quórum', value: '4 Especialidades' },
      { label: 'Validación', value: 'Anexo C · 6 Pilares' },
    ],
  },
};

export interface RoleManualGuide {
  briefingSubtitle: string;
  globalResponsibility: string;
  whyTeamNeedsYou: string[];
  meetingCoordination: string;
}

export const ROLE_MANUAL_GUIDES: Record<RoleId, RoleManualGuide> = {
  systems: {
    briefingSubtitle: 'Masa, Volumen en Cofia, Estructura y Mantenimiento (M* / O15*–O17*)',
    globalResponsibility:
      'Garantizas que toda la nave quepa físicamente en la cofia, mantenga el Centro de Gravedad equilibrado y supere las cargas vibratorias de despegue y operaciones.',
    whyTeamNeedsYou: [
      'Cada instrumento de Ciencia o batería de Ingeniería suma masa (kg) y volumen (m³) en tus modelos M11–M41.',
      'Los ensayos vibratorios M33* y M52 evitan fallos estructurales en Max-Q.',
      'En Fase 6 operas la salud física, reparaciones con repuestos O16* y fallos estructurales O17*.',
    ],
    meetingCoordination:
      'Participa en todos los Gates (G13, G23, G43, G53) para validar que los cambios del equipo no rompen la envolvente física.',
  },
  finance: {
    briefingSubtitle: 'Presupuesto, Cronograma, Riesgos, Gates y Operaciones (G* / O11*–O14*)',
    globalResponsibility:
      'Orquestas los recursos económicos ($M), el calendario en días, la matriz de riesgos y las revisiones cooperativas para mantener viable todo el programa.',
    whyTeamNeedsYou: [
      'Tu reserva UFE (12–15%) protege al equipo frente a cambios ECR en G43 y mitigaciones G21/G33.',
      'Supervisas el cierre de pruebas G51 e incidencias G52 antes de autorizar el lanzamiento en G53.',
      'En Fase 6 resuelves anomalías O11*, priorizas actividades O12* y lideras emergencias O13* hasta evaluar el éxito O14*.',
    ],
    meetingCoordination:
      'Convoca la Sala de Reuniones al cierre de las Fases 1, 2, 4 y 5 para votar G13, G23, G43 y G53.',
  },
  science: {
    briefingSubtitle: 'Objetivos, Instrumentos, Cobertura, Calibración y Hallazgos (C* / A11–A13)',
    globalResponsibility:
      'Defines la razón científica de la misión: seleccionas hipótesis, dimensionas datos, calibras sensores y publicas los descubrimientos en órbita.',
    whyTeamNeedsYou: [
      'Sin suficiente retorno científico (pts) y cobertura (>=70%), la misión no cumple su propósito.',
      'Tus volúmenes de datos (GB/día) en C13/C32 condicionan directamente la memoria I13 y el enlace I32/I43.',
      'En Fase 5 calibras offset/ganancia/filtro C51–C53 y en Fase 6 capturas y publicas resultados A11–A13.',
    ],
    meetingCoordination:
      'Negocia compromisos entre resolución óptica, potencia requerida (W) y masa instrumental en cada fase.',
  },
  pilot: {
    briefingSubtitle: 'Energía, Comunicaciones, Memoria, Δv y Software (I* / B11–B12)',
    globalResponsibility:
      'Aseguras el suministro eléctrico solar/baterías, el almacenamiento SSR, el enlace Tierra-Nave DSN, el propelente Δv y el software de vuelo.',
    whyTeamNeedsYou: [
      'Un déficit de vatios en I21/I41 o poca autonomía en eclipse I33 provoca apagón en órbita.',
      'Calculas el Δv orbital real (I42) mediante Tsiolkovsky para llegar al destino.',
      'En Fase 5 depuras anomalías eléctricas I52 y de software I53; en Fase 6 gestionas energía B11 y paquetes B12.',
    ],
    meetingCoordination:
      'Alerta cuando los instrumentos científicos o refuerzos mecánicos superen la capacidad solar o de enlace Mbps.',
  },
};

export interface TechnicalGlossaryEntry {
  term: string;
  unitOrRange: string;
  accentHex: string;
  explanation: string;
  whyVitalForMoonReturn: string;
}

export const TECHNICAL_GLOSSARY: TechnicalGlossaryEntry[] = [
  {
    term: 'Masa Total y Centro de Gravedad',
    unitOrRange: 'kg / ±18 mm CoG',
    accentHex: '#F97316',
    explanation: 'Peso seco + propelente calculado por Mecánico · Operaciones en M11/M31/M41.',
    whyVitalForMoonReturn: 'Exceder el límite de masa impide alcanzar el Δv orbital o rompe las uniones en Max-Q.',
  },
  {
    term: 'Balance Eléctrico y Autonomía',
    unitOrRange: 'W netos (>= +25 W) / h eclipse',
    accentHex: '#38BDF8',
    explanation: 'Generación solar menos cargas simultáneas más reserva en baterías Li-Ion (Wh).',
    whyVitalForMoonReturn: 'Garantiza telemetría, control térmico y sensores activos durante cada eclipse orbital.',
  },
  {
    term: 'Datos y Enlace DSN',
    unitOrRange: 'GB vs SSR · Mbps (>= 24–34 Mbps)',
    accentHex: '#22C55E',
    explanation: 'Equilibrio entre captura científica diaria C13/C32, memoria I13 y descarga S/Ka en I32/I43.',
    whyVitalForMoonReturn: 'Si la tasa de captura supera al enlace, los búferes se saturan y se pierden descubrimientos.',
  },
  {
    term: 'Reserva UFE y Holgura Crítica',
    unitOrRange: '$M (UFE >= 12%) · Días (>= 10d)',
    accentHex: '#EAB308',
    explanation: 'Colchón financiero y temporal gestionado por Gestión de Proyecto para absorber cambios.',
    whyVitalForMoonReturn: 'Evita bloqueos presupuestarios en Fase 4 (G43) y retrasos fuera de ventana en Fase 5.',
  },
  {
    term: 'Riesgo Residual y Gates G13–G53',
    unitOrRange: '% riesgo · 4 Gates GO',
    accentHex: '#EF4444',
    explanation: 'Nivel combinado de riesgo tras mitigaciones G21/G33/G52 y pruebas M33*/I52/I53/M52.',
    whyVitalForMoonReturn: 'Solo con los 4 Gates aprobados y riesgo bajo umbral se autoriza un lanzamiento seguro.',
  },
];

export const HANGAR_ASSEMBLY_PAD_POS: [number, number, number] = [0, GROUND_FLOOR_Y, 9.2];
export const HANGAR_ASSEMBLY_PAD_RADIUS = 2.4;

export const CARGO_MODULES: CargoModuleDef[] = [
  {
    id: 'cargo-cryo-cell',
    name: 'Celda Criogénica de Propulsión',
    shortLabel: 'Celda Criogénica',
    variant: 'cryo-cell',
    roleId: 'systems',
    originRoomId: 'systems',
    accentHex: '#F97316',
    accentNumber: 0xf97316,
    weight: 1.35,
    fragility: 1.15,
    riskPenaltyOnBreak: 8,
    scienceBonusOnDeliver: 4,
    spawnLocalPos: [2.6, GROUND_FLOOR_Y, 6.4],
    padSlotOffset: [-1.45, 0.14, -0.45],
    radius: 0.46,
    description: 'Unidad presurizada LH2. Trasládala suavemente al Hangar sin golpear paredes.',
  },
  {
    id: 'cargo-thermal-crate',
    name: 'Panel de Escudo Térmico Cerámico',
    shortLabel: 'Escudo Térmico',
    variant: 'thermal-crate',
    roleId: 'systems',
    originRoomId: 'systems',
    accentHex: '#FB923C',
    accentNumber: 0xfb923c,
    weight: 1.48,
    fragility: 1.25,
    riskPenaltyOnBreak: 7,
    scienceBonusOnDeliver: 3,
    spawnLocalPos: [-2.6, GROUND_FLOOR_Y, 6.4],
    padSlotOffset: [-0.72, 0.14, 0.55],
    radius: 0.48,
    description: 'Losetas ablativas PICA-X. Los golpes reducen su integridad y suben el riesgo.',
  },
  {
    id: 'cargo-budget-case',
    name: 'Maletín Cifrado de Autorización',
    shortLabel: 'Maletín Cifrado',
    variant: 'budget-case',
    roleId: 'finance',
    originRoomId: 'finance',
    accentHex: '#EAB308',
    accentNumber: 0xeab308,
    weight: 1.0,
    fragility: 0.9,
    riskPenaltyOnBreak: 5,
    scienceBonusOnDeliver: 3,
    spawnLocalPos: [2.6, GROUND_FLOOR_Y, 6.4],
    padSlotOffset: [0.0, 0.14, -0.58],
    radius: 0.42,
    description: 'Llaves criptográficas de lanzamiento para la autorización Gate G53 en el Hangar.',
  },
  {
    id: 'cargo-sample-canister',
    name: 'Cápsula Estéril de Instrumentos',
    shortLabel: 'Cápsula Ciencia',
    variant: 'sample-canister',
    roleId: 'science',
    originRoomId: 'science',
    accentHex: '#22C55E',
    accentNumber: 0x22c55e,
    weight: 1.15,
    fragility: 1.35,
    riskPenaltyOnBreak: 6,
    scienceBonusOnDeliver: 8,
    spawnLocalPos: [-2.6, GROUND_FLOOR_Y, 6.4],
    padSlotOffset: [0.75, 0.14, 0.55],
    radius: 0.42,
    description: 'Contenedor óptico calibrado. Entrégalo intacto en el Hangar para bonificar +8 Ciencia.',
  },
  {
    id: 'cargo-avionics-core',
    name: 'Núcleo Inercial de Aviónica',
    shortLabel: 'Núcleo Aviónica',
    variant: 'avionics-core',
    roleId: 'pilot',
    originRoomId: 'pilot',
    accentHex: '#3B82F6',
    accentNumber: 0x3b82f6,
    weight: 1.2,
    fragility: 1.25,
    riskPenaltyOnBreak: 9,
    scienceBonusOnDeliver: 5,
    spawnLocalPos: [2.6, GROUND_FLOOR_Y, 6.4],
    padSlotOffset: [1.45, 0.14, -0.45],
    radius: 0.44,
    description: 'Giroscopios y rastreador estelar. Golpearlo descalibra la guía y sube el riesgo.',
  },
];

export const CARGO_MAP: Record<string, CargoModuleDef> = CARGO_MODULES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, CargoModuleDef>,
);
