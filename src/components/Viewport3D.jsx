import { useEffect, useRef } from 'react'

export default function Viewport3D({ objects, frame, duration, isPlaying }) {
  const mountRef = useRef(null)
  const threeRef = useRef({})
  const playStateRef = useRef({ frame, duration, isPlaying })
  playStateRef.current = { frame, duration, isPlaying }

  useEffect(() => {
    let renderer, scene, camera, controls, grid
    let animationId

    async function init() {
      const THREE = await import('https://esm.sh/three@0.160.0')
      const { OrbitControls } = await import('https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js')

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mountRef.current.appendChild(renderer.domElement)

      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000)
      camera.position.set(6, 6, 8)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      const ambient = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambient)
      const dir = new THREE.DirectionalLight(0xffffff, 1.0)
      dir.position.set(5, 8, 3)
      scene.add(dir)

      const planeGeo = new THREE.PlaneGeometry(200, 200)
      const planeMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1, metalness: 0 })
      const plane = new THREE.Mesh(planeGeo, planeMat)
      plane.rotation.x = -Math.PI/2
      scene.add(plane)

      const gridHelper = new THREE.GridHelper(200, 200, 0x333333, 0x222222)
      gridHelper.position.y = 0.001
      grid = gridHelper
      scene.add(gridHelper)

      threeRef.current = { THREE, renderer, scene, camera, controls }

      const onResize = () => {
        if (!mountRef.current) return
        const w = mountRef.current.clientWidth
        const h = mountRef.current.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      const tick = () => {
        // Update animations by current frame if playing
        const { isPlaying, frame, duration } = playStateRef.current
        if (isPlaying) {
          playStateRef.current.frame = (frame + 1) % (duration + 1)
        }
        updateObjectTransforms()
        controls.update()
        renderer.render(scene, camera)
        animationId = requestAnimationFrame(tick)
      }
      tick()

      return () => {
        window.removeEventListener('resize', onResize)
        cancelAnimationFrame(animationId)
        renderer.dispose()
        mountRef.current && mountRef.current.removeChild(renderer.domElement)
      }
    }

    init()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reconcile objects in the scene when the objects array changes
  useEffect(() => {
    const { THREE, scene } = threeRef.current
    if (!THREE || !scene) return

    // Index existing
    const existing = new Map()
    scene.traverse((child) => {
      if (child.userData && child.userData.appId) existing.set(child.userData.appId, child)
    })

    // Add or update
    objects.forEach(obj => {
      let mesh = existing.get(obj.id)
      if (!mesh) {
        if (obj.type === 'cube') {
          const geo = new THREE.BoxGeometry(1,1,1)
          const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(obj.color || '#888') })
          mesh = new THREE.Mesh(geo, mat)
          mesh.userData.appId = obj.id
          threeRef.current.scene.add(mesh)
        }
      }
      if (mesh) {
        mesh.position.set(...obj.position)
        mesh.rotation.set(...obj.rotation)
        if (obj.scale) mesh.scale.set(...obj.scale)
        if (mesh.material && obj.color) mesh.material.color = new THREE.Color(obj.color)
      }
    })

    // Remove missing
    existing.forEach((mesh, id) => {
      if (!objects.find(o => o.id === id)) {
        mesh.geometry?.dispose?.()
        mesh.material?.dispose?.()
        threeRef.current.scene.remove(mesh)
      }
    })
  }, [objects])

  // Update transforms based on keyframes and current frame
  function updateObjectTransforms() {
    const { scene } = threeRef.current
    if (!scene) return
    const { frame, duration } = playStateRef.current
    scene.traverse((child) => {
      if (!child.userData?.appId) return
      const obj = objects.find(o => o.id === child.userData.appId)
      if (!obj) return
      // Rotation Y keyframes
      if (obj.keyframes?.rotationY && obj.keyframes.rotationY.length >= 2) {
        const kfs = obj.keyframes.rotationY
        const start = kfs[0]
        const end = kfs[kfs.length - 1]
        const t = duration === 0 ? 0 : (frame - start.f) / (end.f - start.f)
        const tt = Math.max(0, Math.min(1, t))
        const value = start.v + (end.v - start.v) * tt
        child.rotation.y = value
      }
    })
  }

  return (
    <div className="w-full h-[60vh] lg:h-full" ref={mountRef} />
  )
}
