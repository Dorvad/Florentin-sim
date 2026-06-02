import type { Vector3Tuple } from 'three'
import type { NPCData } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { openDialogue } from '@/systems/dialogueSystem'

export const INTERACTION_RADIUS = 2.5

function distanceTo(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dz * dz)
}

// Returns the closest NPC within INTERACTION_RADIUS, or null.
export function getNearestNPCInRange(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): NPCData | null {
  const candidates = npcs
    .map((npc) => ({ npc, dist: distanceTo(playerPosition, npc.position) }))
    .filter(({ dist }) => dist <= INTERACTION_RADIUS)
    .sort((a, b) => a.dist - b.dist)
  return candidates[0]?.npc ?? null
}

// Triggers dialogue with the nearest NPC if one is in range.
// No-ops when a dialogue is already active.
export function interactWithNearestNPC(
  playerPosition: Vector3Tuple,
  npcs: NPCData[]
): void {
  const { activeDialogue } = useGameStore.getState()
  if (activeDialogue) return
  const npc = getNearestNPCInRange(playerPosition, npcs)
  if (npc) openDialogue(npc.dialogueTreeId, npc.name)
}
