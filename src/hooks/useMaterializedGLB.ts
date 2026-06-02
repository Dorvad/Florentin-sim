import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group } from 'three'
import { applyMaterials } from '@/systems/materialSystem'

// ── useMaterializedGLB ─────────────────────────────────────────────────────
// Loads a GLB, deeply clones the scene, and applies PBR materials to it.
// The clone is memoised so it is only rebuilt when `path` changes.

export function useMaterializedGLB(path: string): Group {
  const { scene } = useGLTF(path)

  return useMemo(() => {
    const clone = scene.clone(true)
    applyMaterials(clone)
    return clone
  }, [scene])
}
