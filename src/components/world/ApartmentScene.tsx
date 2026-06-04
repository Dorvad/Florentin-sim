import { useEffect, useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Color } from 'three'
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
useGLTF.preload('/assets/models/buildings/door-brown.glb')

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

const FURN = {
  bookcase:      '/assets/models/furniture/Bookcase_2.glb',
  bookGroup:     '/assets/models/furniture/BookGroup_Medium_1.glb',
  bookStack1:    '/assets/models/furniture/Book_Stack_1.glb',
  bookStack2:    '/assets/models/furniture/Book_Stack_2.glb',
  book7:         '/assets/models/furniture/Book_7.glb',
  plant:         '/assets/models/nature/Plant_1_Big.glb',
}
Object.values(FURN).forEach((p) => useGLTF.preload(p))

// ── ApartmentProp ──────────────────────────────────────────────────────────
// Loads and clones a GLB, preserving original atlas materials.
// Used for all cozy-interior furniture that has its own baked texture.

function ApartmentProp({ path, pos, rot = 0, scale = 1, colors }: {
  path: string
  pos: Vector3Tuple
  rot?: number
  scale?: number
  colors?: Record<string, string>
}) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((node) => {
      if (!(node instanceof Mesh)) return
      node.castShadow = true
      node.receiveShadow = true
      if (colors) {
        if (Array.isArray(node.material)) {
          node.material = (node.material as MeshStandardMaterial[]).map((mat) => {
            const override = colors[mat.name]
            if (override && mat instanceof MeshStandardMaterial) {
              const m = mat.clone(); m.color = new Color(override); m.needsUpdate = true; return m
            }
            return mat
          })
        } else if (node.material instanceof MeshStandardMaterial) {
          const override = colors[node.material.name]
          if (override) {
            const m = (node.material as MeshStandardMaterial).clone()
            m.color = new Color(override); m.needsUpdate = true; node.material = m
          }
        }
      }
    })
    return c
  }, [scene, colors])
  return <primitive object={clone} position={pos} rotation-y={rot} scale={scale} />
}

// ── InteractableModel ──────────────────────────────────────────────────────
// Renders the GLB model for an interactable object that has a modelPath.
// The group parent is centered at data.position, so we shift down by half the
// object height so the model's y=0 origin lands on the floor.

function InteractableModel({ modelPath, halfH, modelScale = 4 }: { modelPath: string; halfH: number; modelScale?: number }) {
  const { scene } = useGLTF(modelPath)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((node) => {
      if (!(node instanceof Mesh)) return
      node.castShadow = true
      node.receiveShadow = true
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((m) => {
        if (m instanceof MeshStandardMaterial) { m.needsUpdate = true }
      })
    })
    return c
  }, [scene])
  return <primitive object={clone} position={[0, -halfH, 0]} scale={modelScale} />
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
      {data.modelPath ? (
        <Suspense fallback={null}>
          <InteractableModel modelPath={data.modelPath} halfH={h / 2} modelScale={data.modelScale} />
        </Suspense>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.1} />
        </mesh>
      )}

      <Suspense fallback={null}>
        <Billboard>
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
        </Billboard>
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
      {/* ── Nightstand — east of bed head (bed at z=1.8, head at z≈0.6) ─── */}
      <ApartmentProp path={COZY.nightstand} pos={[1.25, 0, 0.8]} />

      {/* ── Kitchen/work table — northwest, clear of fridge ─────────────── */}
      <ApartmentProp path={COZY.table} pos={[-2.0, 0, -0.4]} />

      {/* ── Chair pulled up to table from south, facing north ───────────── */}
      <ApartmentProp path={COZY.chair} pos={[-2.0, 0, 0.7]} rot={Math.PI} />

      {/* ── Coffee table — center of room ───────────────────────────────── */}
      <ApartmentProp path={COZY.coffeeTable} pos={[0, 0, 0.5]} />

      {/* ── Floor lamp — northeast corner ───────────────────────────────── */}
      <ApartmentProp path={COZY.floorLamp} pos={[2.2, 0, 0.5]} />

      {/* ── Square rug — under bed ──────────────────────────────────────── */}
      <ApartmentProp path={COZY.squareRug} pos={[0, 0.015, 1.8]} />

      {/* ── Wall lamps — north wall, flanking the window ────────────────── */}
      <ApartmentProp path={COZY.wallLamp} pos={[-2.2, 1.72, -3.95]} rot={Math.PI} />
      <ApartmentProp path={COZY.wallLamp} pos={[ 2.2, 1.72, -3.95]} rot={Math.PI} />

      {/* ── Decorative wall mirror — north wall, east of window ─────────── */}
      <ApartmentProp path={COZY.wallMirror} pos={[3.0, 1.1, -3.91]} rot={Math.PI} />

      {/* ── Bookcase — against west wall, shelves facing east ───────────── */}
      {/* rot=π/2 maps model-Z→world-X so back (z+) rests against wall x=-3.94 */}
      <ApartmentProp path={FURN.bookcase}   pos={[-3.726, 0, -0.5]} rot={Math.PI / 2} />

      {/* ── Book group — floor beside bookcase ──────────────────────────── */}
      <ApartmentProp path={FURN.bookGroup}  pos={[-3.3, 0.01, 0.5]} />

      {/* ── Book stacks — coffee table and floor ────────────────────────── */}
      <ApartmentProp path={FURN.bookStack1} pos={[0.3, 0.47, 0.45]} />
      <ApartmentProp path={FURN.bookStack2} pos={[1.1, 0.01, -0.7]} />

      {/* ── Single book on nightstand ───────────────────────────────────── */}
      <ApartmentProp path={FURN.book7}      pos={[1.25, 0.52, 0.6]} />

      {/* ── Big plant — northeast corner near window ───────────────────── */}
      {/* Plant_1_Big native h=3.76 → scale 0.45 ≈ 1.7 m tall; 'Leaves' mat → rich green */}
      <ApartmentProp path={FURN.plant} pos={[2.8, 0, -2.8]} rot={-Math.PI / 4} scale={0.45}
        colors={{ 'Leaves': '#3a7a28' }} />
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
        {/* 4 legs */}
        {([[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]] as [number,number][]).map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.22, lz]} castShadow>
            <boxGeometry args={[0.05, 0.44, 0.05]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
          </mesh>
        ))}
        {/* Seat */}
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.60, 0.06, 0.60]} />
          <meshStandardMaterial color="#7a6752" roughness={0.9} />
        </mesh>
        {/* Clothes pile — resting ON the seat (bottom at seat top y=0.49) */}
        <mesh position={[0.05, 0.77, 0.05]} rotation={[0.1, 0.2, 0.05]} castShadow>
          <sphereGeometry args={[0.28, 6, 4]} />
          <meshStandardMaterial color="#8b6e8b" roughness={1} />
        </mesh>
      </group>

      {/* Half-dead plant — southwest corner near west wall */}
      <group position={[-3.2, 0, 2.0]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.3, 8]} />
          <meshStandardMaterial color="#8b6038" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow>
          <sphereGeometry args={[0.30, 8, 6]} />
          <meshStandardMaterial color="#5a7a3a" roughness={1} />
        </mesh>
        {/* Drooping leaves */}
        <mesh position={[0.22, 0.38, 0]} rotation={[0, 0, 0.7]} castShadow>
          <sphereGeometry args={[0.14, 6, 4]} />
          <meshStandardMaterial color="#4a6a2a" roughness={1} />
        </mesh>
      </group>

      {/* Fridge note paper taped to fridge (visual detail) */}
      <mesh position={[-2.5, 1.1, -1.68]} castShadow>
        <boxGeometry args={[0.18, 0.22, 0.01]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.7} />
      </mesh>

      {/* Electric kettle — exactly atop the fridge */}
      {/* Fridge top = y(0.75) + halfH(0.75) = 1.5; kettle halfH = 0.11 → center y=1.61 */}
      <mesh position={[-2.5, 1.61, -2.0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.22, 8]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Kettle lid */}
      <mesh position={[-2.5, 1.74, -2.0]} castShadow>
        <cylinderGeometry args={[0.07, 0.10, 0.04, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Pillow — bed head end (Bed_Twin1 top at y=0.806, center y=0.876) */}
      <mesh position={[0, 0.876, 0.9]} rotation={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.75, 0.14, 0.48]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.9} />
      </mesh>

      {/* Rumpled blanket — foot of bed */}
      <mesh position={[0.2, 0.876, 2.6]} rotation={[0.15, 0.12, 0.08]} castShadow>
        <boxGeometry args={[1.3, 0.12, 0.65]} />
        <meshStandardMaterial color="#9b87a3" roughness={1.0} />
      </mesh>

      {/* Window frame on north wall — with crossbars */}
      <group position={[0, 1.85, -3.95]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.1, 0.07]} />
          <meshStandardMaterial color="#c8b89a" roughness={0.8} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[1.38, 0.90, 0.02]} />
          <meshStandardMaterial color="#b8d4e8" transparent opacity={0.45} emissive="#6090b8" emissiveIntensity={0.18} />
        </mesh>
        {/* Horizontal crossbar */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.38, 0.04, 0.025]} />
          <meshStandardMaterial color="#c8b89a" roughness={0.8} />
        </mesh>
        {/* Vertical crossbar */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.04, 0.90, 0.025]} />
          <meshStandardMaterial color="#c8b89a" roughness={0.8} />
        </mesh>
      </group>

      {/* Books on coffee table and floor are now GLB models in CozyProps */}
    </>
  )
}

// ── ApartmentScene ─────────────────────────────────────────────────────────
// Camera is at [0,8,10] looking toward [0,0,0].
// The south wall (z=+4) is intentionally omitted — it would block the camera.
// Three remaining walls + floor + ceiling frame the diorama view.

export function ApartmentScene() {
  useObjectInteraction(apartmentObjects)

  useEffect(() => {
    if (openingPlayed) return
    openingPlayed = true
    const { activeDialogue } = useGameStore.getState()
    if (!activeDialogue) openDialogue('wakeup_narration', '')
  }, [])

  const wallCol  = '#e2d8c8'   // warm off-white Mediterranean plaster
  const floorCol = '#b89870'   // warm terracotta tile

  return (
    <>
      {/* ── Floor ──────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={floorCol} roughness={0.82} metalness={0.02} />
      </mesh>

      {/* Ceiling omitted intentionally — open top gives the Sims diorama view */}

      {/* ── North wall ───────────────────────────────────────────────────── */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <boxGeometry args={[8, 3, 0.12]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── East wall ────────────────────────────────────────────────────── */}
      <mesh position={[4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── West wall — closes the room on the left (camera looks from south) */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* Ceiling omitted — open top gives the Sims diorama view */}

      {/* ── Skirting boards (north, east, west) ─────────────────────────── */}
      {([
        { pos: [0, 0.06, -3.94]  as Vector3Tuple, args: [8,    0.12, 0.04] as Vector3Tuple },
        { pos: [3.94, 0.06, 0]   as Vector3Tuple, args: [0.04, 0.12, 8   ] as Vector3Tuple },
        { pos: [-3.94, 0.06, 0]  as Vector3Tuple, args: [0.04, 0.12, 8   ] as Vector3Tuple },
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
      {apartmentObjects.map((obj) => (
        <ApartmentObjectMesh key={obj.id} data={obj} />
      ))}
    </>
  )
}
