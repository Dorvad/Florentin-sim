import { useEffect } from 'react'
import type { Vector3Tuple } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { openDialogue } from '@/systems/dialogueSystem'
import type { NPCData } from '@/types'

const INTERACTION_RADIUS = 2.5

function distanceTo(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dz * dz)
}

// ── useNPCInteraction ──────────────────────────────────────────────────────
// Registers an 'E' key listener. When pressed, finds the nearest NPC within
// INTERACTION_RADIUS and opens their dialogue tree.
// Must be mounted once inside the Canvas (or R3F context isn't needed here
// since it only reads from the store — safe to mount at App level too).

export function useNPCInteraction(npcs: NPCData[]) {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const playerPosition = useGameStore((s) => s.playerPosition)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return
      if (activeDialogue) return

      const nearest = npcs
        .map((npc) => ({
          npc,
          dist: distanceTo(playerPosition, npc.position),
        }))
        .filter(({ dist }) => dist <= INTERACTION_RADIUS)
        .sort((a, b) => a.dist - b.dist)[0]

      if (nearest) {
        openDialogue(nearest.npc.dialogueTreeId, nearest.npc.name)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [npcs, activeDialogue, playerPosition])
}
