import { useEffect, useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import type { Vector3Tuple } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { apartmentObjects } from '@/data/apartment'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'
import { getNearestObjectInRange } from '@/systems/interactionSystem'
import { openDialogue } from '@/systems/dialogueSystem'
import type { InteractableObjectData } from '@/types'

// Plays once per page load — triggers the opening narration on first mount.
let openingPlayed = false

// Preload cozy interior models at module load so they're ready when the
// apartment scene first renders.
const COZY = {
  nightstand:  '/assets/models/cozy/nightstand.glb',
  coffeeTable: '/assets/models/cozy/coffeetable.glb',
  table:       '/assets/models/cozy/table1.glb',
  chair:       '/assets/models/cozy/chair1.glb',
  floorLamp:   '/assets/models/cozy/floorlamp.glb',
  squareRug:   '/assets/models/cozy/squarerug.glb',
  wallLamp:    '/assets/models/cozy/walllamp.glb',
  wallMirror:  '/assets/models/cozy/wallmirror.glb',
}
Object.values(COZY).forEach((p) => useGLTF.preload(p))

// ── ApartmentProp ──────────────────────────────────────────────────────────
// Loads and clones a GLB, preserving original atlas materials.
// Used for all cozy-interior furniture that has its own baked texture.

function ApartmentProp({ path, pos, rot = 0 }: {
  path: string
  pos: Vector3Tuple
  rot?: number
}) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    return c
  }, [scene])
  return <primitive object={clone} position={pos} rotation-y={rot} />
}

// ── ApartmentObject ────────────────────────────────────────────────────────

function ApartmentObjectMesh({ data }: { data: InteractableObjectData }) {
  const playerPosition = useGameStore((s) => s.playerPosition)
  const indicatorRef   = useRef<Mesh>(null!)
  const [w, h, d]      = data.size
  const inRange        = getNearestObjectInRange(playerPosition, [data]) !== null

  useFrame(({ clock }) => {
    if (!indicatorRef.current) return
    indicatorRef.current.visible = inRange
    indicatorRef.current.position.y =
      h / 2 + 0.55 + Math.sin(clock.getElapsedTime() * 3) * 0.07
  })

  return (
    <group position={data.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.1} />
      </mesh>

      <Suspense fallback={null}>
        <Text
          position={[0, h / 2 + 0.18, 0]}
          fontSize={0.16}
          color="#ffffffcc"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#000"
        >
          {data.name}
        </Text>
      </Suspense>

      <mesh ref={indicatorRef} position={[0, h / 2 + 0.55, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

// ── CozyProps ──────────────────────────────────────────────────────────────
// Cozy Interior Pack furniture — FBX→GLB converted, meter-scale, Y-up.
// Room bounds: x∈[-4,+4], z∈[-4,+4], y∈[0,3]. South wall open for camera.
//
// Key occupied positions (do not overlap):
//   Mattress [0,0.15,2]   size 2×0.3×1.2   → x[-1,1]  z[1.4,2.6]
//   Fridge   [-2.5,0.75,-2] size 0.65×1.5×0.65
//   Mirror   [3.45,1.2,0]   (east wall, interactive)
//   Door     [0,1,-3.45]    (north wall)
//   Window   [0,1.8,-3.95]  (north wall)

function CozyProps() {
  return (
    <>
      {/* ── Nightstand — east side of mattress head (z≈1.55, x=1.25) ───── */}
      <ApartmentProp path={COZY.nightstand} pos={[1.25, 0, 1.55]} />

      {/* ── Kitchen/work table — west side, clear of fridge ─────────────── */}
      <ApartmentProp path={COZY.table} pos={[-2.0, 0, 0.8]} />

      {/* ── Chair pulled up to table from south, facing north ───────────── */}
      <ApartmentProp path={COZY.chair} pos={[-2.0, 0, 1.7]} rot={Math.PI} />

      {/* ── Coffee table — open center-west space ───────────────────────── */}
      <ApartmentProp path={COZY.coffeeTable} pos={[-0.5, 0, 0.05]} />

      {/* ── Floor lamp — east side, between mirror wall and center ────────── */}
      <ApartmentProp path={COZY.floorLamp} pos={[1.9, 0, -0.6]} />

      {/* ── Square rug — under mattress (replaces the plain geometry rug) ── */}
      <ApartmentProp path={COZY.squareRug} pos={[0, 0.015, 2]} />

      {/* ── Wall lamps — both on north wall (west wall was cut away) ────── */}
      <ApartmentProp path={COZY.wallLamp} pos={[-2.0, 1.72, -3.95]} rot={Math.PI} />
      <ApartmentProp path={COZY.wallLamp} pos={[ 2.0, 1.72, -3.95]} rot={Math.PI} />

      {/* ── Decorative wall mirror — north wall, east side ───────────────── */}
      {/* ymin=-0.465 so y=1.1 centers the mirror at chest-to-eye height */}
      <ApartmentProp path={COZY.wallMirror} pos={[2.8, 1.1, -3.91]} rot={Math.PI} />
    </>
  )
}

// ── RoomProps ──────────────────────────────────────────────────────────────
// Hand-crafted geometry props. The plain floor rug has been removed here
// and replaced by the higher-quality squarerug GLB inside CozyProps.

function RoomProps() {
  return (
    <>
      {/* Laundry chair — southeast corner with clothes pile (very Florentin) */}
      <group position={[2.8, 0, 2.8]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.65, 0.08, 0.65]} />
          <meshStandardMaterial color="#7a6752" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow>
          <sphereGeometry args={[0.28, 6, 4]} />
          <meshStandardMaterial color="#8b6e8b" roughness={1} />
        </mesh>
      </group>

      {/* Half-dead plant — northwest corner */}
      <group position={[-3.2, 0, -2.5]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.3, 8]} />
          <meshStandardMaterial color="#8b6038" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshStandardMaterial color="#5a7a3a" roughness={1} />
        </mesh>
      </group>

      {/* Electric kettle — atop the fridge */}
      <mesh position={[-2.5, 1.55, -1.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.22, 8]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Window frame on north wall */}
      <group position={[0, 1.8, -3.95]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.2, 0.06]} />
          <meshStandardMaterial color="#c8b89a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[1.4, 1.0, 0.02]} />
          <meshStandardMaterial
            color="#b8d4e8"
            transparent
            opacity={0.5}
            emissive="#6090b8"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>
    </>
  )
}

// ── ApartmentScene ─────────────────────────────────────────────────────────
// Camera is at [0,8,10] looking toward [0,0,0].
// The south wall (z=+4) is intentionally omitted — it would block the camera.
// Three remaining walls + floor + ceiling frame the diorama view.

export function ApartmentScene() {
  const apartmentInteracted = useGameStore((s) => s.apartmentInteracted)

  const visibleObjects = apartmentObjects.filter(
    (o) => o.id !== 'apartment_door' || apartmentInteracted
  )

  useObjectInteraction(visibleObjects)

  useEffect(() => {
    if (openingPlayed) return
    openingPlayed = true
    const { activeDialogue } = useGameStore.getState()
    if (!activeDialogue) openDialogue('wakeup_narration', '')
  }, [])

  const wallCol  = '#d0c3a8'
  const floorCol = '#b8a888'

  return (
    <>
      {/* ── Floor ──────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={floorCol} roughness={0.95} />
      </mesh>

      {/* Ceiling omitted intentionally — open top gives the Sims diorama view */}

      {/* ── North wall — the single back wall (Sims-style: furthest from camera) */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <boxGeometry args={[8, 3, 0.12]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── East wall — right-side back wall visible from south-facing camera */}
      <mesh position={[4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* West wall omitted — cut away for camera visibility (Sims convention) */}
      {/* Ceiling omitted — the missing ceiling gives the diorama/Sims top-down view */}

      {/* ── Skirting boards (north and east only) ──────────────────────── */}
      {([
        { pos: [0, 0.06, -3.94]  as Vector3Tuple, args: [8,    0.12, 0.04] as Vector3Tuple },
        { pos: [3.94, 0.06, 0]   as Vector3Tuple, args: [0.04, 0.12, 8   ] as Vector3Tuple },
      ] as const).map(({ pos, args }, i) => (
        <mesh key={i} position={pos} receiveShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#b8a888" roughness={0.7} />
        </mesh>
      ))}

      {/* ── Hand-crafted room details ───────────────────────────────────── */}
      <RoomProps />

      {/* ── Cozy interior furniture (GLB models) ────────────────────────── */}
      <Suspense fallback={null}>
        <CozyProps />
      </Suspense>

      {/* ── Interactable objects (boxes with interaction system) ────────── */}
      {visibleObjects.map((obj) => (
        <ApartmentObjectMesh key={obj.id} data={obj} />
      ))}
    </>
  )
}
