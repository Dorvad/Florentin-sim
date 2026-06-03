import { Suspense } from 'react'
import { Sky, useGLTF } from '@react-three/drei'
import { buildingData, streetProps, streetTiles } from '@/data/world'
import { npcData } from '@/data/npcs'
import { useGameStore } from '@/stores/gameStore'
import { Ground } from './Ground'
import { Building } from './Building'
import { StreetTile } from './StreetTile'
import { StreetProp } from './StreetProp'
import { ApartmentScene } from './ApartmentScene'
import { Player } from '@/components/player/Player'
import { NPC } from '@/components/npcs/NPC'
import { useNPCInteraction } from '@/hooks/useNPCInteraction'
import { PlayerFallback } from '@/components/player/PlayerFallback'

// Preload all NPC models as soon as the module is imported
npcData.forEach((npc) => { if (npc.modelPath) useGLTF.preload(npc.modelPath) })

// Preload all building GLB models
buildingData.forEach((b) => { if (b.modelPath) useGLTF.preload(b.modelPath) })

// Preload all street tile GLB models (deduplicate by path)
const uniqueStreetPaths = [...new Set(streetTiles.map((t) => t.modelPath))]
uniqueStreetPaths.forEach((p) => useGLTF.preload(p))

// Preload all street prop GLB models (cars + furniture, deduplicate by path)
const uniquePropPaths = [...new Set(streetProps.map((p) => p.modelPath))]
uniquePropPaths.forEach((p) => useGLTF.preload(p))

// ── GameWorld ──────────────────────────────────────────────────────────────

export function GameWorld() {
  const currentArea = useGameStore((s) => s.currentArea)

  // NPC interaction only active on the street — empty array in apartment
  useNPCInteraction(currentArea === 'street' ? npcData : [])

  const isApartment = currentArea === 'apartment'

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────────────────── */}
      <ambientLight intensity={isApartment ? 1.0 : 0.55} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={isApartment ? 0.5 : 1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      {/* Warm indoor fill light for the apartment */}
      {isApartment && (
        <pointLight position={[0, 2.5, 0]} intensity={0.6} color="#ffe4b5" distance={10} />
      )}

      {/* ── Sky (always present — shows through apartment opening) ────────── */}
      <Sky sunPosition={[10, 5, 10]} turbidity={6} rayleigh={0.5} />

      {/* ── Scene switch ────────────────────────────────────────────────── */}
      {isApartment ? (
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

          {/* Street props: parked cars, benches, lamps, trees, dumpsters */}
          <Suspense fallback={null}>
            {streetProps.map((prop) => (
              <StreetProp key={prop.id} data={prop} />
            ))}
          </Suspense>

          {/* NPCs */}
          {npcData.map((npc) => (
            <NPC key={npc.id} data={npc} />
          ))}
        </>
      )}

      {/* ── Player — Suspense fallback while GLB loads ───────────────────── */}
      <Suspense fallback={<PlayerFallback />}>
        <Player />
      </Suspense>
    </>
  )
}
