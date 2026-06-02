import {
  TextureLoader,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  NoColorSpace,
  Color,
  Object3D,
  Mesh,
  Material,
} from 'three'

// ── Texture loader + cache ─────────────────────────────────────────────────
const loader = new TextureLoader()
const texCache = new Map<string, ReturnType<TextureLoader['load']>>()

function loadTexture(name: string, colorSpace: typeof SRGBColorSpace | typeof NoColorSpace) {
  const key = `${name}:${colorSpace}`
  if (texCache.has(key)) return texCache.get(key)!
  const tex = loader.load(`/assets/textures/${name}.png`)
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.colorSpace = colorSpace
  texCache.set(key, tex)
  return tex
}

// ── Lazy material cache ────────────────────────────────────────────────────
// Materials are created on first call to getMaterial() to avoid WebGL context
// issues at module import time.
const cache = new Map<string, MeshStandardMaterial>()

function buildMaterial(name: string): MeshStandardMaterial {
  // ── Shared texture sets ──────────────────────────────────────────────────
  const redBrick = () => ({
    map: loadTexture('T_RedBrick_BaseColor', SRGBColorSpace),
    normalMap: loadTexture('T_RedBrick_Normal', NoColorSpace),
    roughnessMap: loadTexture('T_RedBrick_ORM', NoColorSpace),
    metalnessMap: loadTexture('T_RedBrick_ORM', NoColorSpace),
  })

  const trim = () => ({
    map: loadTexture('T_Trim_BaseColor', SRGBColorSpace),
    normalMap: loadTexture('T_Trim_Normal', NoColorSpace),
    roughnessMap: loadTexture('T_Trim_ORM', NoColorSpace),
    metalnessMap: loadTexture('T_Trim_ORM', NoColorSpace),
  })

  const concrete = () => ({
    map: loadTexture('T_Concrete_BaseColor', SRGBColorSpace),
    normalMap: loadTexture('T_Concrete_Normal', NoColorSpace),
    roughnessMap: loadTexture('T_Concrete_ORM', NoColorSpace),
    metalnessMap: loadTexture('T_Concrete_ORM', NoColorSpace),
  })

  switch (name) {
    case 'MI_RedBrick':
    case 'MI_RedBrick_Pale':
      return new MeshStandardMaterial(redBrick())

    case 'MI_Trim':
    case 'MI_Trim_Dark':
    case 'MI_Trim_Green':
      return new MeshStandardMaterial(trim())

    case 'MI_Trim_MetalConcrete':
      return new MeshStandardMaterial({
        map: loadTexture('T_MetalConcrete_BaseColor', SRGBColorSpace),
        normalMap: loadTexture('T_Concrete_Normal', NoColorSpace),
        roughnessMap: loadTexture('T_Concrete_ORM', NoColorSpace),
        metalnessMap: loadTexture('T_Concrete_ORM', NoColorSpace),
      })

    case 'MI_Concrete':
      return new MeshStandardMaterial(concrete())

    case 'MI_Asphalt':
      return new MeshStandardMaterial({
        map: loadTexture('T_Concrete_Asphalt_BaseColor', SRGBColorSpace),
      })

    case 'MI_StreetDecals':
      return new MeshStandardMaterial({
        map: loadTexture('T_Concrete_Asphalt_BaseColor', SRGBColorSpace),
      })

    case 'MI_InteriorFloor':
      return new MeshStandardMaterial({
        map: loadTexture('T_Concrete_BaseColor', SRGBColorSpace),
        normalMap: loadTexture('T_Concrete_Normal', NoColorSpace),
      })

    case 'MI_InteriorWall':
      return new MeshStandardMaterial({
        map: loadTexture('T_Concrete_BaseColor', SRGBColorSpace),
      })

    case 'MI_Glass':
      return new MeshStandardMaterial({
        color: new Color('#8ab4d4'),
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        metalness: 0.1,
      })

    case 'MI_FakeInterior_1':
    case 'MI_FakeInterior_2':
    case 'MI_FakeInterior_3':
    case 'MI_FakeInterior_4':
      return new MeshStandardMaterial({
        color: new Color('#0d1117'),
        emissive: new Color('#0d1117'),
        emissiveIntensity: 0.15,
      })

    default:
      return new MeshStandardMaterial({ color: new Color('#888888') })
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function getMaterial(name: string): Material {
  let mat = cache.get(name)
  if (!mat) {
    mat = buildMaterial(name)
    cache.set(name, mat)
  }
  return mat
}

export function applyMaterials(scene: Object3D): void {
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return

    node.castShadow = true
    node.receiveShadow = true

    if (Array.isArray(node.material)) {
      node.material = node.material.map((m: Material) =>
        getMaterial(m.name)
      )
    } else if (node.material) {
      node.material = getMaterial((node.material as Material).name)
    }
  })
}
