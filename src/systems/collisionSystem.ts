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

  // ── Parked cars – east curb (x ≈ +4.5, rotated to face road) ───────────
  { cx:  4.5, cz:  -4, hw: 1.28, hd: 0.75 }, // car_e_sedan
  { cx:  4.5, cz: -16, hw: 1.28, hd: 0.75 }, // car_e_taxi
  { cx:  4.5, cz: -28, hw: 1.75, hd: 0.90 }, // car_e_van

  // ── Parked cars – west curb (x ≈ -4.5, rotated to face road) ────────────
  { cx: -4.5, cz:  -8, hw: 1.00, hd: 0.70 }, // car_w_hatch
  { cx: -4.5, cz: -20, hw: 1.10, hd: 0.75 }, // car_w_sport
  { cx: -4.5, cz: -36, hw: 1.25, hd: 0.80 }, // car_w_suv

  // ── New south terminus building ─────────────────────────────────────────
  { cx: 16, cz: -50, hw: 4.5, hd: 4.5 },   // kb_e_house_a
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

// ── Apartment collision ────────────────────────────────────────────────────
// Room: x∈[-4,+4], z∈[-4,+4]. North and east walls are rendered (0.12 thick).
// West wall is rendered too (added for visual closure). South is open for camera.

const APARTMENT_FURNITURE: Box[] = [
  { cx: -2.5, cz: -2.0, hw: 0.33, hd: 0.33 }, // fridge (0.65×0.65)
  { cx:  0.0, cz:  2.0, hw: 1.0,  hd: 0.6  }, // mattress (2×1.2)
  { cx: -2.0, cz:  0.8, hw: 0.4,  hd: 0.4  }, // work table (approx)
]

export function resolveApartmentCollisions(px: number, pz: number): [number, number] {
  // Wall inner faces: north z=-3.94, east x=3.94, west x=-3.94; south open (soft)
  // Clamp adds player radius (0.4) margin from each face
  let x = Math.max(-3.54, Math.min(3.54, px))
  let z = Math.max(-3.54, Math.min(3.6, pz))
  for (const b of APARTMENT_FURNITURE) [x, z] = resolveBox(x, z, b)
  return [x, z]
}
