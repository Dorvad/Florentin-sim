import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'
import { usePlayerMovement } from '@/hooks/usePlayerMovement'

// ── Player ─────────────────────────────────────────────────────────────────
// Placeholder: a capsule-shaped mesh (approximated with cylinder + 2 spheres).
// TODO: Replace mesh internals with <primitive object={gltf.scene} /> once
//       a player .glb model is ready. The Group ref and movement logic stay.

const CAMERA_OFFSET = { x: 0, y: 8, z: 10 }
const CAMERA_LERP = 0.1

export function Player() {
  const meshRef = usePlayerMovement()
  const cameraRef = useRef<PerspectiveCamera>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.position

    // Smooth camera follow
    camera.position.lerp(
      {
        x: pos.x + CAMERA_OFFSET.x,
        y: pos.y + CAMERA_OFFSET.y,
        z: pos.z + CAMERA_OFFSET.z,
      } as never,
      CAMERA_LERP
    )
    camera.lookAt(pos.x, pos.y + 1, pos.z)
  })

  // Suppress unused ref warning — cameraRef used implicitly via useThree
  void cameraRef

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 12]} />
        <meshStandardMaterial color="#f4c97f" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#f4c97f" />
      </mesh>
      {/* Direction indicator — small dot at front */}
      <mesh position={[0, 0.75, -0.32]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}
