import type { InteractableObjectData } from '@/types'

// ── Apartment interactable objects ─────────────────────────────────────────
// Positions are relative to apartment scene origin [0,0,0].
// The door is gated behind apartmentInteracted (handled by ApartmentScene).

export const apartmentObjects: InteractableObjectData[] = [
  {
    id: 'mattress',
    name: 'Mattress',
    position: [0, 0.15, 2],
    color: '#8B7D7B',
    size: [2, 0.3, 1.2],
    dialogueTreeId: 'mattress',
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
