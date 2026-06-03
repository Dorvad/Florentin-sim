import type { Vector3Tuple } from 'three'
import type { NPCData, InteractableObjectData } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { openDialogue } from '@/systems/dialogueSystem'

export const INTERACTION_RADIUS = 2.5

// Live NPC positions updated each frame by wandering NPCs
const npcPositionRegistry = new Map<string, Vector3Tuple>()

export function updateNPCPosition(id: string, pos: Vector3Tuple): void {
  npcPositionRegistry.set(id, pos)
}

export function getNPCWorldPosition(id: string, fallback: Vector3Tuple): Vector3Tuple {
  return npcPositionRegistry.get(id) ?? fallback
}

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

// ── NPC-specific wrappers (use registry positions for wandering NPCs) ──────

export function getNearestNPCInRange(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): NPCData | null {
  const candidates = npcs
    .map((npc) => {
      const pos = npcPositionRegistry.get(npc.id) ?? npc.position
      return { npc, dist: distanceTo(playerPosition, pos) }
    })
    .filter(({ dist }) => dist <= INTERACTION_RADIUS)
    .sort((a, b) => a.dist - b.dist)
  return candidates[0]?.npc ?? null
}

export function interactWithNearestNPC(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): void {
  const { activeDialogue } = useGameStore.getState()
  if (activeDialogue) return
  const nearest = getNearestNPCInRange(playerPosition, npcs)
  if (nearest) openDialogue(nearest.dialogueTreeId, nearest.name)
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
