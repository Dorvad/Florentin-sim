import { useState, useEffect, useCallback } from 'react'
import styles from './FullscreenButton.module.css'

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // F key toggles fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return (
    <button
      className={styles.btn}
      onClick={toggle}
      title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <svg viewBox="0 0 16 16" fill="currentColor" className={styles.icon}>
          <path d="M5.5 1v3.5H2v1h4.5V1h-1zM9.5 1v4.5H14v-1h-3.5V1h-1zM2 10.5v1h3.5V15h1v-4.5H2zM10.5 10.5V15h1v-3.5H15v-1h-4.5z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="currentColor" className={styles.icon}>
          <path d="M1 1v4.5h1V2.5l3.5 3.5.7-.7L2.7 2H5V1H1zM11 1v1h2.3l-3.5 3.5.7.7L14 2.7V5h1V1h-4zM4.2 10.2L.7 13.7V11H0v5h5v-1H2.3l3.5-3.5-.6-.8zM10.5 14v1H15v-5h-1v2.3l-3.5-3.5-.7.7 3.5 3.5H11z"/>
        </svg>
      )}
    </button>
  )
}
