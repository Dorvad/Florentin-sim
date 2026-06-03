import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { getCurrentNode, selectChoice, advanceToNextNode } from '@/systems/dialogueSystem'
import styles from './DialogueBox.module.css'

// ── DialogueBox ────────────────────────────────────────────────────────────
// Appears at the bottom of the screen during NPC dialogue.
// Walks through DialogueNode.lines one at a time; shows choices at the end.

export function DialogueBox() {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const [lineIndex, setLineIndex] = useState(0)

  // Reset line index whenever the node changes
  useEffect(() => {
    setLineIndex(0)
  }, [activeDialogue?.nodeId])

  if (!activeDialogue) return null

  const node = getCurrentNode()
  if (!node) return null

  // Clamp in case lineIndex is stale from a longer previous node (one-frame lag
  // between nodeId changing and the useEffect resetting lineIndex to 0).
  const safeIndex = Math.min(lineIndex, node.lines.length - 1)
  const currentLine = node.lines[safeIndex]
  const isLastLine = safeIndex >= node.lines.length - 1
  const hasChoices = isLastLine && node.choices && node.choices.length > 0

  function handleAdvance() {
    if (!isLastLine) {
      setLineIndex((i) => i + 1)
      return
    }
    const currentNode = getCurrentNode()
    if (!currentNode?.choices || currentNode.choices.length === 0) {
      advanceToNextNode(null)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        {currentLine.speaker && (
          <div className={styles.speaker}>{currentLine.speaker}</div>
        )}
        <div className={styles.text}>{currentLine.text}</div>

        {hasChoices ? (
          <div className={styles.choices}>
            {node.choices!.map((choice, i) => (
              <button
                key={i}
                className={styles.choiceBtn}
                onClick={() => selectChoice(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        ) : (
          <button className={styles.nextBtn} onClick={handleAdvance}>
            {isLastLine ? 'Close' : 'Next ▶'}
          </button>
        )}
      </div>
    </div>
  )
}
