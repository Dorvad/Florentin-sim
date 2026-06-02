import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameWorld } from '@/components/world/GameWorld'
import { StatsHUD } from '@/components/ui/StatsHUD'
import { DialogueBox } from '@/components/ui/DialogueBox'
import { QuestLog } from '@/components/ui/QuestLog'
import { ControlsHint } from '@/components/ui/ControlsHint'
import { useGameStore } from '@/stores/gameStore'

export default function App() {
  const toggleQuestLog = useGameStore((s) => s.toggleQuestLog)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') toggleQuestLog()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleQuestLog])

  return (
    <>
      {/* ── 3D Canvas ─────────────────────────────────────────────────── */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 10], fov: 55, near: 0.1, far: 200 }}
        style={{ position: 'fixed', inset: 0 }}
      >
        <GameWorld />
      </Canvas>

      {/* ── 2D UI overlay ─────────────────────────────────────────────── */}
      {/* UI components sit outside the Canvas to use normal DOM elements */}
      <StatsHUD />
      <DialogueBox />
      <QuestLog />
      <ControlsHint />
    </>
  )
}
