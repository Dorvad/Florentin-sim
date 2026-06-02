import type { NPCData } from '@/types'

// ── NPC definitions ────────────────────────────────────────────────────────
// position: [x, y, z] in world units. y=0 is ground level.
// color: fallback placeholder colour if modelPath is absent.
// modelPath: public-folder path to the character's .glb asset.

export const npcData: NPCData[] = [
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
    dialogueTreeId: 'dana_intro', // reusing as placeholder until Moshe has dialogue
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
  // TODO: Add more NPCs here (shopkeepers, friends, strangers, etc.)
]
