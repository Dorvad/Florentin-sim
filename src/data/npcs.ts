import type { NPCData } from '@/types'

// ── NPC definitions ────────────────────────────────────────────────────────
// position: [x, y, z] in world units. y=0 is ground level.
// Moti is positioned just outside the building entrance for the street scene.

export const npcData: NPCData[] = [
  {
    id: 'moti',
    name: 'Moti',
    position: [3, 0, 2],
    color: '#8B7355',
    dialogueTreeId: 'moti_intro',
    questIds: ['move_mystery_bicycle', 'clear_your_name'],
    modelPath: '/assets/models/npc_worker.glb',
    modelScale: 0.64,
  },
  {
    id: 'avi',
    name: 'Avi',
    position: [4, 0, -6],
    color: '#e07b39',
    dialogueTreeId: 'avi_intro',
    questIds: ['falafel_run'],
    modelPath: '/assets/models/npc_avi.glb',
  },
  {
    id: 'dana',
    name: 'Dana',
    position: [-5, 0, -3],
    color: '#6a9ecf',
    dialogueTreeId: 'dana_intro',
    modelPath: '/assets/models/npc_dana.glb',
  },
  {
    id: 'worker',
    name: 'Moshe',
    position: [8, 0, -3],
    color: '#c8a87e',
    dialogueTreeId: 'dana_intro',
    modelPath: '/assets/models/npc_worker.glb',
  },
  {
    id: 'punk',
    name: 'Noa',
    position: [-3, 0, -10],
    color: '#9b59b6',
    dialogueTreeId: 'dana_intro',
    modelPath: '/assets/models/npc_punk.glb',
  },
]
