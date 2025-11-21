"use client"

import * as THREE from "three"
import { useRef, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { animated, useSpring, type SpringValue } from "@react-spring/three"
import { AudioReactiveEngine, AnimationParams } from "@/lib/audio-reactive-engine"

const CUBIE_SIZE = 1
const CUBIE_SPACING = 0.05
const TOTAL_CUBIE_SIZE = CUBIE_SIZE + CUBIE_SPACING

const COLORS = {
  white: "#FFFFFF",
  yellow: "#FFD500",
  blue: "#0051BA",
  green: "#009B48",
  red: "#C41E3A",
  orange: "#FF5800",
  black: "#1a1a1a",
}

type CubieData = {
  id: number
  position: [number, number, number]
  rotation: [number, number, number]
  colors: {
    front: string
    back: string
    top: string
    bottom: string
    left: string
    right: string
  }
}

const getInitialCubies = (): CubieData[] => {
  const cubies: CubieData[] = []
  let id = 0
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue
        
        const colors = {
          front: z === 1 ? COLORS.blue : COLORS.black,
          back: z === -1 ? COLORS.green : COLORS.black,
          top: y === 1 ? COLORS.white : COLORS.black,
          bottom: y === -1 ? COLORS.yellow : COLORS.black,
          left: x === -1 ? COLORS.orange : COLORS.black,
          right: x === 1 ? COLORS.red : COLORS.black,
        }
        
        cubies.push({
          id: id++,
          position: [x * TOTAL_CUBIE_SIZE, y * TOTAL_CUBIE_SIZE, z * TOTAL_CUBIE_SIZE],
          rotation: [0, 0, 0],
          colors,
        })
      }
    }
  }
  return cubies
}

const Cubie = forwardRef(({
  position,
  rotation,
  colors,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  colors: CubieData["colors"]
}, ref: any) => {
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: colors.right, roughness: 0.3, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: colors.left, roughness: 0.3, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: colors.top, roughness: 0.3, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: colors.bottom, roughness: 0.3, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: colors.front, roughness: 0.3, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: colors.back, roughness: 0.3, metalness: 0.1 }),
  ], [colors])

  return (
    <mesh ref={ref} position={position} rotation={rotation} material={materials}>
      <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
    </mesh>
  )
})
Cubie.displayName = "Cubie"

type AnimationState = {
  cubieIds: number[]
  axis: "x" | "y" | "z"
  direction: number
} | null

export type RubiksCubeHandle = {
  twist: (axis: string, layer: number, direction: number) => Promise<void>
  scramble: () => Promise<void>
  reset: () => void
  rotateCube: (axis: string, angle: number) => Promise<void>
  updateAnimation: (params: AnimationParams, deltaTime: number) => void
}

export const RubiksCube = forwardRef<RubiksCubeHandle>((props, ref) => {
  const initialCubies = useMemo(() => getInitialCubies(), [])
  const [cubies, setCubies] = useState<CubieData[]>(initialCubies)
  const [animationState, setAnimationState] = useState<AnimationState>(null)
  const isAnimatingRef = useRef(false)

  const cubeRotationRef = useRef<THREE.Group>(null)
  const cubieRefs = useRef<{ [key: number]: THREE.Mesh | null }>({})
  const currentParamsRef = useRef<AnimationParams | null>(null)
  
  const [pivotSpring, pivotApi] = useSpring(() => ({
    rotation: [0, 0, 0] as [number, number, number],
    config: { tension: 200, friction: 20 },
  }))

  useFrame((state, delta) => {
    if (currentParamsRef.current && cubeRotationRef.current) {
      const params = currentParamsRef.current
      const time = state.clock.getElapsedTime()

      cubeRotationRef.current.rotation.x += THREE.MathUtils.degToRad(params.globalRotationSpeed.x) * delta
      cubeRotationRef.current.rotation.y += THREE.MathUtils.degToRad(params.globalRotationSpeed.y) * delta
      cubeRotationRef.current.rotation.z += THREE.MathUtils.degToRad(params.globalRotationSpeed.z) * delta

      const rockX = Math.sin(time * 2) * THREE.MathUtils.degToRad(params.globalRockingAmplitude.x)
      const rockY = Math.cos(time * 1.5) * THREE.MathUtils.degToRad(params.globalRockingAmplitude.y)
      const rockZ = Math.sin(time * 1.2) * THREE.MathUtils.degToRad(params.globalRockingAmplitude.z)
      
      cubeRotationRef.current.rotation.x += rockX * delta
      cubeRotationRef.current.rotation.y += rockY * delta
      cubeRotationRef.current.rotation.z += rockZ * delta
      
      const scale = params.scale || 1.0
      cubeRotationRef.current.scale.set(scale, scale, scale)

      if (!isAnimatingRef.current) {
        Object.entries(cubieRefs.current).forEach(([id, mesh]) => {
          if (!mesh) return
          
          const cubieData = cubies.find(c => c.id === Number(id))
          if (!cubieData) return

          mesh.position.set(...cubieData.position)
          mesh.rotation.set(...cubieData.rotation)
          
          const y = cubieData.position[1]
          const x = cubieData.position[0]
          
          let yAngle = 0
          if (y > 0.1) yAngle = params.layerOffsets.H1
          else if (y < -0.1) yAngle = params.layerOffsets.H3
          else yAngle = params.layerOffsets.H2
          
          let xAngle = 0
          if (x > 0.1) xAngle = params.layerOffsets.V1
          else if (x < -0.1) xAngle = params.layerOffsets.V3
          else xAngle = params.layerOffsets.V2
          
          if (yAngle !== 0) {
             const rad = THREE.MathUtils.degToRad(yAngle)
             mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad)
             mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rad)
          }
          
          if (xAngle !== 0) {
             const rad = THREE.MathUtils.degToRad(xAngle)
             mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), rad)
             mesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rad)
          }
        })
      }
    }
  })

  useImperativeHandle(ref, () => ({
    updateAnimation: (params: AnimationParams, deltaTime: number) => {
      currentParamsRef.current = params
      
      if (!isAnimatingRef.current) {
        // This would require a more complex scene graph where each layer is a group
      }
    },
    twist: (axis: string, layer: number, direction: number) => {
      return new Promise((resolve) => {
        if (isAnimatingRef.current) {
          return resolve()
        }
        isAnimatingRef.current = true

        const axisVec = new THREE.Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, axis === "z" ? 1 : 0)
        const layerPos = layer * TOTAL_CUBIE_SIZE

        const cubieIds = cubies
          .filter((c) => {
            const pos = new THREE.Vector3(...c.position)
            return Math.abs(pos.dot(axisVec) - layerPos) < 0.1
          })
          .map((c) => c.id)

        setAnimationState({ cubieIds, axis: axis as "x" | "y" | "z", direction })

        const targetRotation: [number, number, number] = [0, 0, 0]
        const angle = (Math.PI / 2) * direction
        if (axis === "x") targetRotation[0] = angle
        if (axis === "y") targetRotation[1] = angle
        if (axis === "z") targetRotation[2] = angle

        const timeoutId = setTimeout(() => {
          if (isAnimatingRef.current) {
            setAnimationState(null)
            isAnimatingRef.current = false
            resolve()
          }
        }, 1000)

        pivotApi.start({
          from: { rotation: [0, 0, 0] },
          to: { rotation: targetRotation },
          onRest: () => {
            clearTimeout(timeoutId)
            const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...targetRotation))

            setCubies((prevCubies) =>
              prevCubies.map((cubie) => {
                if (cubieIds.includes(cubie.id)) {
                  const pos = new THREE.Vector3(...cubie.position)
                  const newPosition = pos.applyMatrix4(rotationMatrix)
                  
                  const rot = new THREE.Euler(...cubie.rotation)
                  const newRotation = new THREE.Euler().setFromRotationMatrix(
                    new THREE.Matrix4().makeRotationFromEuler(rot).multiply(rotationMatrix),
                  )
                  
                  return { 
                    ...cubie, 
                    position: [newPosition.x, newPosition.y, newPosition.z] as [number, number, number],
                    rotation: [newRotation.x, newRotation.y, newRotation.z] as [number, number, number]
                  }
                }
                return cubie
              }),
            )

            setAnimationState(null)
            isAnimatingRef.current = false
            resolve()
          },
        })
      })
    },
    scramble: async () => {
      const moves = 20
      for (let i = 0; i < moves; i++) {
        const axes = ["x", "y", "z"]
        const axis = axes[Math.floor(Math.random() * 3)]
        const layer = Math.random() > 0.5 ? 1 : -1
        const direction = Math.random() > 0.5 ? 1 : -1
        await ref.current?.twist(axis, layer, direction)
      }
    },
    reset: () => {
      if (!isAnimatingRef.current && cubeRotationRef.current) {
        setCubies(initialCubies)
        cubeRotationRef.current.rotation.set(0, 0, 0)
      }
    },
    rotateCube: (axis: string, angle: number) => {
      return Promise.resolve()
    },
  }))

  const staticCubies = animationState ? cubies.filter((c) => !animationState.cubieIds.includes(c.id)) : cubies
  const animatedCubies = animationState ? cubies.filter((c) => animationState.cubieIds.includes(c.id)) : []

  return (
    <group ref={cubeRotationRef}>
      <group>
        {staticCubies.map((cubie) => (
          <Cubie 
            key={cubie.id} 
            ref={(el: any) => (cubieRefs.current[cubie.id] = el)}
            position={cubie.position} 
            rotation={cubie.rotation} 
            colors={cubie.colors} 
          />
        ))}
        {animationState && (
          <animated.group rotation={pivotSpring.rotation as SpringValue<[number, number, number]>}>
            {animatedCubies.map((cubie) => (
              <Cubie 
                key={cubie.id} 
                ref={(el: any) => (cubieRefs.current[cubie.id] = el)}
                position={cubie.position} 
                rotation={cubie.rotation} 
                colors={cubie.colors} 
              />
            ))}
          </animated.group>
        )}
      </group>
    </group>
  )
})

RubiksCube.displayName = "RubiksCube"
