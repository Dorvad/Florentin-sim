import styles from './ControlsHint.module.css'

// ── ControlsHint ───────────────────────────────────────────────────────────
// Small always-visible legend. Remove or hide once players are familiar.

export function ControlsHint() {
  return (
    <div className={styles.hint}>
      <span>WASD / ↑↓←→ Move</span>
      <span>E Interact</span>
      <span>Q Quest Log</span>
    </div>
  )
}
