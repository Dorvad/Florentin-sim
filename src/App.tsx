import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameWorld } from '@/components/world/GameWorld'
import { StatsHUD } from '@/components/ui/StatsHUD'
import { DialogueBox } from '@/components/ui/DialogueBox'
import { QuestLog } from '@/components/ui/QuestLog'
import { ControlsHint } from '@/components/ui/ControlsHint'
import { MobileControls } from '@/components/ui/MobileControls'
import { useGameStore } from '@/stores/gameStore'

export default function App() {
  const toggleQuestLog = useGameStore((s) => s.toggleQuestLog)

  // Keyboard bindings (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') toggleQuestLog()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleQuestLog])

  // Prevent browser scroll / pull-to-refresh on touch screens
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if ((e.target as Element)?.closest('[data-noscroll]')) e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [])

  return (
    <>
      {/* ── 3D Canvas ─────────────────────────────────────────────────── */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 10], fov: 55, near: 0.1, far: 200 }}
        style={{ position: 'fixed', inset: 0 }}
        // Prevent iOS bounce/scroll on the canvas itself
        data-noscroll=""
      >
        <GameWorld />
      </Canvas>

      {/* ── 2D UI overlay ─────────────────────────────────────────────── */}
      <StatsHUD />
      <DialogueBox />
      <QuestLog />
      <ControlsHint />
      <MobileControls />
    </>
  )
}
