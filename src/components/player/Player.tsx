import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, SkinnedMesh } from 'three'
import { usePlayerMovement } from '@/hooks/usePlayerMovement'
import { useGameStore } from '@/stores/gameStore'

// All materials were exported with alpha=0 — fixed by traversal below.
const MODEL_SCALE = 0.64

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

  useFrame(() => {
    // Read directly from store (getState = no subscription, no re-render).
    // This avoids the stale-closure / position-reset problem that arises when
    // reading meshRef.current.position: Player re-renders whenever activeDialogue
    // changes, and R3F would re-apply position={[0,0,0]} to the group, snapping
    // the player back to the origin on every dialogue open/close.
    const [px, py, pz] = useGameStore.getState().playerPosition
    camera.position.lerp(
      { x: px + CAMERA_OFFSET.x, y: py + CAMERA_OFFSET.y, z: pz + CAMERA_OFFSET.z } as never,
      CAMERA_LERP
    )
    camera.lookAt(px, py + 1, pz)
  })

  // No position prop → R3F never resets the group; movement hook owns the position.
  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} scale={MODEL_SCALE} castShadow />
    </group>
  )
}
