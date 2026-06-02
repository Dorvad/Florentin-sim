import type { BuildingData } from '@/types'

// ── World layout ───────────────────────────────────────────────────────────
// All coordinates are in world units. The ground plane is at y=0.
// Buildings sit on top of the ground, so position.y = size.y / 2.
// Replace color + size with a modelPath when GLB assets are ready.

export const GROUND_SIZE = 60

export const buildingData: BuildingData[] = [
  // ── Falafel place on "Vital Street" ───────────────────────────────────────
  {
    id: 'falafel_shop',
    position: [6, 1.5, -12],
    size: [4, 3, 4],
    color: '#c8a87e',
    label: 'Falafel Vital',
    // modelPath: '/assets/models/falafel_shop.glb',
  },
  // ── Apartment block ───────────────────────────────────────────────────────
  {
    id: 'apartment_a',
    position: [-8, 3, -14],
    size: [5, 6, 5],
    color: '#b0a090',
    label: 'Apt. Block',
  },
  // ── Corner café ───────────────────────────────────────────────────────────
  {
    id: 'cafe_corner',
    position: [-10, 1, -4],
    size: [4, 2, 4],
    color: '#8fbc8f',
    label: 'HaKafe',
  },
  // ── Low row of shops ──────────────────────────────────────────────────────
  {
    id: 'shop_row_1',
    position: [10, 1, -4],
    size: [6, 2, 3],
    color: '#c0a07a',
  },
  {
    id: 'shop_row_2',
    position: [10, 1, -8],
    size: [6, 2, 3],
    color: '#b8966e',
  },
  // ── Larger building at back ───────────────────────────────────────────────
  {
    id: 'back_block',
    position: [0, 4, -20],
    size: [10, 8, 5],
    color: '#9a8878',
  },
  // TODO: Expand the neighbourhood map here
]
