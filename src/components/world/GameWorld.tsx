import { Suspense } from 'react'
import { Sky, Environment, useGLTF } from '@react-three/drei'
import { buildingData, streetTiles } from '@/data/world'
import { npcData } from '@/data/npcs'
import { useGameStore } from '@/stores/gameStore'
import { Ground } from './Ground'
import { Building } from './Building'
import { StreetTile } from './StreetTile'
import { ApartmentScene } from './ApartmentScene'
import { Player } from '@/components/player/Player'
import { NPC } from '@/components/npcs/NPC'
import { useNPCInteraction } from '@/hooks/useNPCInteraction'

// Preload all NPC models as soon as the module is imported
npcData.forEach((npc) => { if (npc.modelPath) useGLTF.preload(npc.modelPath) })

// Preload all building GLB models
buildingData.forEach((b) => { if (b.modelPath) useGLTF.preload(b.modelPath) })

// Preload all street tile GLB models (deduplicate by path)
const uniqueStreetPaths = [...new Set(streetTiles.map((t) => t.modelPath))]
uniqueStreetPaths.forEach((p) => useGLTF.preload(p))

// ── GameWorld ──────────────────────────────────────────────────────────────

export function GameWorld() {
  const currentArea = useGameStore((s) => s.currentArea)

  // NPC interaction only active on the street — empty array in apartment means
  // E key does nothing for NPCs (objects are handled by ApartmentScene).
  useNPCInteraction(currentArea === 'street' ? npcData : [])

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────────────────── */}
      <ambientLight intensity={currentArea === 'apartment' ? 0.8 : 0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={currentArea === 'apartment' ? 0.6 : 1.2}
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
        <Environment preset="apartment" />
      </Suspense>

      {/* ── Scene switch ────────────────────────────────────────────────── */}
      {currentArea === 'apartment' ? (
        <ApartmentScene />
      ) : (
        <>
          {/* Ground */}
          <Ground />

          {/* Street tiles */}
          <Suspense fallback={null}>
            {streetTiles.map((t) => (
              <StreetTile key={t.id} {...t} />
            ))}
          </Suspense>

          {/* Buildings */}
          <Suspense fallback={null}>
            {buildingData.map((b) => (
              <Building key={b.id} data={b} />
            ))}
          </Suspense>

          {/* NPCs */}
          {npcData.map((npc) => (
            <NPC key={npc.id} data={npc} />
          ))}
        </>
      )}

      {/* ── Player (always rendered) ─────────────────────────────────────── */}
      <Player />
    </>
  )
}
