import type { InteractableObjectData } from '@/types'

// ── Apartment interactable objects ─────────────────────────────────────────
// Positions are relative to apartment scene origin [0,0,0].
// The door is gated behind apartmentInteracted (handled by ApartmentScene).

export const apartmentObjects: InteractableObjectData[] = [
  {
    id: 'mattress',
    name: 'Mattress',
    // y = h/2 = 0.403 so the model's y=0 sits flush on the floor
    position: [0, 0.403, 1.8],
    color: '#8B7D7B',
    size: [1.876, 0.806, 2.412],   // actual Bed_Twin1 dimensions (metres)
    dialogueTreeId: 'mattress',
    modelPath: '/assets/models/furniture/Bed_Twin1.glb',
    modelScale: 1,
  },
  {
    id: 'fridge',
    name: 'Fridge Note',
    position: [-2.5, 0.75, -2],
    color: '#B8C4BF',
    size: [0.65, 1.5, 0.65],
    dialogueTreeId: 'fridge_note',
  },
  {
    id: 'mirror',
    name: 'Mirror',
    position: [3.45, 1.2, 0],
    color: '#A8D8EA',
    size: [0.08, 1.2, 0.7],
    dialogueTreeId: 'mirror',
  },
  {
    id: 'apartment_door',
    name: 'Front Door',
    position: [0, 1, -3.45],
    color: '#7B5E3A',
    size: [1, 2, 0.1],
    dialogueTreeId: 'apartment_door',
    modelPath: '/assets/models/buildings/door-brown.glb',
  },
]
