import { Text } from '@react-three/drei'
import type { BuildingData } from '@/types'
import { useMaterializedGLB } from '@/hooks/useMaterializedGLB'

interface BuildingProps {
  data: BuildingData
}

// ── BuildingModel ──────────────────────────────────────────────────────────
// Renders a GLB building with PBR materials applied.
// useGLTF (called inside useMaterializedGLB) must not be conditional, so this
// sub-component is only mounted when modelPath is defined.

function BuildingModel({ data }: { data: BuildingData }) {
  // data.modelPath is guaranteed non-null by the parent guard
  const scene = useMaterializedGLB(data.modelPath!)
  const [, height] = data.size

  return (
    <group position={data.position} rotation-y={data.rotation ?? 0}>
      <primitive object={scene} />
      {data.label && (
        <Text
          position={[0, height + 0.3, 0]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {data.label}
        </Text>
      )}
    </group>
  )
}

// ── BuildingPlaceholder ────────────────────────────────────────────────────
// Coloured box fallback for buildings without a GLB model.
// position.y is already the mesh centre (half the height off the ground).

function BuildingPlaceholder({ data }: { data: BuildingData }) {
  const [, height] = data.size
  return (
    <group position={data.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={data.size} />
        <meshStandardMaterial color={data.color} />
      </mesh>
      {data.label && (
        <Text
          position={[0, height / 2 + 0.3, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="black"
        >
          {data.label}
        </Text>
      )}
    </group>
  )
}

// ── Building ───────────────────────────────────────────────────────────────
// Delegates to BuildingModel when a GLB path is available, otherwise falls
// back to BuildingPlaceholder. The conditional is at the component boundary
// so hooks inside each sub-component are never called conditionally.

export function Building({ data }: BuildingProps) {
  return data.modelPath
    ? <BuildingModel data={data} />
    : <BuildingPlaceholder data={data} />
}
