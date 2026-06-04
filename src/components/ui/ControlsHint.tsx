import styles from './ControlsHint.module.css'

export function ControlsHint() {
  return (
    <div className={styles.hint}>
      <span><kbd className={styles.key}>WASD</kbd>Move</span>
      <span><kbd className={styles.key}>Space</kbd>Jump</span>
      <span><kbd className={styles.key}>E</kbd>Interact</span>
      <span><kbd className={styles.key}>Q</kbd>Quests</span>
    </div>
  )
}
