import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Vector3Tuple } from 'three'

// ── StreetDetails ─────────────────────────────────────────────────────────
// Hand-crafted urban details: graffiti panels, café zone, string lights,
// awnings — giving the street its Florentin neighbourhood character.

// ── Helpers ───────────────────────────────────────────────────────────────

function ColorPlane({ pos, args, color, rotY = 0 }: {
  pos: Vector3Tuple; args: [number, number]; color: string; rotY?: number
}) {
  return (
    <mesh position={pos} rotation={[0, rotY, 0]}>
      <planeGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

function CafeTable({ pos }: { pos: Vector3Tuple }) {
  return (
    <group position={pos}>
      {/* Leg */}
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.74, 6]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.85} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 12]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.7} metalness={0.05} />
      </mesh>
    </group>
  )
}

function CafeChair({ pos, rotY = 0 }: { pos: Vector3Tuple; rotY?: number }) {
  return (
    <group position={pos} rotation-y={rotY}>
      {/* Seat */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.36, 0.04, 0.36]} />
        <meshStandardMaterial color="#7a6052" roughness={0.9} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.66, -0.16]} castShadow>
        <boxGeometry args={[0.34, 0.38, 0.03]} />
        <meshStandardMaterial color="#7a6052" roughness={0.9} />
      </mesh>
      {/* Legs */}
      {([[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]] as [number, number][]).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
          <boxGeometry args={[0.03, 0.44, 0.03]} />
          <meshStandardMaterial color="#5a4030" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── Graffiti ───────────────────────────────────────────────────────────────
// Flat color panels on building faces simulate street art. Panels face east
// (toward the road) on the west-side buildings.

function GraffitiWall() {
  // Panels sit just in front of the west building face (kb_w_tower_d east face ≈ x=-8.5)
  const wallX  = -8.3   // background wall x — slightly in front of building face
  const panelX = -8.25  // graffiti panels x — slightly in front of background
  const rotY   = Math.PI / 2  // face east

  const panels = [
    // z=-3 cluster — large bold shapes
    { pos: [panelX, 1.2, -2.5] as Vector3Tuple, args: [1.8, 2.0] as [number,number], color: '#e64060' },
    { pos: [panelX, 1.0, -4.0] as Vector3Tuple, args: [1.2, 1.6] as [number,number], color: '#2a8fdf' },
    { pos: [panelX, 1.6, -3.2] as Vector3Tuple, args: [0.9, 1.2] as [number,number], color: '#f5c030' },
    // z=-8 cluster
    { pos: [panelX, 1.3, -7.5] as Vector3Tuple, args: [2.2, 2.2] as [number,number], color: '#7030c0' },
    { pos: [panelX, 0.9, -9.0] as Vector3Tuple, args: [1.4, 1.4] as [number,number], color: '#40b870' },
    { pos: [panelX, 1.8, -8.0] as Vector3Tuple, args: [0.8, 0.8] as [number,number], color: '#ff7820' },
    // z=-13 cluster
    { pos: [panelX, 1.1, -12.5] as Vector3Tuple, args: [1.6, 1.8] as [number,number], color: '#20a8e0' },
    { pos: [panelX, 0.9, -14.0] as Vector3Tuple, args: [2.0, 1.4] as [number,number], color: '#e83880' },
    { pos: [panelX, 1.7, -13.2] as Vector3Tuple, args: [1.0, 1.0] as [number,number], color: '#88dd44' },
    // z=-18 cluster
    { pos: [panelX, 1.4, -17.8] as Vector3Tuple, args: [1.8, 2.4] as [number,number], color: '#f0a020' },
    { pos: [panelX, 1.0, -19.5] as Vector3Tuple, args: [1.4, 1.6] as [number,number], color: '#c030c0' },
    { pos: [panelX, 2.0, -18.5] as Vector3Tuple, args: [0.7, 0.7] as [number,number], color: '#40e8e0' },
  ]

  return (
    <>
      {/* Background plaster wall — polygonOffset pushes it behind graffiti panels */}
      <mesh position={[wallX, 1.5, -12]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[28, 3.5]} />
        <meshStandardMaterial color="#d8c8a8" roughness={0.95} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>

      {panels.map((p, i) => (
        <ColorPlane key={i} pos={p.pos} args={p.args} color={p.color} rotY={rotY} />
      ))}
    </>
  )
}

// ── Café Zone ──────────────────────────────────────────────────────────────
// Three outdoor tables with chairs on the east sidewalk, z=-10 to z=-16.

type CafeSet = { table: Vector3Tuple; chairs: Vector3Tuple[]; rots: number[] }

function CafeZone() {
  const sets: CafeSet[] = [
    {
      table: [8.5, 0, -10.5],
      chairs: [[8.0, 0, -10.0], [9.0, 0, -10.0], [8.5, 0, -11.2]],
      rots: [0, Math.PI, Math.PI / 2],
    },
    {
      table: [8.5, 0, -13.0],
      chairs: [[7.9, 0, -12.6], [9.1, 0, -13.4]],
      rots: [Math.PI * 0.25, Math.PI * 1.25],
    },
    {
      table: [8.5, 0, -15.5],
      chairs: [[8.0, 0, -15.0], [9.0, 0, -15.0], [8.5, 0, -16.2]],
      rots: [0, Math.PI, Math.PI / 2],
    },
  ]

  const postPositions: Vector3Tuple[] = [[8.5, 1.3, -11], [8.5, 1.3, -15]]

  return (
    <>
      {/* Awning — stretched fabric over tables */}
      <mesh position={[8.5, 2.6, -13.0]} castShadow>
        <boxGeometry args={[3.0, 0.06, 7.0]} />
        <meshStandardMaterial color="#c84828" roughness={0.9} />
      </mesh>
      {/* Awning stripe */}
      <mesh position={[8.5, 2.63, -13.0]}>
        <boxGeometry args={[3.0, 0.02, 0.25]} />
        <meshStandardMaterial color="#f0e0c0" roughness={0.9} />
      </mesh>

      {/* Support posts */}
      {postPositions.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.06, 2.6, 0.06]} />
          <meshStandardMaterial color="#7a6050" roughness={0.85} />
        </mesh>
      ))}

      {sets.map(({ table, chairs, rots }, i) => (
        <group key={i}>
          <CafeTable pos={table} />
          {chairs.map((cp, j) => (
            <CafeChair key={j} pos={cp} rotY={rots[j]} />
          ))}
        </group>
      ))}
    </>
  )
}

// ── String Lights ──────────────────────────────────────────────────────────
// Warm-glow bulb chains strung across the street at two z-positions.

function StringLight({ z }: { z: number }) {
  const bulbs = 9
  const x0 = -8.5, x1 = 8.5
  const posts = [x0, x1]
  const yBase = 4.4

  return (
    <>
      {/* Wire posts */}
      {posts.map((x, i) => (
        <mesh key={i} position={[x, yBase / 2, z]} castShadow>
          <boxGeometry args={[0.06, yBase, 0.06]} />
          <meshStandardMaterial color="#555045" roughness={0.9} />
        </mesh>
      ))}
      {/* Wire */}
      <mesh position={[0, yBase, z]}>
        <boxGeometry args={[x1 - x0, 0.02, 0.02]} />
        <meshStandardMaterial color="#333028" roughness={0.9} />
      </mesh>
      {/* Bulbs */}
      {Array.from({ length: bulbs }, (_, i) => {
        const t  = (i + 0.5) / bulbs
        const x  = x0 + t * (x1 - x0)
        const sag = Math.sin(Math.PI * t) * 0.25  // slight sag in the middle
        const bY = yBase - sag - 0.18
        return (
          <group key={i} position={[x, bY, z]}>
            {/* Short drop cord */}
            <mesh position={[0, 0.10, 0]}>
              <boxGeometry args={[0.01, 0.18, 0.01]} />
              <meshStandardMaterial color="#333028" roughness={0.9} />
            </mesh>
            {/* Bulb */}
            <mesh position={[0, -0.02, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#ffe8a0" emissive="#ffcc60" emissiveIntensity={1.8} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
      {/* Warm point light — one per strand */}
      <pointLight position={[0, yBase - 0.2, z]} intensity={0.6} color="#ffcc60" distance={12} decay={2} />
    </>
  )
}

// ── Tel Aviv Stray Cat ─────────────────────────────────────────────────────
// Low-poly sitting cat — an iconic feature of Tel Aviv streets.
// The tail and head do a gentle idle sway via useFrame.

function StreetCat({ pos, rotY = 0, color = '#c87840' }: {
  pos: Vector3Tuple; rotY?: number; color?: string
}) {
  const tailRef = useRef<Mesh>(null)
  const headRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(t * 0.8) * 0.18
    if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.5) * 0.12
  })

  const fur = color
  const dark = '#3a2010'

  return (
    <group position={pos} rotation-y={rotY}>
      {/* Body — rounded-ish box, sitting upright */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.22, 0.32, 0.28]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.44, 0.06]} castShadow>
        <boxGeometry args={[0.18, 0.18, 0.17]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.05, 0.56, 0.06]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.05, 0.09, 0.04]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.05, 0.56, 0.06]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.05, 0.09, 0.04]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>

      {/* Eyes — tiny dark spheres */}
      <mesh position={[-0.05, 0.46, 0.145]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[0.05, 0.46, 0.145]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>

      {/* Front paws */}
      <mesh position={[-0.07, 0.04, 0.10]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.10]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>
      <mesh position={[0.07, 0.04, 0.10]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.10]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>

      {/* Tail — angled up and slightly to the right */}
      <mesh ref={tailRef} position={[0.12, 0.28, -0.18]} rotation={[0.5, 0, 0.6]} castShadow>
        <boxGeometry args={[0.04, 0.22, 0.04]} />
        <meshStandardMaterial color={fur} roughness={0.95} />
      </mesh>

      {/* Stripe markings (darker) — optional tabby */}
      <mesh position={[0, 0.22, 0.141]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.04, 0.005]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
      <mesh position={[0, 0.30, 0.141]}>
        <boxGeometry args={[0.12, 0.02, 0.005]} />
        <meshStandardMaterial color={dark} roughness={1} />
      </mesh>
    </group>
  )
}

// ── Street Kiosk ───────────────────────────────────────────────────────────
// A small stand-up street booth: newspaper / lottery kiosk.
// Based on the uploaded "booth" (alfamidi.skp) which we couldn't convert.

function StreetKiosk({ pos, rotY = 0 }: { pos: Vector3Tuple; rotY?: number }) {
  return (
    <group position={pos} rotation-y={rotY}>
      {/* Main body */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.2, 1.0]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.85} />
      </mesh>

      {/* Roof — flat overhang */}
      <mesh position={[0, 2.3, 0.2]} castShadow>
        <boxGeometry args={[2.0, 0.08, 1.5]} />
        <meshStandardMaterial color="#c84030" roughness={0.85} />
      </mesh>

      {/* Front window opening (dark interior box) */}
      <mesh position={[0, 1.1, 0.51]}>
        <boxGeometry args={[1.0, 0.9, 0.02]} />
        <meshStandardMaterial color="#1a120c" roughness={0.9} />
      </mesh>

      {/* Front lower shelf/counter */}
      <mesh position={[0, 0.65, 0.55]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.28]} />
        <meshStandardMaterial color="#c0a880" roughness={0.8} />
      </mesh>

      {/* Side sign panel */}
      <mesh position={[0.81, 1.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.0, 0.8, 0.02]} />
        <meshStandardMaterial color="#e03820" roughness={0.8} />
      </mesh>

      {/* Colorful magazine panels (front) */}
      {([-0.28, 0, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0.52]}>
          <boxGeometry args={[0.22, 0.28, 0.005]} />
          <meshStandardMaterial color={['#f0c030', '#3080e0', '#e03040'][i]} roughness={0.6} />
        </mesh>
      ))}

      {/* Support legs */}
      {([-0.65, 0.65] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#7a6050" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── StreetDetails ──────────────────────────────────────────────────────────

export function StreetDetails() {
  return (
    <>
      <GraffitiWall />
      <CafeZone />
      <StringLight z={-9} />
      <StringLight z={-16} />

      {/* Tel Aviv stray cats — iconic neighbourhood character */}
      <StreetCat pos={[7.5, 0, -1.5]} rotY={0.4} color="#c87840" />
      <StreetCat pos={[-5.8, 0.01, -14.5]} rotY={Math.PI + 0.3} color="#888880" />
      <StreetCat pos={[9.2, 0, -18.0]} rotY={-0.8} color="#e0c0a0" />
      <StreetCat pos={[-6.5, 0, -2.5]} rotY={-0.6} color="#807060" />

      {/* Street kiosk / newsstand — west side */}
      <StreetKiosk pos={[-8.5, 0, -22]} rotY={Math.PI / 2} />
    </>
  )
}
