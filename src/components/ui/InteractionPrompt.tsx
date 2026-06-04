import { useGameStore } from '@/stores/gameStore'
import { getNearestNPCInRange, getNearestObjectInRange } from '@/systems/interactionSystem'
import { npcData } from '@/data/npcs'
import { apartmentObjects } from '@/data/apartment'
import { streetObjects } from '@/data/streetObjects'
import styles from './InteractionPrompt.module.css'

// ── InteractionPrompt ──────────────────────────────────────────────────────
// Desktop-only pill showing "[E] Talk to Moti" / "[E] Inspect Fridge Note"
// when the player is within range of an interactable. Hidden on touch screens
// (mobile has the Talk/Inspect button in MobileControls instead).

export function InteractionPrompt() {
  const playerPosition = useGameStore((s) => s.playerPosition)
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const currentArea    = useGameStore((s) => s.currentArea)

  if (activeDialogue) return null

  let verb  = 'Interact'
  let label: string | null = null

  if (currentArea === 'street') {
    const nearNPC = getNearestNPCInRange(playerPosition, npcData)
    if (nearNPC) {
      verb  = 'Talk to'
      label = nearNPC.name
    } else {
      const nearObj = getNearestObjectInRange(playerPosition, streetObjects)
      if (nearObj) {
        verb  = 'Enter'
        label = nearObj.name
      }
    }
  } else {
    const nearObj = getNearestObjectInRange(playerPosition, apartmentObjects)
    if (nearObj) {
      verb  = 'Inspect'
      label = nearObj.name
    }
  }

  if (!label) return null

  return (
    <div className={styles.prompt}>
      <kbd className={styles.key}>E</kbd>
      <span className={styles.verb}>{verb}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
