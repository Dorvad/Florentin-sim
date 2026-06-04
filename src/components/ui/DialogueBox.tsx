import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { getCurrentNode, selectChoice, advanceToNextNode } from '@/systems/dialogueSystem'
import { npcData } from '@/data/npcs'
import styles from './DialogueBox.module.css'

const TYPEWRITER_MS = 22

function nameToHue(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

// ── DialogueBox ────────────────────────────────────────────────────────────

export function DialogueBox() {
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const [lineIndex, setLineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const node = activeDialogue ? getCurrentNode() : null
  const safeIndex = node ? Math.min(lineIndex, node.lines.length - 1) : 0
  const currentLine = node?.lines[safeIndex] ?? null
  const isLastLine = safeIndex >= (node?.lines.length ?? 1) - 1
  const hasChoices = isLastLine && !!(node?.choices?.length)

  // Reset line index when the dialogue node changes
  useEffect(() => {
    setLineIndex(0)
  }, [activeDialogue?.nodeId])

  // Typewriter effect — restarts whenever the line text changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!currentLine) { setDisplayedText(''); setIsTyping(false); return }
    setDisplayedText('')
    setIsTyping(true)
    let i = 0
    const text = currentLine.text
    timerRef.current = setInterval(() => {
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setIsTyping(false)
      }
    }, TYPEWRITER_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentLine?.text])

  // Stable ref so event listeners always call the current handler
  const handleAdvanceRef = useRef<() => void>(() => {})

  function skipOrAdvance() {
    // If still typing, skip to full text
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      if (currentLine) setDisplayedText(currentLine.text)
      setIsTyping(false)
      return
    }
    if (!isLastLine) { setLineIndex((i) => i + 1); return }
    const n = getCurrentNode()
    if (!n?.choices?.length) advanceToNextNode(null)
  }
  handleAdvanceRef.current = skipOrAdvance

  // Space / Enter to advance (not when choices are shown)
  useEffect(() => {
    if (!activeDialogue || hasChoices) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleAdvanceRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeDialogue, hasChoices])

  // Number keys 1-9 for choices
  useEffect(() => {
    if (!activeDialogue || !hasChoices || !node?.choices) return
    const choices = node.choices
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key)
      if (n >= 1 && n <= choices.length) { e.preventDefault(); selectChoice(choices[n - 1]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeDialogue, hasChoices, node?.choices])

  if (!activeDialogue || !node || !currentLine) return null

  // Portrait color: NPC color if available, otherwise hash-derived hue
  const speakerName = currentLine.speaker || activeDialogue.npcName
  const npc = npcData.find((n) => n.name === speakerName)
  const avatarColor = npc?.color ?? (
    speakerName ? `hsl(${nameToHue(speakerName)}, 55%, 52%)` : '#888'
  )
  const avatarInitial = speakerName ? speakerName.charAt(0).toUpperCase() : '?'

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        {/* ── Portrait ──────────────────────────────────────────────────── */}
        <div className={styles.portrait}>
          <div className={styles.avatar} style={{ background: avatarColor }}>
            {avatarInitial}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className={styles.content}>
          {currentLine.speaker && (
            <div className={styles.speaker} style={{ color: avatarColor }}>
              {currentLine.speaker}
            </div>
          )}

          <div className={styles.text}>
            {displayedText}
            {isTyping && <span className={styles.cursor}>▋</span>}
          </div>

          {hasChoices ? (
            <div className={styles.choices}>
              {node.choices!.map((choice, i) => (
                <button
                  key={i}
                  className={styles.choiceBtn}
                  onClick={() => selectChoice(choice)}
                >
                  <span className={styles.choiceKey}>{i + 1}</span>
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <button className={styles.nextBtn} onClick={skipOrAdvance}>
              {isLastLine ? 'Close' : 'Next'}
              <kbd className={styles.nextKey}>{isTyping ? 'skip' : 'space'}</kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
