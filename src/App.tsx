import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Flame,
  FlaskConical,
  Lock,
  LogOut,
  Map as MapIcon,
  RotateCcw,
  Rocket,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  InteractableModal,
  type WhiteboardNote,
} from './components/InteractableModal';
import { LobbyScreen } from './components/LobbyScreen';
import { MinigameWorkbenchModal } from './components/MinigameWorkbenchModal';
import { SpaceViewport3D, type LobbyStageMode } from './components/SpaceViewport3D';
import { TabletHud } from './components/TabletHud';
import {
  MINIGAMES_72,
  MINIGAME_MAP,
  PHASE_6_MAP,
  getMinigamesForPhase,
  getMinigamesForRoleAndPhase,
} from './data/minigamesData';
import {
  CARGO_MAP,
  CARGO_MODULES,
  DIFFICULTY_CONFIGS,
  INITIAL_DEPT_MESSAGES,
  INTERACTABLES_MAP,
  ROLES,
  ROLE_MAP,
  ROOM_MAP,
  canAccessRoom,
} from './data/missionData';
import type {
  ActiveConflict,
  CargoModuleState,
  DepartmentMessage,
  DifficultyId,
  InteractableId,
  LaunchOutcome,
  MinigameInstanceState,
  MinigamePayload,
  MinigameValidationResult,
  MissionLogEntry,
  MissionPhaseNumber,
  RoleId,
  RoomId,
} from './types/mission';
import {
  computeSharedMissionState,
  createInitialMinigameStates,
  evaluateLaunchOutcome6,
  getMissionResourcesFromSharedState,
  getUnlocked3DModulesFromMinigames,
} from './utils/minigameEngine';
import { soundFx } from './utils/soundFx';

interface ToastBanner {
  id: number;
  tone: 'info' | 'success' | 'warning' | 'locked';
  text: string;
}

const INITIAL_WHITEBOARD_NOTES: Record<string, WhiteboardNote[]> = {
  'sys-whiteboard': [
    {
      id: 'wb-sys-1',
      text: 'Verificar masa total <= límite Anexo C y mantener CoG dentro de ±18 mm',
      checked: false,
    },
    {
      id: 'wb-sys-2',
      text: 'Superar ensayo modal M33* y ensamblaje 3D M41 antes del Gate G43',
      checked: false,
    },
  ],
  'fin-whiteboard': [
    {
      id: 'wb-fin-1',
      text: 'Preservar reserva de contingencia UFE >= 12% en G11 y G41',
      checked: false,
    },
    {
      id: 'wb-fin-2',
      text: 'Coordinar votaciones de los 4 roles en Gates G13, G23, G43 y G53',
      checked: false,
    },
  ],
  'sci-whiteboard': [
    {
      id: 'wb-sci-1',
      text: 'Alcanzar retorno científico objetivo manteniendo demanda eléctrica bajo margen',
      checked: false,
    },
    {
      id: 'wb-sci-2',
      text: 'Validar cobertura orbital C23/A11 >= 70% y calibración espectral C31/C52',
      checked: false,
    },
  ],
  'plt-whiteboard': [
    {
      id: 'wb-plt-1',
      text: 'Asegurar margen eléctrico neto >= +25 W y >= 4h de autonomía en eclipse',
      checked: false,
    },
    {
      id: 'wb-plt-2',
      text: 'Verificar Δv en I42 y red de comunicaciones Ka/S DSN en I43/I51',
      checked: false,
    },
  ],
};

function formatNow(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function createInitialCargoStates(): Record<string, CargoModuleState> {
  const map: Record<string, CargoModuleState> = {};
  for (const def of CARGO_MODULES) {
    map[def.id] = {
      id: def.id,
      integrity: 100,
      delivered: false,
      riskPenaltyPct: 0,
    };
  }
  return map;
}

export default function App() {
  const [cinematicDemoMode, setCinematicDemoMode] = useState(true);
  const [inLobby, setInLobby] = useState(true);
  const [lobbyStageMode, setLobbyStageMode] = useState<LobbyStageMode>('menu');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [briefingActive, setBriefingActive] = useState(false);
  const [playerName, setPlayerName] = useState('Commander Vega');
  const [activeRole, setActiveRole] = useState<RoleId>('systems');
  const [difficulty, setDifficulty] = useState<DifficultyId>('medium');
  const [soloTestMode, setSoloTestMode] = useState(false);
  const [activeRoom, setActiveRoom] = useState<RoomId>('overview');

  const [currentPhase, setCurrentPhase] = useState<MissionPhaseNumber>(1);
  const [minigameStates, setMinigameStates] = useState<Record<string, MinigameInstanceState>>(
    createInitialMinigameStates,
  );
  const [activeMinigameCode, setActiveMinigameCode] = useState<string | null>(null);

  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [pendingLaunchOutcome, setPendingLaunchOutcome] = useState<LaunchOutcome | null>(null);
  const [launchOutcome, setLaunchOutcome] = useState<LaunchOutcome | null>(null);

  const [departmentMessages, setDepartmentMessages] = useState<DepartmentMessage[]>(
    INITIAL_DEPT_MESSAGES,
  );
  const [whiteboardNotes, setWhiteboardNotes] = useState<Record<string, WhiteboardNote[]>>(
    INITIAL_WHITEBOARD_NOTES,
  );
  const [activeInteractable, setActiveInteractable] = useState<InteractableId | null>(null);
  const [explodedView, setExplodedView] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [cargoStates, setCargoStates] = useState<Record<string, CargoModuleState>>(
    createInitialCargoStates,
  );
  const [soundMuted, setSoundMuted] = useState(false);
  const [toast, setToast] = useState<ToastBanner | null>(null);
  const [, setLogs] = useState<MissionLogEntry[]>([
    {
      id: 'init-1',
      timestamp: '00:00:00',
      playerName: 'Control Base',
      roleId: 'pilot',
      action: 'join',
      message: 'Complejo espacial operativo. 6 fases y 72 minijuegos listos en estación.',
    },
  ]);

  useEffect(() => {
    const unlock = () => {
      soundFx.unlock();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (!cinematicDemoMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setCinematicDemoMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cinematicDemoMode]);

  useEffect(() => {
    if (emergencyAlert && !inLobby && !briefingActive && !isLaunching) {
      soundFx.startRedAlertKlaxon();
    } else {
      soundFx.stopRedAlertKlaxon();
    }
    return () => {
      soundFx.stopRedAlertKlaxon();
    };
  }, [briefingActive, emergencyAlert, inLobby, isLaunching]);

  const sharedState = useMemo(
    () => computeSharedMissionState(minigameStates, difficulty, cargoStates),
    [cargoStates, difficulty, minigameStates],
  );

  const installedModuleIds = useMemo(
    () => getUnlocked3DModulesFromMinigames(minigameStates),
    [minigameStates],
  );

  const resources = useMemo(
    () => getMissionResourcesFromSharedState(sharedState),
    [sharedState],
  );

  const activeConflicts = useMemo<ActiveConflict[]>(() => {
    return sharedState.recalcRequiredCodes.map((code) => {
      const def = MINIGAME_MAP[code];
      const depRole = def?.dependsOnCodes[0]
        ? MINIGAME_MAP[def.dependsOnCodes[0]]?.roleId ?? 'systems'
        : 'finance';
      return {
        id: `recalc-${code}`,
        code,
        phaseNumber: def?.phaseNumber ?? 1,
        sourceRole: def?.roleId ?? 'systems',
        title: `Recálculo pendiente en ${code} (${def?.title ?? code})`,
        affectedRoles: [def?.roleId ?? 'systems', depRole],
        severity: 'warning',
        description: `Un minijuego previo del que depende ${code} fue actualizado. Reabre ${code} y vuelve a confirmarlo.`,
        resolved: false,
      };
    });
  }, [sharedState.recalcRequiredCodes]);

  const showToast = useCallback(
    (tone: ToastBanner['tone'], text: string) => {
      const id = Date.now();
      setToast({ id, tone, text });
      window.setTimeout(() => {
        setToast((prev) => (prev && prev.id === id ? null : prev));
      }, 4000);
    },
    [],
  );

  const appendLog = useCallback(
    (
      name: string,
      roleId: RoleId,
      action: MissionLogEntry['action'],
      message: string,
    ) => {
      setLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: formatNow(),
          playerName: name,
          roleId,
          action,
          message,
        },
        ...prev,
      ]);
    },
    [],
  );

  const handleEnterBase = (
    name: string,
    roleId: RoleId,
    selectedDiff: DifficultyId,
    soloMode: boolean,
    missionRoomCode?: string,
  ) => {
    setPlayerName(name);
    setActiveRole(roleId);
    setDifficulty(selectedDiff);
    setSoloTestMode(soloMode);
    setRoomCode(missionRoomCode ?? null);
    setInLobby(false);
    setLobbyStageMode('menu');
    setActiveRoom(ROLE_MAP[roleId].roomId);
    setBriefingActive(true);
    setActiveInteractable(null);
    setActiveMinigameCode(null);
    setExplodedView(false);
    setIsLaunching(false);
    setPendingLaunchOutcome(null);
    setLaunchOutcome(null);
    setEmergencyAlert(false);
    setCurrentPhase(1);
    setMinigameStates(createInitialMinigameStates());
    setCargoStates(createInitialCargoStates());

    const roleName = ROLE_MAP[roleId].name;
    const diffCfg = DIFFICULTY_CONFIGS[selectedDiff];
    setLogs([
      {
        id: `join-${Date.now()}`,
        timestamp: formatNow(),
        playerName: name,
        roleId,
        action: 'join',
        message: `Alta de ${name} como ${roleName} para ${diffCfg.label} (${diffCfg.targetName})${
          missionRoomCode ? ` · Sala ${missionRoomCode}` : ''
        }${soloMode ? ' · Modo Solo Test' : ''}.`,
      },
    ]);
  };

  const handleCompleteBriefing = useCallback(() => {
    setBriefingActive(false);
    const roleDef = ROLE_MAP[activeRole];
    setActiveRoom(roleDef.roomId);
    showToast(
      'info',
      `Dentro de ${roleDef.roomName}. Abre tu Ordenador o Tablet para iniciar Fase 1 (72 minijuegos).`,
    );
  }, [activeRole, showToast]);

  const handleSelectRoom = useCallback(
    (roomId: RoomId) => {
      if (!canAccessRoom(roomId, activeRole)) {
        const roomDef = ROOM_MAP[roomId];
        const ownerDef = roomDef.ownerRole ? ROLE_MAP[roomDef.ownerRole] : null;
        showToast(
          'locked',
          `Acceso restringido a ${roomDef.name}. Reservado para ${
            ownerDef ? ownerDef.name : 'especialista asignado'
          }.`,
        );
        return;
      }
      setActiveRoom(roomId);
      setActiveInteractable(null);
    },
    [activeRole, showToast],
  );

  const handleOpenMapOverview = useCallback(() => {
    setActiveRoom('overview');
    setActiveInteractable(null);
  }, []);

  const handleSwitchRole = useCallback(
    (newRole: RoleId) => {
      setActiveRole(newRole);
      setActiveInteractable(null);
      const roleDef = ROLE_MAP[newRole];
      if (ROOM_MAP[activeRoom].type === 'private') {
        setActiveRoom(roleDef.roomId);
      }
      showToast('info', `Rol activo cambiado a ${roleDef.name}`);
    },
    [activeRoom, showToast],
  );

  const handleSelectInteractable = useCallback((id: InteractableId) => {
    const interactable = INTERACTABLES_MAP[id];
    if (interactable.kind === 'drawer') {
      soundFx.playDrawerSlide(true);
      soundFx.playPaperRustle();
    } else if (interactable.kind === 'computer' || interactable.kind === 'comms') {
      soundFx.playKeyClick();
    }
    setActiveInteractable(id);
  }, []);

  const handleOpenMinigame = useCallback((code: string) => {
    if (!MINIGAME_MAP[code]) return;
    soundFx.playKeyClick();
    setActiveMinigameCode(code);
  }, []);

  const handleSaveDraft = useCallback(
    (code: string, nextPayload: MinigamePayload, undoStack: MinigamePayload[]) => {
      setMinigameStates((prev) => {
        const cur = prev[code];
        if (!cur) return prev;
        return {
          ...prev,
          [code]: {
            ...cur,
            status: cur.status === 'no_iniciado' ? 'en_progreso' : cur.status,
            draftPayload: nextPayload,
            undoStack,
            updatedAt: formatNow(),
          },
        };
      });
      showToast('info', `Borrador guardado para ${code}.`);
    },
    [showToast],
  );

  const handleSimulateMinigame = useCallback(
    (
      code: string,
      nextPayload: MinigamePayload,
      undoStack: MinigamePayload[],
      validation: MinigameValidationResult,
    ) => {
      setMinigameStates((prev) => {
        const cur = prev[code];
        if (!cur) return prev;
        return {
          ...prev,
          [code]: {
            ...cur,
            status: validation.passed ? 'validado' : 'en_progreso',
            draftPayload: nextPayload,
            undoStack,
            lastValidation: validation,
            updatedAt: formatNow(),
          },
        };
      });
      showToast(
        validation.passed ? 'success' : 'warning',
        validation.passed
          ? `${code}: simulación válida. Puedes pulsar "Confirmar decisión".`
          : `${code}: bloqueos activos detectados en el panel de Validación.`,
      );
    },
    [showToast],
  );

  const handleRequestReview = useCallback(
    (
      code: string,
      nextPayload: MinigamePayload,
      undoStack: MinigamePayload[],
      validation: MinigameValidationResult,
    ) => {
      setMinigameStates((prev) => {
        const cur = prev[code];
        if (!cur) return prev;
        return {
          ...prev,
          [code]: {
            ...cur,
            status: 'pendiente_revision',
            draftPayload: nextPayload,
            undoStack,
            lastValidation: validation,
            updatedAt: formatNow(),
          },
        };
      });
      appendLog(playerName, activeRole, 'comms', `Solicitó revisión de equipo para ${code}.`);
      showToast('info', `${code} enviado a revisión cooperativa.`);
    },
    [activeRole, appendLog, playerName, showToast],
  );

  const handleConfirmMinigame = useCallback(
    (
      code: string,
      nextPayload: MinigamePayload,
      justification: string,
      validation: MinigameValidationResult,
    ) => {
      const def = MINIGAME_MAP[code];
      if (!def || !validation.passed) return;

      const nowTime = formatNow();
      let invalidatedDownstream: string[] = [];
      let nextPhaseUnlocked: MissionPhaseNumber | null = null;

      setMinigameStates((prev) => {
        const cur = prev[code];
        if (!cur) return prev;

        const nextVersion = cur.history.length + 1;
        const entry = {
          id: `ver-${code}-${nextVersion}-${Date.now()}`,
          version: nextVersion,
          timestamp: nowTime,
          authorName: playerName,
          authorRole: activeRole,
          summary: `${def.title} (v${nextVersion})`,
          justification,
          snapshotPayload: JSON.parse(JSON.stringify(nextPayload)) as MinigamePayload,
        };

        const updated: Record<string, MinigameInstanceState> = {
          ...prev,
          [code]: {
            ...cur,
            status: 'confirmado',
            dirtyNeedsRecalc: false,
            draftPayload: JSON.parse(JSON.stringify(nextPayload)) as MinigamePayload,
            confirmedPayload: JSON.parse(JSON.stringify(nextPayload)) as MinigamePayload,
            lastValidation: validation,
            history: [entry, ...cur.history],
            updatedAt: nowTime,
          },
        };

        // Mark downstream confirmed minigames that depend on `code` as needing recalculation
        const queue = [code];
        const visited = new Set<string>([code]);
        const dirtyList: string[] = [];

        while (queue.length > 0) {
          const sourceCode = queue.shift()!;
          for (const candidate of MINIGAMES_72) {
            if (visited.has(candidate.code)) continue;
            if (candidate.dependsOnCodes.includes(sourceCode)) {
              const candState = updated[candidate.code];
              if (candState && candState.status === 'confirmado') {
                updated[candidate.code] = {
                  ...candState,
                  status: 'requiere_cambios',
                  dirtyNeedsRecalc: true,
                  updatedAt: nowTime,
                };
                dirtyList.push(candidate.code);
                visited.add(candidate.code);
                queue.push(candidate.code);
              }
            }
          }
        }
        invalidatedDownstream = dirtyList;

        // Check phase advancement
        if (currentPhase < 6) {
          const phaseMeta = PHASE_6_MAP[currentPhase];
          const phaseGames = getMinigamesForPhase(currentPhase);
          const doneCount = phaseGames.filter(
            (m) => updated[m.code]?.status === 'confirmado',
          ).length;
          const gateOk =
            !phaseMeta.gateCode || updated[phaseMeta.gateCode]?.status === 'confirmado';
          if (doneCount >= 10 && gateOk) {
            nextPhaseUnlocked = (currentPhase + 1) as MissionPhaseNumber;
          }
        }

        return updated;
      });

      appendLog(
        playerName,
        activeRole,
        'mission',
        `Confirmó ${code} (${def.title}): ${justification}`,
      );

      if (invalidatedDownstream.length > 0) {
        showToast(
          'warning',
          `${code} confirmado. Recálculo requerido en: ${invalidatedDownstream.join(', ')}`,
        );
      } else if (nextPhaseUnlocked) {
        setCurrentPhase(nextPhaseUnlocked);
        showToast(
          'success',
          `${code} confirmado. Fase ${currentPhase} superada — Avanzando a Fase ${nextPhaseUnlocked}/6.`,
        );
      } else {
        showToast('success', `${code} (${def.title}) confirmado en el Estado Compartido.`);
      }
    },
    [activeRole, appendLog, currentPhase, playerName, showToast],
  );

  const handleRevertVersion = useCallback(
    (code: string, historyEntryId: string) => {
      setMinigameStates((prev) => {
        const cur = prev[code];
        const target = cur?.history.find((h) => h.id === historyEntryId);
        if (!cur || !target) return prev;
        return {
          ...prev,
          [code]: {
            ...cur,
            status: 'en_progreso',
            draftPayload: JSON.parse(JSON.stringify(target.snapshotPayload)) as MinigamePayload,
            updatedAt: formatNow(),
          },
        };
      });
      showToast('info', `${code} revertido en borrador. Revisa y vuelve a confirmar.`);
    },
    [showToast],
  );

  const handleAddComment = useCallback(
    (code: string, text: string) => {
      setMinigameStates((prev) => {
        const cur = prev[code];
        if (!cur) return prev;
        return {
          ...prev,
          [code]: {
            ...cur,
            comments: [
              {
                id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                timestamp: formatNow(),
                authorName: `${playerName} (${ROLE_MAP[activeRole].shortName})`,
                authorRole: activeRole,
                text,
              },
              ...cur.comments,
            ],
          },
        };
      });
    },
    [activeRole, playerName],
  );

  const handleAdvancePhase = useCallback(
    (targetPhase?: MissionPhaseNumber) => {
      const next = targetPhase ?? ((currentPhase < 6 ? currentPhase + 1 : 6) as MissionPhaseNumber);
      setCurrentPhase(next);
      showToast('info', `Fase activa cambiada a ${PHASE_6_MAP[next].code}: ${PHASE_6_MAP[next].title}`);
    },
    [currentPhase, showToast],
  );

  const handleCallEmergencyMeeting = useCallback(() => {
    setEmergencyAlert(true);
    setActiveRoom('meeting');
    setActiveInteractable('mtg-holo');
    appendLog(
      playerName,
      activeRole,
      'alert',
      'Convocada Reunión Cooperativa en Sala de Gates.',
    );
    showToast('warning', 'Sala de Gates activada — Revisa votaciones pendientes y Anexo C.');
  }, [activeRole, appendLog, playerName, showToast]);

  const handleCancelRedAlert = useCallback(() => {
    setEmergencyAlert(false);
    soundFx.stopRedAlertKlaxon();
    showToast('info', 'Alerta Roja desactivada.');
  }, [showToast]);

  const handleSendMessage = useCallback(
    (toRole: RoleId | 'all', text: string) => {
      const msg: DepartmentMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fromRole: activeRole,
        toRole,
        senderName: `${playerName} (${ROLE_MAP[activeRole].shortName})`,
        text,
        timestamp: formatNow(),
      };
      setDepartmentMessages((prev) => [msg, ...prev]);
      showToast('success', 'Mensaje transmitido a la red del complejo.');
    },
    [activeRole, playerName, showToast],
  );

  const handleAddWhiteboardNote = useCallback((boardId: InteractableId, text: string) => {
    setWhiteboardNotes((prev) => ({
      ...prev,
      [boardId]: [
        ...(prev[boardId] ?? []),
        { id: `note-${Date.now()}`, text, checked: false },
      ],
    }));
  }, []);

  const handleToggleWhiteboardNote = useCallback((boardId: InteractableId, noteId: string) => {
    setWhiteboardNotes((prev) => ({
      ...prev,
      [boardId]: (prev[boardId] ?? []).map((n) =>
        n.id === noteId ? { ...n, checked: !n.checked } : n,
      ),
    }));
  }, []);

  const handleTriggerLaunch = useCallback(() => {
    const outcomeSnapshot = evaluateLaunchOutcome6(
      difficulty,
      sharedState,
      minigameStates,
      currentPhase,
      activeConflicts,
    );

    setPendingLaunchOutcome(outcomeSnapshot);
    setLaunchOutcome(null);
    setExplodedView(false);
    setActiveInteractable(null);
    setActiveMinigameCode(null);
    setActiveRoom('hangar');
    setIsLaunching(true);

    appendLog(
      playerName,
      activeRole,
      'launch',
      `Simulación de lanzamiento iniciada en ${PHASE_6_MAP[currentPhase].code} (${DIFFICULTY_CONFIGS[difficulty].targetName}).`,
    );
  }, [
    activeConflicts,
    activeRole,
    appendLog,
    currentPhase,
    difficulty,
    minigameStates,
    playerName,
    sharedState,
  ]);

  const finalizeLaunchCinematic = useCallback(
    (skipped: boolean) => {
      setIsLaunching(false);
      if (pendingLaunchOutcome) {
        setLaunchOutcome(pendingLaunchOutcome);
        appendLog(
          'Dirección de Vuelo',
          'pilot',
          'launch',
          pendingLaunchOutcome.success
            ? `Misión completada${skipped ? ' (telemetría adelantada)' : ''}: ${pendingLaunchOutcome.destinationName}`
            : `Simulación abortada en Fase ${pendingLaunchOutcome.currentPhase}/6: ${pendingLaunchOutcome.rootCauseHeadline}`,
        );
        setPendingLaunchOutcome(null);
      }
    },
    [appendLog, pendingLaunchOutcome],
  );

  const handleCompleteLaunchCinematic = useCallback(() => {
    finalizeLaunchCinematic(false);
  }, [finalizeLaunchCinematic]);

  const handleSkipLaunchCinematic = useCallback(() => {
    finalizeLaunchCinematic(true);
  }, [finalizeLaunchCinematic]);

  const handleResetLaunch = useCallback(() => {
    setIsLaunching(false);
    setPendingLaunchOutcome(null);
    setLaunchOutcome(null);
    showToast('info', 'Vehículo restaurado en rampa del Hangar.');
  }, [showToast]);

  const handleExitFocus = useCallback(() => {
    if (activeInteractable && INTERACTABLES_MAP[activeInteractable]?.kind === 'drawer') {
      soundFx.playDrawerSlide(false);
    }
    setActiveInteractable(null);
  }, [activeInteractable]);

  const handleCargoDamaged = useCallback(
    (cargoId: string, nextIntegrity: number, riskAddedPct: number) => {
      setCargoStates((prev) => {
        const current = prev[cargoId] ?? {
          id: cargoId,
          integrity: 100,
          delivered: false,
          riskPenaltyPct: 0,
        };
        return {
          ...prev,
          [cargoId]: {
            ...current,
            integrity: Math.max(0, Math.min(100, nextIntegrity)),
            riskPenaltyPct: current.riskPenaltyPct + riskAddedPct,
          },
        };
      });

      if (riskAddedPct > 0) {
        const def = CARGO_MAP[cargoId];
        showToast(
          'warning',
          `${def?.shortLabel ?? 'Carga'} dañada (${nextIntegrity}% integridad, +${riskAddedPct}% riesgo).`,
        );
      }
    },
    [showToast],
  );

  const handleCargoDelivered = useCallback(
    (cargoId: string) => {
      const def = CARGO_MAP[cargoId];
      setCargoStates((prev) => {
        const current = prev[cargoId];
        if (!current || current.delivered) return prev;
        return {
          ...prev,
          [cargoId]: {
            ...current,
            delivered: true,
          },
        };
      });
      showToast('success', `${def?.name ?? 'Módulo'} acoplado en Plataforma del Hangar.`);
    },
    [showToast],
  );

  const myPhaseMinigames = getMinigamesForRoleAndPhase(activeRole, currentPhase);
  const myNextPending =
    myPhaseMinigames.find((m) => minigameStates[m.code]?.status !== 'confirmado') ??
    myPhaseMinigames[0];
  const recalcCount = sharedState.recalcRequiredCodes.length;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060911]">
      {/* 3D Interactive Space Complex Viewport */}
      <SpaceViewport3D
        inLobby={inLobby}
        lobbyStageMode={lobbyStageMode}
        briefingActive={briefingActive}
        activeRoom={activeRoom}
        activeRole={activeRole}
        difficulty={difficulty}
        currentPhase={currentPhase}
        emergencyAlert={emergencyAlert}
        installedModuleIds={installedModuleIds}
        cargoStates={cargoStates}
        explodedView={explodedView}
        isLaunching={isLaunching}
        launchMode={pendingLaunchOutcome?.failureMode ?? null}
        focusedInteractable={activeInteractable}
        onSelectRoom={handleSelectRoom}
        onSelectInteractable={handleSelectInteractable}
        onExitFocus={handleExitFocus}
        onCompleteBriefing={handleCompleteBriefing}
        onCompleteLaunchCinematic={handleCompleteLaunchCinematic}
        onSkipLaunchCinematic={handleSkipLaunchCinematic}
        onCargoDamaged={handleCargoDamaged}
        onCargoDelivered={handleCargoDelivered}
        onCancelRedAlert={handleCancelRedAlert}
        cinematicDemoMode={cinematicDemoMode}
      />

      {/* Lobby Overlay */}
      {!cinematicDemoMode && inLobby && (
        <LobbyScreen
          initialName={playerName}
          initialRole={activeRole}
          initialDifficulty={difficulty}
          stageMode={lobbyStageMode}
          onStageModeChange={setLobbyStageMode}
          onRoleChange={setActiveRole}
          onDifficultyChange={setDifficulty}
          onEnterBase={handleEnterBase}
        />
      )}

      {/* Active Mission Floating HUD */}
      {!cinematicDemoMode && !inLobby && !briefingActive && !isLaunching && (
        <>
          {/* Top-Left Status & Quick Minigame Launcher */}
          <div className="fixed top-3.5 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100vw-24rem)]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-700/90 shadow-lg text-xs">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: ROLE_MAP[activeRole].colorHex }}
              />
              <span className="font-semibold text-white truncate max-w-[140px]">
                {playerName}
              </span>
              {roomCode && (
                <>
                  <span className="text-slate-600 hidden lg:inline">·</span>
                  <span className="font-mono-tabular text-[11px] text-sky-400 hidden lg:inline">
                    {roomCode}
                  </span>
                </>
              )}
              <span className="text-slate-600">·</span>
              <span
                className="font-display font-bold whitespace-nowrap"
                style={{ color: ROLE_MAP[activeRole].colorHex }}
              >
                {ROLE_MAP[activeRole].shortName}
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-sky-300 font-mono-tabular font-semibold hidden sm:inline whitespace-nowrap">
                Fase {currentPhase}/6
              </span>
              <span className="text-slate-600 hidden md:inline">·</span>
              <span className="text-slate-300 hidden md:inline whitespace-nowrap">
                {ROOM_MAP[activeRoom].shortLabel}
              </span>
            </div>

            {myNextPending && !activeInteractable && !activeMinigameCode && (
              <button
                type="button"
                onClick={() => handleOpenMinigame(myNextPending.code)}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer whitespace-nowrap"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>
                  {myNextPending.code}: {myNextPending.title}
                </span>
              </button>
            )}

            {soloTestMode && !activeInteractable && !activeMinigameCode && (
              <div className="flex items-center gap-1 bg-[#0B101B]/95 border border-slate-700/80 rounded-lg p-1 shadow-lg">
                {ROLES.map((r) => {
                  const selected = r.id === activeRole;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSwitchRole(r.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        selected
                          ? 'bg-slate-800 text-white border border-slate-500'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-xs shrink-0"
                        style={{ backgroundColor: r.colorHex }}
                      />
                      <span>{r.shortName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top-Right Compact Controls */}
          <div className="fixed top-3.5 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenMapOverview}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeRoom === 'overview'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                  : 'bg-[#0B101B]/95 border-slate-700 hover:border-sky-400 text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Mapa 3D</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSoloTestMode((prev) => {
                  const next = !prev;
                  showToast(
                    'info',
                    next
                      ? 'Modo Solo Test activo: alterna entre los 4 roles y salta entre las 6 fases.'
                      : 'Modo Solo Test desactivado.',
                  );
                  return next;
                });
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap ${
                soloTestMode
                  ? 'bg-amber-500/20 border-amber-400/70 text-amber-200'
                  : 'bg-[#0B101B]/95 border-slate-700 hover:border-slate-500 text-slate-300'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Solo Test</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.unlock();
                const nextMuted = !soundMuted;
                soundFx.setMuted(nextMuted);
                setSoundMuted(nextMuted);
                if (!nextMuted) soundFx.playKeyClick();
              }}
              title={soundMuted ? 'Activar sonido' : 'Silenciar'}
              className="px-2.5 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {soundMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span className="hidden sm:inline">{soundMuted ? 'Mute' : 'SFX'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLaunching(false);
                setPendingLaunchOutcome(null);
                setLaunchOutcome(null);
                setBriefingActive(false);
                setActiveInteractable(null);
                setActiveMinigameCode(null);
                setLobbyStageMode('menu');
                setInLobby(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lobby</span>
            </button>
          </div>

          {/* Bottom-Left Room Controls */}
          {!activeInteractable && !activeMinigameCode && (
            <div className="fixed bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
              {activeRoom === 'overview' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectRoom('hangar')}
                    className="px-3 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-700 hover:border-sky-400 text-xs font-semibold text-white shadow-lg cursor-pointer"
                  >
                    Hangar Cohete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRoom('meeting')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold text-white shadow-lg cursor-pointer ${
                      recalcCount > 0 || emergencyAlert
                        ? 'bg-rose-950 border-rose-400 red-alert-strobe'
                        : 'bg-[#0B101B]/95 border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    Sala de Gates
                    {recalcCount > 0 ? ` (${recalcCount})` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRoom(ROLE_MAP[activeRole].roomId)}
                    className="px-3 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-700 hover:border-white text-xs font-semibold text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: ROLE_MAP[activeRole].colorHex }}
                    />
                    <span>Mi Laboratorio</span>
                  </button>
                </>
              ) : (
                <>
                  {activeRoom === 'hangar' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExplodedView((v) => !v)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer ${
                          explodedView
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-[#0B101B]/95 border-slate-700 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{explodedView ? 'Contraer' : 'Vista Explosionada'}</span>
                      </button>

                      {isLaunching ? (
                        <button
                          type="button"
                          onClick={handleResetLaunch}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reiniciar Rampa</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleTriggerLaunch}
                          className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>SIMULAR LANZAMIENTO</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="hidden md:block px-2.5 py-1.5 rounded-lg bg-[#0B101B]/95 border border-slate-800 text-[11px] text-slate-400 shadow">
                    WASD · Caminar | Shift · Correr | Arrastrar · Mirar | Clic Izq · Usar | Clic Der / E · Rayo Tractor
                  </div>
                </>
              )}
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
              <div
                className={`px-4 py-2 rounded-lg border text-xs font-medium shadow-xl flex items-center gap-2 whitespace-nowrap ${
                  toast.tone === 'locked'
                    ? 'bg-[#19121A] border-amber-500/50 text-amber-200'
                    : toast.tone === 'warning'
                      ? 'bg-[#1C1414] border-rose-500/50 text-rose-200'
                      : toast.tone === 'success'
                        ? 'bg-[#0C1B18] border-emerald-500/50 text-emerald-200'
                        : 'bg-[#0B1324] border-sky-500/50 text-sky-100'
                }`}
              >
                {toast.tone === 'locked' && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                {toast.tone === 'warning' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                {toast.tone === 'success' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
            </div>
          )}

          {/* Station Interaction Modal */}
          {activeInteractable && (
            <InteractableModal
              interactableId={activeInteractable}
              activeRole={activeRole}
              difficulty={difficulty}
              currentPhase={currentPhase}
              installedModuleIds={installedModuleIds}
              sharedState={sharedState}
              minigameStates={minigameStates}
              activeConflicts={activeConflicts}
              emergencyAlert={emergencyAlert}
              resources={resources}
              cargoStates={cargoStates}
              departmentMessages={departmentMessages}
              whiteboardNotes={whiteboardNotes}
              explodedView={explodedView}
              isLaunching={isLaunching}
              onOpenMinigame={handleOpenMinigame}
              onCallEmergencyMeeting={handleCallEmergencyMeeting}
              onCancelRedAlert={handleCancelRedAlert}
              onSendMessage={handleSendMessage}
              onAddWhiteboardNote={handleAddWhiteboardNote}
              onToggleWhiteboardNote={handleToggleWhiteboardNote}
              onToggleExploded={() => setExplodedView((v) => !v)}
              onTriggerLaunch={handleTriggerLaunch}
              onResetLaunch={handleResetLaunch}
              onClose={handleExitFocus}
            />
          )}

          {/* 3-Column Reusable Minigame Workbench */}
          {activeMinigameCode && minigameStates[activeMinigameCode] && (
            <MinigameWorkbenchModal
              code={activeMinigameCode}
              instanceState={minigameStates[activeMinigameCode]}
              allStates={minigameStates}
              sharedState={sharedState}
              activeRole={activeRole}
              playerName={playerName}
              difficulty={difficulty}
              onSaveDraft={handleSaveDraft}
              onSimulate={handleSimulateMinigame}
              onRequestReview={handleRequestReview}
              onConfirm={handleConfirmMinigame}
              onRevertVersion={handleRevertVersion}
              onAddComment={handleAddComment}
              onOpenMinigame={(other) => setActiveMinigameCode(other)}
              onClose={() => setActiveMinigameCode(null)}
            />
          )}

          {/* Post-Launch Debrief Modal */}
          {launchOutcome && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
              <div
                className={`w-full max-w-3xl rounded-2xl border-2 shadow-2xl overflow-hidden ${
                  launchOutcome.success
                    ? 'bg-[#081512] border-emerald-500'
                    : 'bg-[#190B0E] border-rose-500'
                }`}
              >
                <div
                  className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${
                    launchOutcome.success
                      ? 'bg-[#0C211B] border-emerald-500/40'
                      : 'bg-[#280F14] border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {launchOutcome.success ? (
                      <Rocket className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-slate-300">
                        Informe de Vuelo · Fase {launchOutcome.currentPhase}/6
                      </div>
                      <h2 className="font-display text-xl font-bold text-white">
                        {launchOutcome.headline}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="rounded-lg border border-slate-700/80 bg-black/40 p-2.5">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                        Fase Evaluada
                      </div>
                      <div className="font-display text-xs font-bold text-white mt-0.5">
                        Fase {launchOutcome.currentPhase}/6 · {launchOutcome.phaseTitle}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700/80 bg-black/40 p-2.5">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                        Destino
                      </div>
                      <div className="font-display text-xs font-bold text-sky-300 mt-0.5">
                        {launchOutcome.destinationName}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700/80 bg-black/40 p-2.5">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                        Altitud / Resultado
                      </div>
                      <div
                        className={`font-mono-tabular text-xs font-bold mt-0.5 ${
                          launchOutcome.success ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {launchOutcome.finalAltitudeLabel}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700/80 bg-black/40 p-2.5">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                        Velocidad Pico
                      </div>
                      <div className="font-mono-tabular text-xs font-bold text-amber-300 mt-0.5">
                        {launchOutcome.peakVelocityLabel}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-3.5 space-y-1.5 ${
                      launchOutcome.success
                        ? 'border-emerald-500/40 bg-[#0A1F18]'
                        : 'border-rose-500/50 bg-[#230E13]'
                    }`}
                  >
                    <div className="text-sm font-display font-bold text-white">
                      {launchOutcome.rootCauseHeadline}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {launchOutcome.narrative}
                    </p>
                  </div>

                  {launchOutcome.failureReasons.length > 0 && (
                    <div className="rounded-xl border border-rose-500/50 bg-black/40 p-3.5 space-y-1.5">
                      <div className="text-xs font-display font-bold text-rose-300 uppercase tracking-wider">
                        Requisitos de Anexo C y Gates Pendientes
                      </div>
                      <ul className="space-y-1">
                        {launchOutcome.failureReasons.map((reason, i) => (
                          <li key={i} className="text-xs text-rose-100 flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {launchOutcome.passedChecks.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/40 bg-black/40 p-3.5 space-y-1.5">
                      <div className="text-xs font-display font-bold text-emerald-300 uppercase tracking-wider">
                        Sistemas Verificados
                      </div>
                      <ul className="space-y-1">
                        {launchOutcome.passedChecks.map((check, i) => (
                          <li key={i} className="text-xs text-emerald-100 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleResetLaunch}
                      className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Volver al Complejo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tablet HUD */}
          <TabletHud
            activeRole={activeRole}
            activeRoom={activeRoom}
            difficulty={difficulty}
            currentPhase={currentPhase}
            soloTestMode={soloTestMode}
            resources={resources}
            sharedState={sharedState}
            minigameStates={minigameStates}
            installedModuleIds={installedModuleIds}
            activeConflicts={activeConflicts}
            emergencyAlert={emergencyAlert}
            cargoStates={cargoStates}
            explodedView={explodedView}
            isLaunching={isLaunching}
            onOpenMinigame={handleOpenMinigame}
            onAdvancePhase={handleAdvancePhase}
            onSelectRoom={handleSelectRoom}
            onToggleExploded={() => setExplodedView((v) => !v)}
            onTriggerLaunch={handleTriggerLaunch}
            onResetLaunch={handleResetLaunch}
            onCallEmergencyMeeting={handleCallEmergencyMeeting}
            onCancelRedAlert={handleCancelRedAlert}
          />
        </>
      )}
    </main>
  );
}
