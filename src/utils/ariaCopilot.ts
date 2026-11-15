import { MINIGAMES_72, PHASE_6_MAP } from '../data/minigamesData';
import { DIFFICULTY_CONFIGS, ROLE_MANUAL_GUIDES, ROLE_MAP } from '../data/missionData';
import type {
  DifficultyId,
  MinigameInstanceState,
  MissionPhaseNumber,
  RoleId,
  SharedMissionState,
} from '../types/mission';

export interface AriaContext {
  activeRole: RoleId;
  difficulty: DifficultyId;
  currentPhase: MissionPhaseNumber;
  sharedState: SharedMissionState;
  minigameStates: Record<string, MinigameInstanceState>;
}

export interface AriaChatMessage {
  id: string;
  sender: 'aria' | 'user';
  text: string;
  timestamp: string;
}

export const ARIA_QUICK_PROMPTS = [
  '¿Qué minijuego me toca ahora?',
  '¿Cómo supero el Gate y Anexo C?',
  '¿Cuál es la responsabilidad de mi rol?',
] as const;

export function buildAriaGreeting(ctx: AriaContext): string {
  const roleDef = ROLE_MAP[ctx.activeRole];
  const diffCfg = DIFFICULTY_CONFIGS[ctx.difficulty];
  const phaseMeta = PHASE_6_MAP[ctx.currentPhase];
  const myPhaseMinigames = MINIGAMES_72.filter(
    (m) => m.phaseNumber === ctx.currentPhase && m.roleId === ctx.activeRole,
  );
  const pending = myPhaseMinigames.filter(
    (m) => ctx.minigameStates[m.code]?.status !== 'confirmado',
  );
  const dirtyCount = ctx.sharedState.recalcRequiredCodes.length;

  const lines: string[] = [
    `Hola, ${roleDef.name}. Soy A.R.I.A., tu asistente de operaciones.`,
    `Campaña: ${diffCfg.label} (${diffCfg.targetName}) · ${phaseMeta.code}: ${phaseMeta.title}.`,
  ];

  if (dirtyCount > 0) {
    lines.push(
      `Atención: ${dirtyCount} minijuego(s) requieren recálculo (${ctx.sharedState.recalcRequiredCodes.join(', ')}) tras un cambio de estado compartido.`,
    );
  } else if (pending.length > 0) {
    const next = pending[0];
    lines.push(
      `Siguiente paso: te quedan ${pending.length}/3 minijuegos en ${phaseMeta.code}. Abre "${next.code} · ${next.title}" directamente desde este ordenador o desde tu Tablet.`,
    );
  } else {
    lines.push(
      `Has confirmado todos tus minijuegos de ${phaseMeta.code}. Coordina con tus compañeros o abre el Gate ${phaseMeta.gateCode ?? 'siguiente'} en la Sala de Reuniones.`,
    );
  }

  return lines.join('\n\n');
}

export function buildAriaResponse(rawQuery: string, ctx: AriaContext): string {
  const q = rawQuery.trim().toLowerCase();
  const roleDef = ROLE_MAP[ctx.activeRole];
  const roleGuide = ROLE_MANUAL_GUIDES[ctx.activeRole];
  const diffCfg = DIFFICULTY_CONFIGS[ctx.difficulty];
  const phaseMeta = PHASE_6_MAP[ctx.currentPhase];
  const myPhaseMinigames = MINIGAMES_72.filter(
    (m) => m.phaseNumber === ctx.currentPhase && m.roleId === ctx.activeRole,
  );
  const pending = myPhaseMinigames.filter(
    (m) => ctx.minigameStates[m.code]?.status !== 'confirmado',
  );

  if (q.includes('rol') || q.includes('responsabilidad') || q.includes('objetivo') || q.includes('goal')) {
    const bullets = roleGuide.whyTeamNeedsYou.map((line, i) => `${i + 1}. ${line}`).join('\n');
    return [
      `${roleDef.name} — "${roleDef.focusQuestion}"`,
      roleGuide.globalResponsibility,
      `Puntos clave de coordinación:\n${bullets}`,
      roleGuide.meetingCoordination,
    ].join('\n\n');
  }

  if (q.includes('gate') || q.includes('anexo') || q.includes('lanzamiento') || q.includes('ready')) {
    const failed = ctx.sharedState.anexoCChecks.filter((a) => !a.passed);
    const gates = ctx.sharedState.riesgoEstado.gatesApproved;
    const summaryLines =
      failed.length === 0
        ? ['Los 6 pilares transversales de Anexo C están en verde.']
        : failed.map((f) => `• ${f.domain}: ${f.label} (Actual: ${f.detail})`);

    return [
      `Auditoría Anexo C (${diffCfg.targetName}) · Gates aprobados: ${gates.length}/4 (${gates.join(', ') || 'ninguno'})`,
      summaryLines.join('\n'),
      phaseMeta.gateCode
        ? `En ${phaseMeta.code}, recuerda reunir los 4 votos en el Gate ${phaseMeta.gateCode} desde la Sala de Reuniones.`
        : `Sigue confirmando tus minijuegos para completar ${phaseMeta.code}.`,
    ].join('\n\n');
  }

  const phaseAll = MINIGAMES_72.filter((m) => m.phaseNumber === ctx.currentPhase);
  const phaseConfirmed = phaseAll.filter(
    (m) => ctx.minigameStates[m.code]?.status === 'confirmado',
  ).length;

  if (pending.length > 0) {
    const next = pending[0];
    return [
      `Plan inmediato en ${phaseMeta.code} (${phaseConfirmed}/${phaseAll.length} minijuegos confirmados en la fase):`,
      `1. Abre ${next.code} · "${next.title}" (${next.mechanicSummary}).`,
      `2. Usa "Comprobar / Simular" para validar reglas obligatorias antes de confirmar.`,
      `3. Tras confirmar, revisa si algún minijuego dependiente marcó "Requiere recalcular".`,
    ].join('\n\n');
  }

  const dirty = ctx.sharedState.recalcRequiredCodes;
  if (dirty.length > 0) {
    return [
      `Tus minijuegos de ${phaseMeta.code} están confirmados, pero hay recálculos pendientes: ${dirty.join(', ')}.`,
      `Ábrelos desde la Tablet o Mesa Holográfica y vuelve a validar para limpiar el estado compartido.`,
    ].join('\n\n');
  }

  return [
    `Completaste todos tus minijuegos en ${phaseMeta.code} (${phaseConfirmed}/12 del equipo).`,
    `Revisa el progreso de los otros 3 roles en la pestaña "Fases 1–6" de tu Tablet o vota el Gate ${phaseMeta.gateCode ?? 'correspondiente'} en Sala de Reuniones.`,
  ].join('\n\n');
}
