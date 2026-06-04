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

// Street tiles replaced with flat pavement geometry in RoadSurface.tsx
export const streetTiles: StreetTileData[] = []

// ── Street props (parked cars + furniture) ─────────────────────────────────
// Cars: Kenney Car Kit, scale 1 (geometry already in metres).
//   sedan ≈ 1.5 × 1.15 × 2.55 m   — placed at y=0, cars sit flush on ground.
// Retro-urban props: Kenney Retro Urban Kit, scale multipliers applied to
//   compensate for the smaller geometry (bench ≈0.4 m tall before scaling).
// East sidewalk: x≈+4.5 curb / x≈+7 sidewalk
// West sidewalk: x≈-4.5 curb / x≈-7 sidewalk
// NPC-clear zones: Avi [4,-6], Dana [-5,-3], Noa [-3,-10]

export const streetProps: StreetPropData[] = [
  // ── Parked cars – east curb (x=4.5, facing road) ────────────────────────
  { id: 'car_e_sedan',   modelPath: '/assets/models/car_sedan.glb',       position: [4.5, 0,  -4],  rotation: -Math.PI / 2 },
  { id: 'car_e_taxi',    modelPath: '/assets/models/car_taxi.glb',         position: [4.5, 0, -16], rotation: -Math.PI / 2 },
  { id: 'car_e_van',     modelPath: '/assets/models/car_van.glb',          position: [4.5, 0, -28], rotation: -Math.PI / 2 },

  // ── Parked cars – west curb (x=-4.5, facing road) ────────────────────────
  { id: 'car_w_hatch',   modelPath: '/assets/models/car_hatchback.glb',    position: [-4.5, 0,  -8], rotation:  Math.PI / 2 },
  { id: 'car_w_sport',   modelPath: '/assets/models/car_sedan_sports.glb', position: [-4.5, 0, -20], rotation:  Math.PI / 2 },
  { id: 'car_w_suv',     modelPath: '/assets/models/car_suv.glb',          position: [-4.5, 0, -36], rotation:  Math.PI / 2 },

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
  // Real-metre bench on east sidewalk near the building entrance
  { id: 'bench_e_new', modelPath: '/assets/models/furniture/Bench.glb', position: [8.0, 0, -1.0], rotation: -Math.PI / 2, scale: 1 },

  // ── Trees ─────────────────────────────────────────────────────────────────
  { id: 'tree_e_0', modelPath: '/assets/models/retro/tree-large.glb', position: [7.8, 0, -11], scale: 3 },
  { id: 'tree_e_1', modelPath: '/assets/models/retro/tree-large.glb', position: [7.8, 0, -28], scale: 3 },
  { id: 'tree_w_0', modelPath: '/assets/models/retro/tree-large.glb', position: [-7.8, 0,  -5], scale: 3 },
  { id: 'tree_w_1', modelPath: '/assets/models/retro/tree-small.glb', position: [-7.8, 0, -28], scale: 4 },

  // ── Dumpsters (corner / alley vibes) ─────────────────────────────────────
  { id: 'dump_e_0', modelPath: '/assets/models/retro/detail-dumpster-closed.glb', position: [7.5, 0, -21], scale: 1.8 },
  { id: 'dump_w_0', modelPath: '/assets/models/retro/detail-dumpster-closed.glb', position: [-7.5, 0, -33], rotation: Math.PI, scale: 1.8 },

  // ── Kenney Modular Buildings — east side ──────────────────────────────────
  // scale=10 → ~11 m footprint; rot=π turns the façade to face the street west.
  { id: 'kb_e_tower_c', modelPath: '/assets/models/buildings/building-sample-tower-c.glb', position: [16, 0, -5],  rotation: Math.PI, scale: 10 },
  { id: 'kb_e_house_b', modelPath: '/assets/models/buildings/building-sample-house-b.glb', position: [16, 0, -17], rotation: Math.PI, scale: 10 },
  { id: 'kb_e_tower_a', modelPath: '/assets/models/buildings/building-sample-tower-a.glb', position: [16, 0, -38], rotation: Math.PI, scale: 9  },

  // ── Kenney Modular Buildings — west side ──────────────────────────────────
  { id: 'kb_w_tower_d', modelPath: '/assets/models/buildings/building-sample-tower-d.glb', position: [-13, 0, -2],  scale: 9  },
  { id: 'kb_w_tower_b', modelPath: '/assets/models/buildings/building-sample-tower-b.glb', position: [-16, 0, -27], scale: 10 },

  // ── South terminus — closes the street visually ───────────────────────────
  { id: 'kb_e_house_a', modelPath: '/assets/models/buildings/building-sample-house-a.glb', position: [16, 0, -50], rotation: Math.PI, scale: 10 },

  // ── Background skyline — east (deeper x, peeks above street-side row) ──────
  { id: 'kb_bg_e1', modelPath: '/assets/models/buildings/building-sample-tower-b.glb', position: [27, 0,  -8], scale: 14 },
  { id: 'kb_bg_e2', modelPath: '/assets/models/buildings/building-sample-house-c.glb', position: [27, 0, -34], rotation: Math.PI, scale: 10 },

  // ── Background skyline — west ─────────────────────────────────────────────
  { id: 'kb_bg_w1', modelPath: '/assets/models/buildings/building-sample-tower-c.glb', position: [-28, 0,  -8], rotation: Math.PI, scale: 14 },
  { id: 'kb_bg_w2', modelPath: '/assets/models/buildings/building-sample-house-a.glb', position: [-28, 0, -52], scale: 10 },

  // ── Cross-street backdrop — visible down the 4-way intersection ───────────
  { id: 'kb_xst_e', modelPath: '/assets/models/buildings/building-sample-tower-d.glb', position: [32, 0, -12], scale: 10 },
  { id: 'kb_xst_w', modelPath: '/assets/models/buildings/building-sample-house-c.glb', position: [-32, 0, -13], rotation: Math.PI, scale: 9 },

  // ── Rooftop AC units (heights = native_y × scale) ─────────────────────────
  // kb_e_tower_c (scale=10, native h=3.138 → roof y=31.4)
  { id: 'ac_e_tc_1', modelPath: '/assets/models/retro/detail-ac-a.glb', position: [14.8, 31.4, -4.2], scale: 8 },
  { id: 'ac_e_tc_2', modelPath: '/assets/models/retro/detail-ac-b.glb', position: [17.0, 31.4, -5.8], scale: 8 },
  // kb_w_tower_d (scale=9, native h=3.763 → roof y=33.9)
  { id: 'ac_w_td_1', modelPath: '/assets/models/retro/detail-ac-a.glb', position: [-11.8, 33.9, -1.5], scale: 8 },
  { id: 'ac_w_td_2', modelPath: '/assets/models/retro/detail-ac-b.glb', position: [-14.2, 33.9, -2.8], scale: 8 },
  // kb_w_tower_b (scale=10, native h=1.888 → roof y=18.9)
  { id: 'ac_w_tb_1', modelPath: '/assets/models/retro/detail-ac-a.glb', position: [-15.5, 18.9, -26.5], scale: 7 },

  // ── Nature — east sidewalk outer edge (x≈9.5–10.5) ───────────────────────
  // Trees: CommonTree ~7.6 m native → scale 1
  { id: 'nat_tree_e_0', modelPath: '/assets/models/nature/CommonTree_2.glb', position: [10.0, 0,   1.5], scale: 1   },
  { id: 'nat_tree_e_1', modelPath: '/assets/models/nature/CommonTree_2.glb', position: [10.2, 0, -20.0], scale: 1   },
  // Bushes: Bush_Common ~1.6 m native → scale 0.8 ≈ 1.25 m
  { id: 'nat_bush_e_0', modelPath: '/assets/models/nature/Bush_Common_Flowers.glb', position: [10.0, 0,  -7.5], scale: 0.8 },
  { id: 'nat_bush_e_1', modelPath: '/assets/models/nature/Bush_Common.glb',         position: [10.2, 0, -33.0], scale: 0.8 },
  // Flower cluster: ~2 m native → scale 0.35 ≈ 0.7 m compact patch
  { id: 'nat_flower_e_0', modelPath: '/assets/models/nature/Flower_3_Group.glb', position: [10.6, 0, -12.5], scale: 0.35 },
  // Rock near south end
  { id: 'nat_rock_e_0', modelPath: '/assets/models/nature/Rock_Medium_1.glb', position: [10.8, 0, -47.0], scale: 0.35 },

  // ── Nature — west sidewalk outer edge (x≈-9.5 to -10.5) ─────────────────
  { id: 'nat_tree_w_0', modelPath: '/assets/models/nature/Pine_1.glb',          position: [-10.0, 0,  -6.0], scale: 1   },
  { id: 'nat_tree_w_1', modelPath: '/assets/models/nature/CommonTree_3.glb',     position: [-10.2, 0, -28.0], scale: 1   },
  { id: 'nat_bush_w_0', modelPath: '/assets/models/nature/Bush_Common.glb',         position: [-10.0, 0,  -0.5], scale: 0.8 },
  { id: 'nat_bush_w_1', modelPath: '/assets/models/nature/Bush_Common_Flowers.glb', position: [-10.2, 0, -20.0], scale: 0.8 },
  { id: 'nat_flower_w_0', modelPath: '/assets/models/nature/Flower_3_Group.glb', position: [-10.6, 0, -14.0], scale: 0.35 },
  { id: 'nat_rock_w_0', modelPath: '/assets/models/nature/Rock_Medium_2.glb', position: [-10.8, 0, -42.0], scale: 0.35 },
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

]
