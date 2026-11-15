import * as THREE from 'three';
import type { RoleId } from '../types/mission';
import { makeRoundedRectShape } from './furnitureBuilder';
import type { SpaceMaterialLibrary } from './materials';

export interface LobbyHeroCharacterRig {
  group: THREE.Group;
  setRole: (roleId: RoleId) => void;
  update: (elapsed: number, delta: number, visible: boolean) => void;
}

interface RoleVisualTheme {
  accentHex: number;
  packHex: number;
  visorHex: number;
  eyeHex: number;
}

const ROLE_THEMES: Record<RoleId, RoleVisualTheme> = {
  systems: {
    accentHex: 0xf97316, // Systems Engineer — Orange
    packHex: 0xea580c,
    visorHex: 0xfb923c,
    eyeHex: 0xffedd5,
  },
  finance: {
    accentHex: 0xeab308, // Program Manager — Amber / Gold
    packHex: 0xca8a04,
    visorHex: 0xfacc15,
    eyeHex: 0xfef9c3,
  },
  science: {
    accentHex: 0x22c55e, // Mission Scientist — Emerald Green
    packHex: 0x16a34a,
    visorHex: 0x4ade80,
    eyeHex: 0xdcfce7,
  },
  pilot: {
    accentHex: 0x3b82f6, // Flight Operations — Cyan / Blue
    packHex: 0x0284c7,
    visorHex: 0x38bdf8,
    eyeHex: 0xe0f2fe,
  },
};

const _targetAccentColor = new THREE.Color();
const _targetPackColor = new THREE.Color();
const _targetVisorColor = new THREE.Color();
const _targetEyeColor = new THREE.Color();

function buildThrusterWrenchProp(mats: SpaceMaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const orangeAccent = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: new THREE.Color(0xea580c),
    emissiveIntensity: 0.45,
    roughness: 0.32,
    metalness: 0.45,
  });

  // Heavy aerospace torque shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.046, 0.62, 12),
    mats.brushedSteel,
  );
  shaft.castShadow = true;
  group.add(shaft);

  // Knurled grip sleeve & glowing calibration ring
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.056, 0.056, 0.22, 12),
    orangeAccent,
  );
  grip.position.y = -0.14;
  grip.castShadow = true;
  group.add(grip);

  const calRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.06, 0.012, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0xfdba74 }),
  );
  calRing.rotation.x = Math.PI / 2;
  calRing.position.y = 0.06;
  group.add(calRing);

  // Open C-jaw head (top)
  const jawHead = new THREE.Mesh(
    new THREE.TorusGeometry(0.115, 0.034, 8, 16, Math.PI * 1.42),
    mats.titanium,
  );
  jawHead.position.y = 0.34;
  jawHead.rotation.z = Math.PI * 0.28;
  jawHead.castShadow = true;
  group.add(jawHead);

  // Closed box wrench ring (bottom)
  const boxJaw = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.026, 8, 14),
    mats.titanium,
  );
  boxJaw.position.y = -0.34;
  boxJaw.castShadow = true;
  group.add(boxJaw);

  group.rotation.z = -0.32;
  return group;
}

function buildEncryptedBriefcaseProp(mats: SpaceMaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const goldLockMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: new THREE.Color(0xeab308),
    emissiveIntensity: 0.65,
    roughness: 0.24,
    metalness: 0.78,
  });

  // Armored briefcase shell
  const caseShape = makeRoundedRectShape(0.48, 0.34, 0.045);
  const caseGeo = new THREE.ExtrudeGeometry(caseShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 2,
  });
  caseGeo.center();
  const caseMesh = new THREE.Mesh(caseGeo, mats.hullDark);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Titanium perimeter bumper band
  const seamBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.036, 0.165),
    mats.titanium,
  );
  seamBand.position.y = 0.03;
  group.add(seamBand);

  // Top carry handle
  const handleArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.018, 8, 12, Math.PI),
    mats.brushedSteel,
  );
  handleArc.position.y = 0.18;
  group.add(handleArc);

  // Twin gold security clasps
  for (const sx of [-0.14, 0.14]) {
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.068, 0.175), goldLockMat);
    clasp.position.set(sx, 0.03, 0);
    group.add(clasp);
  }

  // Biometric cipher LED strip
  const cipherLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.022, 0.012),
    new THREE.MeshBasicMaterial({ color: 0xfef08a }),
  );
  cipherLed.position.set(0, -0.05, 0.09);
  group.add(cipherLed);

  group.rotation.y = -0.35;
  return group;
}

function buildSampleCanisterProp(mats: SpaceMaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const emeraldCoreMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    emissive: new THREE.Color(0x22c55e),
    emissiveIntensity: 1.4,
    roughness: 0.18,
    metalness: 0.1,
  });

  // Glowing biological/mineral sample capsule inside
  const innerCore = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.078, 0.24, 6, 12),
    emeraldCoreMat,
  );
  group.add(innerCore);

  // Clear containment cylinder shell
  const glassChamber = new THREE.Mesh(
    new THREE.CylinderGeometry(0.132, 0.132, 0.34, 16, 1, true),
    mats.glassPanel,
  );
  group.add(glassChamber);

  // End-cap titanium containment flanges
  for (const sy of [-0.2, 0.2]) {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.155, 0.155, 0.075, 16),
      mats.titanium,
    );
    cap.position.y = sy;
    cap.castShadow = true;
    group.add(cap);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.014, 6, 18),
      emeraldCoreMat,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = sy * 0.82;
    group.add(ring);
  }

  // 3 vertical protective cage ribs
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.38, 6),
      mats.brushedSteel,
    );
    strut.position.set(Math.cos(a) * 0.145, 0, Math.sin(a) * 0.145);
    group.add(strut);
  }

  group.rotation.z = 0.18;
  return group;
}

function buildFlightTabletProp(mats: SpaceMaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  const cyanTrimMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.4,
  });

  // Rugged aerospace tablet chassis
  const padShape = makeRoundedRectShape(0.46, 0.34, 0.04);
  const padGeo = new THREE.ExtrudeGeometry(padShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  padGeo.center();
  const body = new THREE.Mesh(padGeo, mats.hullDark);
  body.castShadow = true;
  group.add(body);

  // Live telemetry trajectory display
  const screenMat = mats.createScreenMaterial('orbitmap', '#38BDF8', 'FLIGHT OPS');
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.25), screenMat);
  screen.position.z = 0.028;
  group.add(screen);

  // Dual side ergonomic handles + glowing telemetry bar
  for (const sx of [-0.24, 0.24]) {
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.22, 4, 8), cyanTrimMat);
    grip.position.set(sx, 0, 0);
    group.add(grip);
  }

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 0.12, 8),
    mats.brushedSteel,
  );
  antenna.position.set(0.16, 0.21, 0);
  group.add(antenna);

  group.rotation.y = -0.32;
  group.rotation.x = -0.14;
  return group;
}

export function buildLobbyHeroCharacter(mats: SpaceMaterialLibrary): LobbyHeroCharacterRig {
  const group = new THREE.Group();
  group.name = 'LobbyHeroCharacter';

  // Dynamic role-tinted PBR materials
  const rolePackMat = new THREE.MeshStandardMaterial({
    color: ROLE_THEMES.systems.packHex,
    roughness: 0.42,
    metalness: 0.28,
  });

  const roleAccentMat = new THREE.MeshStandardMaterial({
    color: ROLE_THEMES.systems.accentHex,
    emissive: new THREE.Color(ROLE_THEMES.systems.accentHex),
    emissiveIntensity: 0.55,
    roughness: 0.28,
    metalness: 0.35,
  });

  const visorTrimMat = new THREE.MeshStandardMaterial({
    color: ROLE_THEMES.systems.visorHex,
    emissive: new THREE.Color(ROLE_THEMES.systems.visorHex),
    emissiveIntensity: 1.25,
    roughness: 0.2,
    metalness: 0.25,
  });

  const eyeGlowMat = new THREE.MeshStandardMaterial({
    color: ROLE_THEMES.systems.eyeHex,
    emissive: new THREE.Color(ROLE_THEMES.systems.visorHex),
    emissiveIntensity: 1.65,
    roughness: 0.12,
  });

  const suitWhite = mats.hullWhite;
  const jointMat = mats.repoJointRubber;

  // Ground contact shadow disc (at y = 0.012)
  const contactDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 28),
    mats.contactShadow,
  );
  contactDisc.rotation.x = -Math.PI / 2;
  contactDisc.position.y = 0.012;
  group.add(contactDisc);

  // 1 & 2. Two Detached Horizontal Oval Feet resting flush on ground (no legs!)
  const footGroups: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const footGroup = new THREE.Group();
    footGroup.position.set(side * 0.245, 0.088, 0.03);
    footGroup.rotation.y = side * -0.34;

    // Main horizontal oval foot shell
    const footShell = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), suitWhite);
    footShell.scale.set(0.18, 0.086, 0.128);
    footShell.castShadow = true;
    footShell.receiveShadow = true;
    footGroup.add(footShell);

    // High-traction rubber sole pad seated flush at y = 0
    const solePad = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), jointMat);
    solePad.scale.set(0.172, 0.032, 0.12);
    solePad.position.y = -0.056;
    footGroup.add(solePad);

    // Subtle glowing role-accent perimeter stripe around oval foot
    const footTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.174, 0.011, 8, 28),
      roleAccentMat,
    );
    footTrim.rotation.x = Math.PI / 2;
    footTrim.scale.set(1.0, 0.72, 1.0);
    footTrim.position.y = -0.022;
    footGroup.add(footTrim);

    group.add(footGroup);
    footGroups.push(footGroup);
  }

  // 3. Detached Vertical Oval Torso floating cleanly above the feet
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.82, 0);
  group.add(torsoGroup);

  // Tall smooth oval/egg body silhouette matching sketch
  const torsoBody = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 22), suitWhite);
  torsoBody.scale.set(0.265, 0.42, 0.235);
  torsoBody.castShadow = true;
  torsoGroup.add(torsoBody);

  // Flush dark waist seam & role-tinted belt hugging the oval contour
  const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.256, 0.018, 8, 28), jointMat);
  waistRing.rotation.x = Math.PI / 2;
  waistRing.scale.set(1.0, 0.89, 1.0);
  waistRing.position.y = -0.14;
  torsoGroup.add(waistRing);

  const roleBelt = new THREE.Mesh(new THREE.TorusGeometry(0.262, 0.013, 8, 28), roleAccentMat);
  roleBelt.rotation.x = Math.PI / 2;
  roleBelt.scale.set(1.0, 0.89, 1.0);
  roleBelt.position.y = -0.095;
  torsoGroup.add(roleBelt);

  // Flush Chest Mission Badge LED Bar
  const chestPlate = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.038, 0.13, 6, 10),
    visorTrimMat,
  );
  chestPlate.rotation.z = Math.PI / 2;
  chestPlate.position.set(0, 0.11, 0.222);
  torsoGroup.add(chestPlate);

  // Compact Role-Colored Utility Backpack nestled cleanly on back (preserves front oval silhouette)
  const packShape = makeRoundedRectShape(0.3, 0.38, 0.09);
  const packGeo = new THREE.ExtrudeGeometry(packShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.022,
    bevelSegments: 2,
  });
  packGeo.center();
  const packMesh = new THREE.Mesh(packGeo, rolePackMat);
  packMesh.position.set(0, 0.03, -0.23);
  packMesh.castShadow = true;
  torsoGroup.add(packMesh);

  for (const sx of [-0.15, 0.15]) {
    const sideCell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.28, 10),
      mats.weatheredSteel,
    );
    sideCell.position.set(sx, 0.03, -0.23);
    sideCell.castShadow = true;
    torsoGroup.add(sideCell);
  }

  const packLedBar = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.022, 0.22, 4, 8),
    visorTrimMat,
  );
  packLedBar.position.set(0, 0.03, -0.315);
  torsoGroup.add(packLedBar);

  const antennaMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.014, 0.24, 8),
    mats.brushedSteel,
  );
  antennaMast.position.set(-0.11, 0.31, -0.23);
  torsoGroup.add(antennaMast);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), visorTrimMat);
  antennaTip.position.set(-0.11, 0.44, -0.23);
  torsoGroup.add(antennaTip);

  // 4. Detached Floating Round Head cleanly suspended above torso (clear neck gap!)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0.02); // world y ~ 1.60; head bottom ~1.35 vs torso top ~1.24
  torsoGroup.add(headGroup);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 26, 20), suitWhite);
  helmet.scale.set(1.02, 0.98, 1.0);
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Low-profile side comms discs flush to helmet so head remains a clean circle
  for (const side of [-1, 1]) {
    const earCan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.072, 0.072, 0.032, 14),
      roleAccentMat,
    );
    earCan.rotation.z = Math.PI / 2;
    earCan.position.set(side * 0.248, 0, 0);
    headGroup.add(earCan);
  }

  // Glossy curved dark visor + role-tinted glowing visor LED trim bezel
  const visorGlass = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.234,
      20,
      14,
      -Math.PI * 0.42,
      Math.PI * 0.84,
      Math.PI * 0.23,
      Math.PI * 0.48,
    ),
    mats.repoVisorGlass,
  );
  visorGlass.position.z = 0.036;
  headGroup.add(visorGlass);

  const visorRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.202, 0.012, 8, 28),
    visorTrimMat,
  );
  visorRim.position.set(0, 0.01, 0.148);
  visorRim.scale.set(1.06, 0.68, 1);
  headGroup.add(visorRim);

  // Expressive glowing capsule/disc eyes inside visor
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050811 });
  const eyelidMat = mats.repoVisorGlass;

  const createOpticEye = (xOffset: number) => {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(xOffset, 0.01, 0.24);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), eyeGlowMat);
    sclera.scale.set(0.95, 1.08, 0.52);
    eyePivot.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.027, 10, 8), pupilMat);
    pupil.position.set(0, 0, 0.026);
    pupil.scale.set(1, 1.05, 0.48);
    eyePivot.add(pupil);

    const eyelid = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), eyelidMat);
    eyelid.scale.set(1.04, 0.06, 0.6);
    eyelid.position.set(0, 0.052, 0.008);
    eyePivot.add(eyelid);

    headGroup.add(eyePivot);
    return { eyePivot, eyelid };
  };

  const leftEye = createOpticEye(-0.088);
  const rightEye = createOpticEye(0.088);

  // 5 & 6. Two Detached Floating Spherical Hands (no arms or sleeves!)
  const createFloatingHand = (side: -1 | 1) => {
    const handGroup = new THREE.Group();
    handGroup.position.set(side * 0.46, 0.06, 0.08);

    const handSphere = new THREE.Mesh(new THREE.SphereGeometry(0.118, 22, 16), suitWhite);
    handSphere.castShadow = true;
    handGroup.add(handSphere);

    // Subtle dark rubberized palm/cuff ring for material contrast
    const handBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.115, 0.012, 8, 22),
      jointMat,
    );
    handBand.rotation.x = Math.PI / 2;
    handGroup.add(handBand);

    // Glowing role-accent micro-repulsor dot on outer side
    const handDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 10, 8),
      visorTrimMat,
    );
    handDot.position.set(side * 0.106, 0, 0.02);
    handGroup.add(handDot);

    torsoGroup.add(handGroup);
    return handGroup;
  };

  const leftHand = createFloatingHand(-1);
  const rightHand = createFloatingHand(1);

  // Floating Role Prop hovering cleanly beside the character's right flank
  const floatingPropAnchor = new THREE.Group();
  floatingPropAnchor.position.set(0.86, 1.18, 0.18);
  group.add(floatingPropAnchor);

  const propHoloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.01, 6, 28),
    visorTrimMat,
  );
  propHoloRing.rotation.x = Math.PI / 2;
  propHoloRing.position.y = -0.28;
  floatingPropAnchor.add(propHoloRing);

  const roleProps: Record<RoleId, THREE.Group> = {
    systems: buildThrusterWrenchProp(mats),
    finance: buildEncryptedBriefcaseProp(mats),
    science: buildSampleCanisterProp(mats),
    pilot: buildFlightTabletProp(mats),
  };

  Object.values(roleProps).forEach((prop) => {
    prop.visible = false;
    floatingPropAnchor.add(prop);
  });
  roleProps.systems.visible = true;

  let currentRole: RoleId = 'systems';
  let propPopScale = 1;
  let gazeTimer = 0;
  let gazeTargetYaw = 0;
  let gazeTargetPitch = 0;

  function setRole(roleId: RoleId) {
    if (roleId === currentRole) return;
    currentRole = roleId;
    (Object.keys(roleProps) as RoleId[]).forEach((rId) => {
      roleProps[rId].visible = rId === roleId;
    });
    propPopScale = 0.55;
  }

  function update(elapsed: number, delta: number, visible: boolean) {
    group.visible = visible;
    if (!visible) return;

    const theme = ROLE_THEMES[currentRole];
    const colorAlpha = 1 - Math.exp(-10 * delta);

    _targetAccentColor.setHex(theme.accentHex);
    _targetPackColor.setHex(theme.packHex);
    _targetVisorColor.setHex(theme.visorHex);
    _targetEyeColor.setHex(theme.eyeHex);

    rolePackMat.color.lerp(_targetPackColor, colorAlpha);
    roleAccentMat.color.lerp(_targetAccentColor, colorAlpha);
    roleAccentMat.emissive.lerp(_targetAccentColor, colorAlpha);
    visorTrimMat.color.lerp(_targetVisorColor, colorAlpha);
    visorTrimMat.emissive.lerp(_targetVisorColor, colorAlpha);
    eyeGlowMat.color.lerp(_targetEyeColor, colorAlpha);
    eyeGlowMat.emissive.lerp(_targetVisorColor, colorAlpha);

    // Smooth anti-gravity hover breathing on detached oval torso & floating spherical hands
    torsoGroup.position.y = 0.82 + Math.sin(elapsed * 2.1) * 0.022;
    leftHand.position.y = 0.06 + Math.sin(elapsed * 2.5 + 0.6) * 0.036;
    leftHand.position.z = 0.08 + Math.cos(elapsed * 1.7) * 0.018;
    rightHand.position.y = 0.06 + Math.cos(elapsed * 2.3 + 0.4) * 0.038;
    rightHand.position.z = 0.08 + Math.sin(elapsed * 1.8) * 0.02;

    // Subtle weight-shift on grounded oval feet
    footGroups[0].rotation.z = Math.sin(elapsed * 1.5) * 0.02;
    footGroups[1].rotation.z = -Math.sin(elapsed * 1.5) * 0.02;

    // Curious look-around gaze targets changing every ~2.6s
    gazeTimer += delta;
    if (gazeTimer >= 2.6) {
      gazeTimer = 0;
      const cycle = Math.floor(elapsed * 0.45) % 5;
      if (cycle === 0) {
        gazeTargetYaw = 0.34;
        gazeTargetPitch = 0.06;
      } else if (cycle === 1) {
        gazeTargetYaw = -0.28;
        gazeTargetPitch = 0.04;
      } else if (cycle === 2) {
        gazeTargetYaw = 0.22; // glancing toward floating role prop
        gazeTargetPitch = -0.08;
      } else if (cycle === 3) {
        gazeTargetYaw = 0.0;
        gazeTargetPitch = 0.02;
      } else {
        gazeTargetYaw = -0.18;
        gazeTargetPitch = 0.1;
      }
    }

    headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, gazeTargetYaw, 4.5, delta);
    headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, -gazeTargetPitch, 4.5, delta);
    headGroup.rotation.z = THREE.MathUtils.damp(
      headGroup.rotation.z,
      -gazeTargetYaw * 0.18,
      4.0,
      delta,
    );

    const pupilShiftX = THREE.MathUtils.clamp(gazeTargetYaw * 0.04, -0.02, 0.02);
    const pupilShiftY = THREE.MathUtils.clamp(gazeTargetPitch * 0.04, -0.015, 0.015);
    leftEye.eyePivot.position.x = THREE.MathUtils.damp(
      leftEye.eyePivot.position.x,
      -0.088 + pupilShiftX,
      9,
      delta,
    );
    rightEye.eyePivot.position.x = THREE.MathUtils.damp(
      rightEye.eyePivot.position.x,
      0.088 + pupilShiftX,
      9,
      delta,
    );
    leftEye.eyePivot.position.y = THREE.MathUtils.damp(
      leftEye.eyePivot.position.y,
      0.01 + pupilShiftY,
      9,
      delta,
    );
    rightEye.eyePivot.position.y = THREE.MathUtils.damp(
      rightEye.eyePivot.position.y,
      0.01 + pupilShiftY,
      9,
      delta,
    );

    // Expressive natural blinking (~3.4s cycle + occasional quick double-blink)
    const blinkCycle = elapsed % 3.4;
    const isBlinking =
      blinkCycle > 3.22 || (blinkCycle > 2.86 && blinkCycle < 2.98 && Math.floor(elapsed / 3.4) % 3 === 1);
    const targetLidScaleY = isBlinking ? 1.18 : 0.06;
    leftEye.eyelid.scale.y = THREE.MathUtils.damp(leftEye.eyelid.scale.y, targetLidScaleY, 28, delta);
    rightEye.eyelid.scale.y = THREE.MathUtils.damp(rightEye.eyelid.scale.y, targetLidScaleY, 28, delta);

    // Floating role prop smooth levitation, spin & role-swap pop animation
    propPopScale = THREE.MathUtils.damp(propPopScale, 1, 10, delta);
    floatingPropAnchor.scale.setScalar(propPopScale);
    floatingPropAnchor.position.y = 1.18 + Math.sin(elapsed * 2.2) * 0.075;
    propHoloRing.rotation.z = elapsed * 0.9;

    const activeProp = roleProps[currentRole];
    activeProp.rotation.y = Math.sin(elapsed * 0.9) * 0.35 + elapsed * 0.38;
  }

  return {
    group,
    setRole,
    update,
  };
}

export interface SeatedDeskWorkerRig {
  group: THREE.Group;
  update: (elapsed: number, delta: number, mode: 'typing' | 'mouse') => void;
  getMouseOffset: (out: { x: number; z: number }) => void;
}

export function buildSeatedDeskWorker(
  mats: SpaceMaterialLibrary,
  roleId: 'pilot' | 'systems',
): SeatedDeskWorkerRig {
  const theme = ROLE_THEMES[roleId];
  const group = new THREE.Group();
  group.name = `SeatedWorker_${roleId}`;

  const suitWhite = mats.hullWhite;
  const jointMat = mats.repoJointRubber;

  const rolePackMat = new THREE.MeshStandardMaterial({
    color: theme.packHex,
    roughness: 0.42,
    metalness: 0.28,
  });

  const roleAccentMat = new THREE.MeshStandardMaterial({
    color: theme.accentHex,
    emissive: new THREE.Color(theme.accentHex),
    emissiveIntensity: 0.58,
    roughness: 0.28,
    metalness: 0.35,
  });

  const visorTrimMat = new THREE.MeshStandardMaterial({
    color: theme.visorHex,
    emissive: new THREE.Color(theme.visorHex),
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.25,
  });

  const eyeGlowMat = new THREE.MeshStandardMaterial({
    color: theme.eyeHex,
    emissive: new THREE.Color(theme.visorHex),
    emissiveIntensity: 1.55,
    roughness: 0.12,
  });

  // 1 & 2. Two Detached Horizontal Oval Feet tucked neatly under desk on floor
  for (const side of [-1, 1]) {
    const footGroup = new THREE.Group();
    footGroup.position.set(side * 0.21, 0.084, 0.24);
    footGroup.rotation.y = side * -0.26;

    const footShell = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), suitWhite);
    footShell.scale.set(0.165, 0.08, 0.12);
    footShell.castShadow = true;
    footGroup.add(footShell);

    const solePad = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), jointMat);
    solePad.scale.set(0.158, 0.03, 0.112);
    solePad.position.y = -0.052;
    footGroup.add(solePad);

    const footTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.01, 6, 22),
      roleAccentMat,
    );
    footTrim.rotation.x = Math.PI / 2;
    footTrim.scale.set(1.0, 0.72, 1.0);
    footTrim.position.y = -0.02;
    footGroup.add(footTrim);

    group.add(footGroup);
  }

  // 3. Detached Vertical Oval Torso seated cleanly above chair cushion (no backrest clipping)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.96, 0);
  torsoGroup.rotation.x = 0.08; // slight natural forward lean toward desk
  group.add(torsoGroup);

  const torsoBody = new THREE.Mesh(new THREE.SphereGeometry(1, 26, 20), suitWhite);
  torsoBody.scale.set(0.25, 0.39, 0.215);
  torsoBody.castShadow = true;
  torsoGroup.add(torsoBody);

  const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 8, 24), jointMat);
  waistRing.rotation.x = Math.PI / 2;
  waistRing.scale.set(1.0, 0.88, 1.0);
  waistRing.position.y = -0.13;
  torsoGroup.add(waistRing);

  const roleBelt = new THREE.Mesh(new THREE.TorusGeometry(0.246, 0.012, 6, 24), roleAccentMat);
  roleBelt.rotation.x = Math.PI / 2;
  roleBelt.scale.set(1.0, 0.88, 1.0);
  roleBelt.position.y = -0.085;
  torsoGroup.add(roleBelt);

  const chestPlate = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.035, 0.12, 4, 8),
    visorTrimMat,
  );
  chestPlate.rotation.z = Math.PI / 2;
  chestPlate.position.set(0, 0.09, 0.205);
  torsoGroup.add(chestPlate);

  // Sleek low-profile rear pack (clean clearance from chair backrest)
  const packShape = makeRoundedRectShape(0.26, 0.32, 0.075);
  const packGeo = new THREE.ExtrudeGeometry(packShape, {
    depth: 0.085,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 2,
  });
  packGeo.center();
  const packMesh = new THREE.Mesh(packGeo, rolePackMat);
  packMesh.position.set(0, 0.03, -0.2);
  packMesh.castShadow = true;
  torsoGroup.add(packMesh);

  const packLedBar = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.02, 0.19, 4, 8),
    visorTrimMat,
  );
  packLedBar.position.set(0, 0.03, -0.26);
  torsoGroup.add(packLedBar);

  // 4. Detached Floating Round Head rising cleanly above chair headrest
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0.03);
  torsoGroup.add(headGroup);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.238, 24, 18), suitWhite);
  helmet.scale.set(1.02, 0.98, 1.0);
  helmet.castShadow = true;
  headGroup.add(helmet);

  for (const side of [-1, 1]) {
    const earCan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.068, 0.03, 14),
      roleAccentMat,
    );
    earCan.rotation.z = Math.PI / 2;
    earCan.position.set(side * 0.236, 0, 0);
    headGroup.add(earCan);
  }

  const visorGlass = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.222,
      18,
      12,
      -Math.PI * 0.42,
      Math.PI * 0.84,
      Math.PI * 0.23,
      Math.PI * 0.48,
    ),
    mats.repoVisorGlass,
  );
  visorGlass.position.z = 0.034;
  headGroup.add(visorGlass);

  const visorRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.192, 0.011, 8, 24),
    visorTrimMat,
  );
  visorRim.position.set(0, 0.01, 0.14);
  visorRim.scale.set(1.06, 0.68, 1);
  headGroup.add(visorRim);

  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050811 });
  const eyelidMat = mats.repoVisorGlass;

  const createEye = (xOffset: number) => {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(xOffset, 0.01, 0.228);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), eyeGlowMat);
    sclera.scale.set(0.95, 1.08, 0.52);
    eyePivot.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), pupilMat);
    pupil.position.set(0, 0, 0.024);
    pupil.scale.set(1, 1.05, 0.48);
    eyePivot.add(pupil);

    const eyelid = new THREE.Mesh(new THREE.SphereGeometry(0.057, 10, 8), eyelidMat);
    eyelid.scale.set(1.02, 0.06, 0.6);
    eyelid.position.set(0, 0.048, 0.006);
    eyePivot.add(eyelid);

    headGroup.add(eyePivot);
    return { eyePivot, eyelid };
  };

  const leftEye = createEye(-0.084);
  const rightEye = createEye(0.084);

  // 5 & 6. Two Detached Floating Spherical Hands positioned in worker.group space
  const createFloatingHand = (side: -1 | 1) => {
    const handGroup = new THREE.Group();
    const handSphere = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 14), suitWhite);
    handSphere.castShadow = true;
    handGroup.add(handSphere);

    const handBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.103, 0.011, 8, 20),
      jointMat,
    );
    handBand.rotation.x = Math.PI / 2;
    handGroup.add(handBand);

    const handDot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), visorTrimMat);
    handDot.position.set(side * 0.096, 0.015, 0);
    handGroup.add(handDot);

    group.add(handGroup);
    return handGroup;
  };

  // Note: worker.group is rotated Math.PI around Y inside pcDesk:
  // local +X = character's left (pcDesk -X); local -X = character's right (pcDesk +X)
  const charLeftHand = createFloatingHand(1);
  const charRightHand = createFloatingHand(-1);

  let mouseOffsetX = 0;
  let mouseOffsetZ = 0;

  function getMouseOffset(out: { x: number; z: number }) {
    out.x = mouseOffsetX;
    out.z = mouseOffsetZ;
  }

  function update(elapsed: number, delta: number, mode: 'typing' | 'mouse') {
    torsoGroup.position.y = 0.96 + Math.sin(elapsed * 2.2) * 0.014;

    if (mode === 'typing') {
      mouseOffsetX = 0;
      mouseOffsetZ = 0;

      // Rapid alternating keystroke taps over the keyboard (pcDesk z = -0.14 => localZ = 0.76)
      const tapL = Math.max(0, Math.sin(elapsed * 18.5));
      const tapR = Math.max(0, Math.sin(elapsed * 18.5 + 2.55));
      const sweepL = Math.sin(elapsed * 2.7) * 0.065;
      const sweepR = Math.cos(elapsed * 3.1) * 0.065;
      const reachZ = 0.73 + Math.sin(elapsed * 4.2) * 0.022;

      charLeftHand.position.set(
        0.155 + sweepL,
        0.955 - tapL * 0.032,
        reachZ,
      );
      charLeftHand.rotation.x = 0.25 + tapL * 0.35;

      charRightHand.position.set(
        -0.155 + sweepR,
        0.955 - tapR * 0.032,
        0.73 + Math.cos(elapsed * 4.5) * 0.022,
      );
      charRightHand.rotation.x = 0.25 + tapR * 0.35;

      // Focused head glancing smoothly between left monitor, keyboard, and right monitor
      const targetYaw = Math.sin(elapsed * 1.15) * 0.24;
      const targetPitch = -0.16 + Math.sin(elapsed * 2.6) * 0.04;
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, targetYaw, 5.5, delta);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, -targetPitch, 5.5, delta);
      headGroup.rotation.z = THREE.MathUtils.damp(headGroup.rotation.z, -targetYaw * 0.14, 5, delta);
    } else {
      // Smooth CAD/engineering mouse sweeping on right side of desk (pcDesk x = +0.40, z = -0.12)
      mouseOffsetX = Math.sin(elapsed * 2.15) * 0.09 + Math.sin(elapsed * 4.4) * 0.024;
      mouseOffsetZ = Math.cos(elapsed * 1.65) * 0.052;

      // Character's right hand (local -X) tracks right on top of the 3D mouse!
      charRightHand.position.set(
        -0.40 - mouseOffsetX,
        0.942 + Math.sin(elapsed * 3.6) * 0.008,
        0.74 - mouseOffsetZ,
      );
      charRightHand.rotation.x = 0.2;
      charRightHand.rotation.z = -mouseOffsetX * 1.1;

      // Character's left hand rests calmly near left edge of keyboard
      charLeftHand.position.set(
        0.24 + Math.sin(elapsed * 1.3) * 0.012,
        0.955 + Math.sin(elapsed * 2.2) * 0.014,
        0.67,
      );
      charLeftHand.rotation.x = 0.15;

      // Head follows pointer motion across dual orange CAD monitors
      const targetYaw = -0.12 + mouseOffsetX * 1.6;
      const targetPitch = -0.09 + mouseOffsetZ * 0.6;
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, targetYaw, 5.5, delta);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, -targetPitch, 5.5, delta);
      headGroup.rotation.z = THREE.MathUtils.damp(headGroup.rotation.z, -targetYaw * 0.12, 5, delta);
    }

    // Natural eye blinking
    const blinkCycle = elapsed % 3.6;
    const isBlinking = blinkCycle > 3.42;
    const targetLidScaleY = isBlinking ? 1.16 : 0.06;
    leftEye.eyelid.scale.y = THREE.MathUtils.damp(leftEye.eyelid.scale.y, targetLidScaleY, 26, delta);
    rightEye.eyelid.scale.y = THREE.MathUtils.damp(rightEye.eyelid.scale.y, targetLidScaleY, 26, delta);
  }

  return {
    group,
    update,
    getMouseOffset,
  };
}
