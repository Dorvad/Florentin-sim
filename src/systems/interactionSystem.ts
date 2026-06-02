import type { Vector3Tuple } from 'three'
import type { NPCData, InteractableObjectData } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { openDialogue } from '@/systems/dialogueSystem'

export const INTERACTION_RADIUS = 2.5

// Shared interface — both NPCData and InteractableObjectData satisfy this.
export interface Interactable {
  id: string
  name: string
  position: Vector3Tuple
  dialogueTreeId: string
}

function distanceTo(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dz * dz)
}

// Returns the closest interactable within INTERACTION_RADIUS, or null.
export function getNearestInRange(
  playerPosition: Vector3Tuple,
  interactables: Interactable[]
): Interactable | null {
  const candidates = interactables
    .map((item) => ({ item, dist: distanceTo(playerPosition, item.position) }))
    .filter(({ dist }) => dist <= INTERACTION_RADIUS)
    .sort((a, b) => a.dist - b.dist)
  return candidates[0]?.item ?? null
}

// Triggers dialogue with the nearest interactable if one is in range.
// No-ops when a dialogue is already active.
export function interactWithNearest(
  playerPosition: Vector3Tuple,
  interactables: Interactable[]
): void {
  const { activeDialogue } = useGameStore.getState()
  if (activeDialogue) return
  const nearest = getNearestInRange(playerPosition, interactables)
  if (nearest) openDialogue(nearest.dialogueTreeId, nearest.name)
}

// ── Legacy NPC-specific wrappers ──────────────────────────────────────────

export function getNearestNPCInRange(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): NPCData | null {
  return getNearestInRange(playerPosition, npcs) as NPCData | null
}

export function interactWithNearestNPC(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): void {
  interactWithNearest(playerPosition, npcs)
}

// ── Object-specific wrappers ──────────────────────────────────────────────

export function getNearestObjectInRange(
  playerPosition: Vector3Tuple,
  objects: InteractableObjectData[]
): InteractableObjectData | null {
  return getNearestInRange(playerPosition, objects) as InteractableObjectData | null
}

export function interactWithNearestObject(
  playerPosition: Vector3Tuple,
  objects: InteractableObjectData[]
): void {
  interactWithNearest(playerPosition, objects)
}
