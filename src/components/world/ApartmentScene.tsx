import { useEffect, useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { apartmentObjects } from '@/data/apartment'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'
import { getNearestObjectInRange } from '@/systems/interactionSystem'
import { openDialogue } from '@/systems/dialogueSystem'
import type { InteractableObjectData } from '@/types'

// Plays once per page load — triggers the opening narration on first mount.
let openingPlayed = false

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
      {/* Object body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Name label — wrapped so font load doesn't block the rest */}
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

      {/* Proximity indicator */}
      <mesh ref={indicatorRef} position={[0, h / 2 + 0.55, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

// ── Room furniture props ───────────────────────────────────────────────────
// Simple non-interactive props to make the room feel lived-in.

function RoomProps() {
  return (
    <>
      {/* Laundry chair — southeast corner */}
      <group position={[2.8, 0, 2.8]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.65, 0.08, 0.65]} />
          <meshStandardMaterial color="#7a6752" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>
        {/* Pile of clothes on the chair */}
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

      {/* Electric kettle — on the fridge area counter */}
      <mesh position={[-2.5, 1.55, -1.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.22, 8]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Small rug under mattress */}
      <mesh position={[0, 0.01, 2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.0]} />
        <meshStandardMaterial color="#7a5c8a" roughness={1} />
      </mesh>

      {/* Window frame on north wall */}
      <group position={[0, 1.8, -3.95]}>
        {/* Window frame border */}
        <mesh>
          <boxGeometry args={[1.6, 1.2, 0.06]} />
          <meshStandardMaterial color="#c8b89a" roughness={0.8} />
        </mesh>
        {/* Glass — slightly emissive to suggest daylight */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[1.4, 1.0, 0.02]} />
          <meshStandardMaterial color="#b8d4e8" transparent opacity={0.5} emissive="#6090b8" emissiveIntensity={0.15} />
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

  // Show door only after the player has inspected at least one object
  const visibleObjects = apartmentObjects.filter(
    (o) => o.id !== 'apartment_door' || apartmentInteracted
  )

  useObjectInteraction(visibleObjects)

  // Trigger the opening narration exactly once per page load
  useEffect(() => {
    if (openingPlayed) return
    openingPlayed = true
    const { activeDialogue } = useGameStore.getState()
    if (!activeDialogue) openDialogue('wakeup_narration', '')
  }, [])

  // Wall / floor colours
  const wallCol  = '#d0c3a8'
  const floorCol = '#b8a888'
  const ceilCol  = '#ddd6c4'

  return (
    <>
      {/* ── Floor ──────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={floorCol} roughness={0.95} />
      </mesh>

      {/* ── Ceiling ────────────────────────────────────────────────────── */}
      <mesh position={[0, 3.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={ceilCol} roughness={1} side={2} />
      </mesh>

      {/* ── North wall (z = -4, the back wall with the window) ─────────── */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <boxGeometry args={[8, 3, 0.12]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── East wall (x = +4) ─────────────────────────────────────────── */}
      <mesh position={[4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── West wall (x = -4) ─────────────────────────────────────────── */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3, 8]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* ── Skirting board / baseboard trim ────────────────────────────── */}
      {[
        { pos: [0, 0.06, -3.94] as [number,number,number],  args: [8, 0.12, 0.04] as [number,number,number] },
        { pos: [3.94, 0.06, 0] as [number,number,number],   args: [0.04, 0.12, 8] as [number,number,number] },
        { pos: [-3.94, 0.06, 0] as [number,number,number],  args: [0.04, 0.12, 8] as [number,number,number] },
      ].map(({ pos, args }, i) => (
        <mesh key={i} position={pos} receiveShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#b8a888" roughness={0.7} />
        </mesh>
      ))}

      {/* ── Room props ──────────────────────────────────────────────────── */}
      <RoomProps />

      {/* ── Interactable objects ────────────────────────────────────────── */}
      {visibleObjects.map((obj) => (
        <ApartmentObjectMesh key={obj.id} data={obj} />
      ))}
    </>
  )
}
