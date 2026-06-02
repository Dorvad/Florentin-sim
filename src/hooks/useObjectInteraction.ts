import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { interactWithNearestObject } from '@/systems/interactionSystem'
import type { InteractableObjectData } from '@/types'

// ── useObjectInteraction ───────────────────────────────────────────────────
// Registers the E key listener for apartment object interaction.
// Touch-based interaction uses interactWithNearestObject() via MobileControls.

export function useObjectInteraction(objects: InteractableObjectData[]) {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const playerPosition = useGameStore((s) => s.playerPosition)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return
      interactWithNearestObject(playerPosition, objects)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [objects, activeDialogue, playerPosition])
}
