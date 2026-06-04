import { Suspense } from 'react'
import { Sky, useGLTF } from '@react-three/drei'
import { buildingData, streetProps, streetTiles } from '@/data/world'
import { npcData } from '@/data/npcs'
import { streetObjects } from '@/data/streetObjects'
import { useGameStore } from '@/stores/gameStore'
import { Ground } from './Ground'
import { RoadSurface } from './RoadSurface'
import { StreetDetails } from './StreetDetails'
import { StreetEntrance } from './StreetEntrance'
import { Building } from './Building'
import { StreetTile } from './StreetTile'
import { StreetProp } from './StreetProp'
import { ApartmentScene } from './ApartmentScene'
import { Player } from '@/components/player/Player'
import { NPC } from '@/components/npcs/NPC'
import { useNPCInteraction } from '@/hooks/useNPCInteraction'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'
import { PlayerFallback } from '@/components/player/PlayerFallback'

// Preload all NPC models (including animation packs) as soon as the module is imported
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

  // Interaction hooks — active for their respective area only
  useNPCInteraction(currentArea === 'street' ? npcData : [])
  useObjectInteraction(currentArea === 'street' ? streetObjects : [])

  const isApartment = currentArea === 'apartment'

  return (
    <>
      {/* ── Lighting ────────────────────────────────────────────────────── */}
      <ambientLight intensity={isApartment ? 1.0 : 0.65} color={isApartment ? '#ffffff' : '#ffeedd'} />
      <directionalLight
        position={[8, 18, -10]}
        intensity={isApartment ? 0.5 : 1.4}
        color={isApartment ? '#ffffff' : '#ffe8c8'}
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

      {/* ── Sky — warm Tel Aviv late-afternoon light ────────────────────── */}
      <Sky sunPosition={[8, 3, -10]} turbidity={4} rayleigh={0.8} mieCoefficient={0.005} mieDirectionalG={0.8} />

      {/* ── Scene switch ────────────────────────────────────────────────── */}
      {isApartment ? (
        <ApartmentScene />
      ) : (
        <>
          {/* Ground base + flat pavement surface */}
          <Ground />
          <RoadSurface />

          {/* Street tiles (empty — road replaced by RoadSurface above) */}
          <Suspense fallback={null}>
            {streetTiles.map((t) => (
              <StreetTile key={t.id} {...t} />
            ))}
          </Suspense>

          {/* Florentin neighbourhood details: graffiti, café, string lights */}
          <StreetDetails />

          {/* Apartment building entrance */}
          <Suspense fallback={null}>
            <StreetEntrance />
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
