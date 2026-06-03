import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, SkinnedMesh } from 'three'
import { usePlayerMovement } from '@/hooks/usePlayerMovement'

// Character GLBs have feet at local Y=0; no vertical offset needed.
// All materials were exported with alpha=0 — fixed by traversal below.
const MODEL_SCALE = 0.64
const FEET_OFFSET = 0

const CAMERA_OFFSET = { x: 0, y: 8, z: 10 }
const CAMERA_LERP = 0.1

useGLTF.preload('/assets/models/player.glb')

export function Player() {
  const meshRef = usePlayerMovement()
  const { scene } = useGLTF('/assets/models/player.glb')
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((node) => {
      if (!(node instanceof Mesh) && !(node instanceof SkinnedMesh)) return
      node.castShadow = true
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial) {
          mat.opacity = 1
          mat.transparent = false
          mat.needsUpdate = true
        }
      })
    })
    return clone
  }, [scene])
  const { camera } = useThree()
  // cameraRef only used to satisfy linter; actual camera accessed via useThree
  const _cameraRef = useRef(null)
  void _cameraRef

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.position
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

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Replace <primitive> with placeholder boxes to revert to placeholder */}
      <primitive
        object={clonedScene}
        scale={MODEL_SCALE}
        position={[0, FEET_OFFSET, 0]}
        castShadow
      />
    </group>
  )
}
