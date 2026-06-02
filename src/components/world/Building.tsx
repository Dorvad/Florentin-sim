import { Text } from '@react-three/drei'
import type { BuildingData } from '@/types'

interface BuildingProps {
  data: BuildingData
}

// ── Building ───────────────────────────────────────────────────────────────
// Placeholder: a coloured box. position.y is already the mesh centre
// (half the height off the ground), set in world.ts.
// TODO: Replace mesh children with <primitive object={gltf.scene} /> and
//       clear the boxGeometry once .glb building assets are imported.

export function Building({ data }: BuildingProps) {
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
