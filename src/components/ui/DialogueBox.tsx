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

  const currentLine = node.lines[lineIndex]
  const isLastLine = lineIndex >= node.lines.length - 1
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
        <div className={styles.speaker}>{currentLine.speaker}</div>
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
