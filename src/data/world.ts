import type { BuildingData, StreetPropData, StreetTileData } from '@/types'

// ── World layout ───────────────────────────────────────────────────────────
// All coordinates are in world units (metres). Ground plane is at y=0.
// Placeholder buildings use position.y = size[1] / 2 (mesh centre).
// GLB buildings sit at y=0 — their geometry already starts at the origin.
//
// Main street: north-south along X=0, 6 m wide (curbs at X = ±3).
// Sidewalks at X = ±6 (1.5 m wide each side).
//
// NPC positions (do not place buildings over these):
//   Avi   [4, 0, -6]   Dana  [-5, 0, -3]
//   Moshe [8, 0, -3]   Noa   [-3, 0, -10]
// Player starts at [0, 0, 0].

export const GROUND_SIZE = 120

// ── Street tiles ───────────────────────────────────────────────────────────

export const streetTiles: StreetTileData[] = [
  // Main street – north-south 2-lane, 4 tiles
  { id: 'street_ns_0',  modelPath: '/assets/models/street_2lane.glb', position: [0, 0,  0] },
  { id: 'street_ns_1',  modelPath: '/assets/models/street_2lane.glb', position: [0, 0, -12] },
  { id: 'street_ns_2',  modelPath: '/assets/models/street_2lane.glb', position: [0, 0, -24] },
  { id: 'street_ns_3',  modelPath: '/assets/models/street_2lane.glb', position: [0, 0, -36] },

  // T-intersection at Z=-12 (4-way for now, rotated 180° to face south)
  { id: 'street_4way',  modelPath: '/assets/models/street_4way.glb',  position: [0, 0, -12], rotation: Math.PI },

  // Sidewalks – east side (X = 6)
  { id: 'sw_e_0', modelPath: '/assets/models/sidewalk_straight.glb', position: [6, 0,  -6] },
  { id: 'sw_e_1', modelPath: '/assets/models/sidewalk_straight.glb', position: [6, 0, -18] },
  { id: 'sw_e_2', modelPath: '/assets/models/sidewalk_straight.glb', position: [6, 0, -30] },
  { id: 'sw_e_3', modelPath: '/assets/models/sidewalk_straight.glb', position: [6, 0, -42] },

  // Sidewalks – west side (X = -6)
  { id: 'sw_w_0', modelPath: '/assets/models/sidewalk_straight.glb', position: [-6, 0,  -6], rotation: Math.PI },
  { id: 'sw_w_1', modelPath: '/assets/models/sidewalk_straight.glb', position: [-6, 0, -18], rotation: Math.PI },
  { id: 'sw_w_2', modelPath: '/assets/models/sidewalk_straight.glb', position: [-6, 0, -30], rotation: Math.PI },
  { id: 'sw_w_3', modelPath: '/assets/models/sidewalk_straight.glb', position: [-6, 0, -42], rotation: Math.PI },

  // Planters scattered along sidewalks
  { id: 'planter_e_0', modelPath: '/assets/models/sidewalk_planter.glb', position: [ 8, 0,  -8] },
  { id: 'planter_e_1', modelPath: '/assets/models/sidewalk_planter.glb', position: [ 8, 0, -22] },
  { id: 'planter_w_0', modelPath: '/assets/models/sidewalk_planter.glb', position: [-8, 0, -14] },
  { id: 'planter_w_1', modelPath: '/assets/models/sidewalk_planter.glb', position: [-8, 0, -32] },
]

// ── Street props (parked cars + furniture) ─────────────────────────────────
// Cars: Kenney Car Kit, scale 1 (geometry already in metres).
//   sedan ≈ 1.5 × 1.15 × 2.55 m   — placed at y=0, cars sit flush on ground.
// Retro-urban props: Kenney Retro Urban Kit, scale multipliers applied to
//   compensate for the smaller geometry (bench ≈0.4 m tall before scaling).
// East sidewalk: x≈+4.5 curb / x≈+7 sidewalk
// West sidewalk: x≈-4.5 curb / x≈-7 sidewalk
// NPC-clear zones: Avi [4,-6], Dana [-5,-3], Noa [-3,-10]

export const streetProps: StreetPropData[] = [
  // ── Parked cars – east curb ──────────────────────────────────────────────
  { id: 'car_e_sedan',   modelPath: '/assets/models/car_sedan.glb',       position: [4.5, 0, -1],  rotation: 0 },
  { id: 'car_e_taxi',    modelPath: '/assets/models/car_taxi.glb',         position: [4.5, 0, -16], rotation: Math.PI },
  { id: 'car_e_van',     modelPath: '/assets/models/car_van.glb',          position: [4.5, 0, -30], rotation: 0 },

  // ── Parked cars – west curb ──────────────────────────────────────────────
  { id: 'car_w_hatch',   modelPath: '/assets/models/car_hatchback.glb',    position: [-4.5, 0, -13], rotation: Math.PI },
  { id: 'car_w_sport',   modelPath: '/assets/models/car_sedan_sports.glb', position: [-4.5, 0, -22], rotation: 0 },
  { id: 'car_w_suv',     modelPath: '/assets/models/car_suv.glb',          position: [-4.5, 0, -36], rotation: Math.PI },

  // ── Street lamps ─────────────────────────────────────────────────────────
  { id: 'lamp_e_0', modelPath: '/assets/models/retro/detail-light-single.glb', position: [6.8, 0,  -8], scale: 5 },
  { id: 'lamp_e_1', modelPath: '/assets/models/retro/detail-light-single.glb', position: [6.8, 0, -24], scale: 5 },
  { id: 'lamp_w_0', modelPath: '/assets/models/retro/detail-light-single.glb', position: [-6.8, 0,  -8], rotation: Math.PI, scale: 5 },
  { id: 'lamp_w_1', modelPath: '/assets/models/retro/detail-light-single.glb', position: [-6.8, 0, -24], rotation: Math.PI, scale: 5 },

  // ── Traffic lights at intersection (z=-12) ────────────────────────────────
  { id: 'tlight_e', modelPath: '/assets/models/retro/detail-light-traffic.glb', position: [3.5, 0, -11.5], scale: 4 },
  { id: 'tlight_w', modelPath: '/assets/models/retro/detail-light-traffic.glb', position: [-3.5, 0, -11.5], rotation: Math.PI, scale: 4 },

  // ── Benches ───────────────────────────────────────────────────────────────
  { id: 'bench_e_0', modelPath: '/assets/models/retro/detail-bench.glb', position: [7.0, 0,  -5],  rotation: -Math.PI / 2, scale: 1.5 },
  { id: 'bench_w_0', modelPath: '/assets/models/retro/detail-bench.glb', position: [-7.0, 0, -18], rotation:  Math.PI / 2, scale: 1.5 },

  // ── Trees ─────────────────────────────────────────────────────────────────
  { id: 'tree_e_0', modelPath: '/assets/models/retro/tree-large.glb', position: [7.8, 0, -11], scale: 3 },
  { id: 'tree_e_1', modelPath: '/assets/models/retro/tree-large.glb', position: [7.8, 0, -28], scale: 3 },
  { id: 'tree_w_0', modelPath: '/assets/models/retro/tree-large.glb', position: [-7.8, 0,  -5], scale: 3 },
  { id: 'tree_w_1', modelPath: '/assets/models/retro/tree-small.glb', position: [-7.8, 0, -28], scale: 4 },

  // ── Dumpsters (corner / alley vibes) ─────────────────────────────────────
  { id: 'dump_e_0', modelPath: '/assets/models/retro/detail-dumpster-closed.glb', position: [7.5, 0, -21], scale: 1.8 },
  { id: 'dump_w_0', modelPath: '/assets/models/retro/detail-dumpster-closed.glb', position: [-7.5, 0, -33], rotation: Math.PI, scale: 1.8 },
]

// ── Buildings ──────────────────────────────────────────────────────────────
// GLB dimensions (Three.js post-conversion):
//   building_small:  ~12.5 × 17 × 14.5 m  (local X: -7.2..5.2, Z: -12.2..2.3)
//   building_medium: ~15   × 25 × 13   m  (local X: -7.5..7.5, Z: -12.5..0.6)
//   building_large:  ~24   × 28 × 20   m

export const buildingData: BuildingData[] = [
  // ── Real GLB buildings ────────────────────────────────────────────────────

  // West side – small building near player start
  {
    id: 'building_w_small',
    position: [-18, 0, -14],
    size: [12.5, 17, 14.5],
    color: '#b0936e',
    modelPath: '/assets/models/building_small.glb',
  },

  // East side – medium building further down the street
  {
    id: 'building_e_medium',
    position: [20, 0, -26],
    size: [15, 25, 13],
    color: '#a89880',
    modelPath: '/assets/models/building_medium.glb',
    rotation: Math.PI,  // face the street
  },

  // West side – large corner block at the back
  {
    id: 'building_w_large',
    position: [-22, 0, -38],
    size: [24, 28, 20],
    color: '#9a8878',
    modelPath: '/assets/models/building_large.glb',
  },

  // ── Placeholder buildings (variety / density) ─────────────────────────────

  // Corner café – east side, near player
  {
    id: 'cafe_corner',
    position: [16, 1, -6],
    size: [4, 2, 4],
    color: '#8fbc8f',
    label: 'HaKafe',
  },

  // Falafel shop – east side
  {
    id: 'falafel_shop',
    position: [16, 1.5, -14],
    size: [4, 3, 4],
    color: '#c8a87e',
    label: 'Falafel Vital',
  },
]
