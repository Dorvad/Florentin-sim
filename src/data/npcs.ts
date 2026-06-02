import type { NPCData } from '@/types'

// ── NPC definitions ────────────────────────────────────────────────────────
// position: [x, y, z] in world units. y=0 is ground level.
// color: placeholder mesh colour until GLB models are ready.
// modelPath: uncomment and set when a .glb asset exists for this character.

export const npcData: NPCData[] = [
  {
    id: 'avi',
    name: 'Avi',
    position: [4, 0, -6],
    color: '#e07b39',
    dialogueTreeId: 'avi_intro',
    questIds: ['falafel_run'],
    // modelPath: '/assets/models/avi.glb',
  },
  {
    id: 'dana',
    name: 'Dana',
    position: [-5, 0, -3],
    color: '#6a9ecf',
    dialogueTreeId: 'dana_intro',
    // modelPath: '/assets/models/dana.glb',
  },
  // TODO: Add more NPCs here (shopkeepers, friends, strangers, etc.)
]
