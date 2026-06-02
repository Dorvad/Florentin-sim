import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { interactWithNearestNPC } from '@/systems/interactionSystem'
import type { NPCData } from '@/types'

// ── useNPCInteraction ──────────────────────────────────────────────────────
// Registers the E key listener for keyboard-based NPC interaction.
// Touch-based interaction uses interactWithNearestNPC() directly via the
// Talk button in MobileControls.

export function useNPCInteraction(npcs: NPCData[]) {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const playerPosition = useGameStore((s) => s.playerPosition)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return
      interactWithNearestNPC(playerPosition, npcs)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [npcs, activeDialogue, playerPosition])
}
