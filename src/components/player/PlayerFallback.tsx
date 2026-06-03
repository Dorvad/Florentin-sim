// Visible placeholder shown while the player GLB is still loading.

export function PlayerFallback() {
  return (
    <group position={[0, 0, 0]}>
      {/* body */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.28, 1.0, 4, 8]} />
        <meshStandardMaterial color="#5b8fc9" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#e8c49a" roughness={0.6} />
      </mesh>
    </group>
  )
}
