import { Suspense } from 'react'
import { Sky, Environment, useGLTF } from '@react-three/drei'
import { buildingData } from '@/data/world'
import { npcData } from '@/data/npcs'
import { Ground } from './Ground'
import { Street } from './Street'
import { Building } from './Building'
import { Player } from '@/components/player/Player'
import { NPC } from '@/components/npcs/NPC'
import { useNPCInteraction } from '@/hooks/useNPCInteraction'

// Preload all NPC models as soon as the module is imported
npcData.forEach((npc) => { if (npc.modelPath) useGLTF.preload(npc.modelPath) })

// ── GameWorld ──────────────────────────────────────────────────────────────
// Root 3D scene. Add new world regions, lighting rigs, or environment
// presets here. NPC and building lists are driven by data files.

export function GameWorld() {
  useNPCInteraction(npcData)

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* ── Sky / atmosphere ────────────────────────────────────────────── */}
      <Sky sunPosition={[10, 5, 10]} turbidity={6} rayleigh={0.5} />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* ── Ground & streets ────────────────────────────────────────────── */}
      <Ground />
      <Street />

      {/* ── Buildings (data-driven) ──────────────────────────────────────── */}
      {buildingData.map((b) => (
        <Building key={b.id} data={b} />
      ))}

      {/* ── NPCs (data-driven) ───────────────────────────────────────────── */}
      {npcData.map((npc) => (
        <NPC key={npc.id} data={npc} />
      ))}

      {/* ── Player ──────────────────────────────────────────────────────── */}
      <Player />

      {/* TODO: Add interactable props (benches, food stalls, etc.) here */}
      {/* TODO: Add particle effects, ambient sounds trigger volumes here */}
    </>
  )
}
