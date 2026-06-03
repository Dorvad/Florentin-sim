// Axis-aligned collision resolution in the XZ plane.
// All coordinates in world units (metres). Player is modelled as a circle.

const PLAYER_RADIUS = 0.4

interface Box { cx: number; cz: number; hw: number; hd: number }
interface Circle { cx: number; cz: number; r: number }

// ── Static colliders ──────────────────────────────────────────────────────

const BOXES: Box[] = [
  // ── Real GLB buildings (size[] / 2 = half-extents) ─────────────────────
  { cx: -18, cz: -14, hw: 6.25, hd: 7.25 }, // building_w_small
  { cx:  20, cz: -26, hw: 7.5,  hd: 6.5  }, // building_e_medium
  { cx: -22, cz: -38, hw: 12,   hd: 10   }, // building_w_large

  // ── Kenney modular buildings (approximate at scale=9–10) ────────────────
  { cx:  16, cz:  -5, hw: 4.5, hd: 4.5 }, // kb_e_tower_c
  { cx:  16, cz: -17, hw: 5.0, hd: 4.0 }, // kb_e_house_b
  { cx:  16, cz: -38, hw: 4.5, hd: 4.5 }, // kb_e_tower_a
  { cx: -13, cz:  -2, hw: 4.5, hd: 4.5 }, // kb_w_tower_d
  { cx: -16, cz: -27, hw: 5.0, hd: 5.0 }, // kb_w_tower_b

  // ── Parked cars – east curb (x ≈ +4.5) ─────────────────────────────────
  { cx:  4.5, cz:  -1, hw: 0.75, hd: 1.28 }, // car_e_sedan
  { cx:  4.5, cz: -16, hw: 0.75, hd: 1.28 }, // car_e_taxi
  { cx:  4.5, cz: -30, hw: 0.90, hd: 1.75 }, // car_e_van

  // ── Parked cars – west curb (x ≈ -4.5) ─────────────────────────────────
  { cx: -4.5, cz: -13, hw: 0.70, hd: 1.00 }, // car_w_hatch
  { cx: -4.5, cz: -22, hw: 0.75, hd: 1.10 }, // car_w_sport
  { cx: -4.5, cz: -36, hw: 0.80, hd: 1.25 }, // car_w_suv
]

const CIRCLES: Circle[] = [
  // NPCs — radius covers roughly one character width
  { cx:  3, cz:  2,  r: 0.45 }, // Moti
  { cx:  4, cz: -6,  r: 0.45 }, // Avi
  { cx: -5, cz: -3,  r: 0.45 }, // Dana
  { cx:  8, cz: -3,  r: 0.45 }, // Moshe
  { cx: -3, cz: -10, r: 0.45 }, // Noa
]

// ── Resolution helpers ────────────────────────────────────────────────────

function resolveBox(px: number, pz: number, b: Box): [number, number] {
  const nearX = Math.max(b.cx - b.hw, Math.min(b.cx + b.hw, px))
  const nearZ = Math.max(b.cz - b.hd, Math.min(b.cz + b.hd, pz))
  const dx = px - nearX
  const dz = pz - nearZ
  const d = Math.sqrt(dx * dx + dz * dz)
  if (d >= PLAYER_RADIUS || d === 0) return [px, pz]
  const push = PLAYER_RADIUS - d
  return [px + (dx / d) * push, pz + (dz / d) * push]
}

function resolveCircle(px: number, pz: number, c: Circle): [number, number] {
  const dx = px - c.cx
  const dz = pz - c.cz
  const d = Math.sqrt(dx * dx + dz * dz)
  const minD = PLAYER_RADIUS + c.r
  if (d >= minD || d === 0) return [px, pz]
  const push = minD - d
  return [px + (dx / d) * push, pz + (dz / d) * push]
}

// ── Public API ────────────────────────────────────────────────────────────

export function resolveCollisions(px: number, pz: number): [number, number] {
  let x = px
  let z = pz
  for (const b of BOXES)    [x, z] = resolveBox(x, z, b)
  for (const c of CIRCLES)  [x, z] = resolveCircle(x, z, c)
  return [x, z]
}
