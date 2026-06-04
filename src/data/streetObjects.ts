import type { InteractableObjectData } from '@/types'

// ── Street interactable objects ────────────────────────────────────────────
// The apartment entrance lets the player return home from the street.
// position y=1 = vertical centre of a 2 m door (same convention as apartment_door).

export const streetObjects: InteractableObjectData[] = [
  {
    id: 'home_entrance',
    name: 'Your Building',
    // On the east sidewalk, flush against kb_e_tower_c west face (x≈11.5)
    // rotation=-π/2 turns the south-facing door to face west (toward the road)
    position: [11, 1, -3],
    rotation: -Math.PI / 2,
    color: '#7B5E3A',
    size: [1, 2, 0.12],
    dialogueTreeId: 'home_entrance',
    modelPath: '/assets/models/buildings/door-brown.glb',
  },
]
