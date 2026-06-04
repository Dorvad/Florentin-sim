import { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import type { Vector3Tuple } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { getNearestObjectInRange } from '@/systems/interactionSystem'
import { streetObjects } from '@/data/streetObjects'

const DOOR_PATH = '/assets/models/buildings/door-brown.glb'
useGLTF.preload(DOOR_PATH)

const OBJ = streetObjects[0]
const [, H] = OBJ.size
// OBJ.rotation rotates the facade so the door faces the road (west, toward –x)
const GROUP_ROT: Vector3Tuple = [0, OBJ.rotation ?? 0, 0]

function EntranceDoor() {
  const { scene } = useGLTF(DOOR_PATH)
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((n) => { if (n instanceof Mesh) { n.castShadow = true; n.receiveShadow = true } })
    return c
  }, [scene])
  return <primitive object={clone} position={[0, -(H / 2), 0] as Vector3Tuple} scale={4} />
}

// ── StreetEntrance ─────────────────────────────────────────────────────────
// Apartment-building facade on the east sidewalk. Press E nearby to go home.

export function StreetEntrance() {
  const playerPosition = useGameStore((s) => s.playerPosition)
  const indicatorRef   = useRef<Mesh>(null!)
  const inRange        = getNearestObjectInRange(playerPosition, streetObjects) !== null

  useFrame(({ clock }) => {
    if (!indicatorRef.current) return
    indicatorRef.current.visible = inRange
    indicatorRef.current.position.y =
      H / 2 + 0.55 + Math.sin(clock.getElapsedTime() * 3) * 0.07
  })

  return (
    <group position={OBJ.position as Vector3Tuple} rotation={GROUP_ROT}>
      {/* ── Door model ──────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <EntranceDoor />
      </Suspense>

      {/* ── Building facade wall stub (behind door, z- = into building) ── */}
      <mesh position={[0, 0.2, -0.18]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.4, 0.22]} />
        <meshStandardMaterial color="#c8b898" roughness={0.9} />
      </mesh>

      {/* ── Concrete step ────────────────────────────────────────────── */}
      <mesh position={[0, -(H / 2) - 0.94, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.12, 0.3]} />
        <meshStandardMaterial color="#a09880" roughness={0.8} />
      </mesh>

      {/* ── Awning ───────────────────────────────────────────────────── */}
      <mesh position={[0, H / 2 + 0.12, 0.3]} castShadow>
        <boxGeometry args={[2.0, 0.07, 0.65]} />
        <meshStandardMaterial color="#7a5535" roughness={0.7} />
      </mesh>
      <mesh position={[0, H / 2 + 0.08, 0.62]} castShadow>
        <boxGeometry args={[2.0, 0.14, 0.04]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
      </mesh>

      {/* ── Name label (Billboard keeps it readable from any angle) ──── */}
      <Suspense fallback={null}>
        <Billboard>
          <Text
            position={[0, H / 2 + 0.3, 0]}
            fontSize={0.15}
            color="#ffffffcc"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.01}
            outlineColor="#000"
          >
            {OBJ.name}
          </Text>
        </Billboard>
      </Suspense>

      {/* ── Interaction indicator ─────────────────────────────────────── */}
      <mesh ref={indicatorRef} position={[0, H / 2 + 0.55, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}
