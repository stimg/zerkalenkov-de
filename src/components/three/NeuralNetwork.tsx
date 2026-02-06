import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';

interface Signal {
  connectionIndex: number;
  progress: number;
  speed: number;
  id: number;
}

export function NeuralNetwork() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const nextSignalId = useRef(0);
  const lastSignalTime = useRef(0);

  const nodeCount = isMobile ? 15 : isTablet ? 20 : 45;

  // Create nodes in a more structured spherical pattern
  const { nodes, connections } = useMemo(() => {
    const nodePositions: THREE.Vector3[] = [];
    const radius = 4; // Smaller, more contained sphere

    // Create nodes in a structured sphere
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius / 1.1 * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    // Connect EVERY node to EVERY other node
    const connectionsList: [number, number][] = [];
    const npLen = nodePositions.length;

    for (let i = 0; i < npLen; i++) {
      for (let j = i + 1; j < npLen; j++) {
        connectionsList.push([i, j]);
      }
    }

    return { nodes: nodePositions, connections: connectionsList };
  }, [nodeCount]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate the entire structure as one object
    groupRef.current.rotation.y = time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
    groupRef.current.rotation.z = Math.cos(time * 0.05) * 0.1;

    // Gentle floating motion
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.5;

    // Generate new signals randomly
    if (time - lastSignalTime.current > 0.1 + Math.random() * 0.3) {
      lastSignalTime.current = time;
      const connectionIndex = Math.floor(Math.random() * connections.length);
      const newSignal: Signal = {
        connectionIndex,
        progress: 0,
        speed: 0.5 + Math.random() * 1.0,
        id: nextSignalId.current++,
      };
      setSignals((prev) => [...prev, newSignal]);
    }

    // Update signals
    setSignals((prevSignals) => {
      return prevSignals
        .map((signal) => ({
          ...signal,
          progress: signal.progress + signal.speed * delta,
        }))
        .filter((signal) => signal.progress <= 1.0);
    });

    // Update line colors based on signals
    if (linesRef.current?.geometry.attributes.color) {
      const geometry = linesRef.current.geometry;
      const colorAttr = geometry.attributes.color!;
      const colors = colorAttr.array as Float32Array;

      // Reset all colors to base
      for (let i = 0; i < connections.length; i++) {
        const lum = 0.5;
        const color = new THREE.Color().setHSL(0.68, 0.95, lum);
        colors[i * 8] = color.r;
        colors[i * 8 + 1] = color.g;
        colors[i * 8 + 2] = color.b;
        colors[i * 8 + 3] = 0.4;
        colors[i * 8 + 4] = color.r;
        colors[i * 8 + 5] = color.g;
        colors[i * 8 + 6] = color.b;
        colors[i * 8 + 7] = 0.4;
      }

      // Highlight connections with active signals
      signals.forEach((signal) => {
        const i = signal.connectionIndex;
        if (i >= 0 && i < connections.length) {
          const intensity = Math.sin(signal.progress * Math.PI); // Fade in/out
          const brightColor = new THREE.Color().setHSL(0.65, 1.0, 0.7);

          const baseIdx = i * 8;
          // Start point
          const r0 = colors[baseIdx] ?? 0;
          const g0 = colors[baseIdx + 1] ?? 0;
          const b0 = colors[baseIdx + 2] ?? 0;
          colors[baseIdx] = THREE.MathUtils.lerp(r0, brightColor.r, intensity);
          colors[baseIdx + 1] = THREE.MathUtils.lerp(g0, brightColor.g, intensity);
          colors[baseIdx + 2] = THREE.MathUtils.lerp(b0, brightColor.b, intensity);
          colors[baseIdx + 3] = THREE.MathUtils.lerp(0.4, 1.0, intensity);

          // End point
          const r1 = colors[baseIdx + 4] ?? 0;
          const g1 = colors[baseIdx + 5] ?? 0;
          const b1 = colors[baseIdx + 6] ?? 0;
          colors[baseIdx + 4] = THREE.MathUtils.lerp(r1, brightColor.r, intensity);
          colors[baseIdx + 5] = THREE.MathUtils.lerp(g1, brightColor.g, intensity);
          colors[baseIdx + 6] = THREE.MathUtils.lerp(b1, brightColor.b, intensity);
          colors[baseIdx + 7] = THREE.MathUtils.lerp(0.4, 1.0, intensity);
        }
      });

      colorAttr.needsUpdate = true;
    }

    // Update node colors based on signals
    if (pointsRef.current?.geometry.attributes.color) {
      const geometry = pointsRef.current.geometry;
      const colorAttr = geometry.attributes.color!;
      const colors = colorAttr.array as Float32Array;

      // Reset all colors to base (purple)
      const baseColor = new THREE.Color('#5300be');
      const baseR = baseColor.r;
      const baseG = baseColor.g;
      const baseB = baseColor.b;

      for (let i = 0; i < nodeCount; i++) {
        const idx = i * 3;
        colors[idx] = baseR;
        colors[idx + 1] = baseG;
        colors[idx + 2] = baseB;
      }

      // Highlight nodes with active signals
      signals.forEach((signal) => {
        const connection = connections[signal.connectionIndex];
        if (connection) {
          const [startIdx, endIdx] = connection;
          const intensity = Math.sin(signal.progress * Math.PI);
          const brightColor = new THREE.Color('#ccc0ff');

          // Highlight start node when signal is near start
          if (signal.progress < 0.3) {
            const startIntensity = intensity * (1 - signal.progress / 0.3);
            const baseIdx = startIdx * 3;
            colors[baseIdx] = THREE.MathUtils.lerp(baseR, brightColor.r, startIntensity);
            colors[baseIdx + 1] = THREE.MathUtils.lerp(baseG, brightColor.g, startIntensity);
            colors[baseIdx + 2] = THREE.MathUtils.lerp(baseB, brightColor.b, startIntensity);
          }

          // Highlight end node when signal is near end
          if (signal.progress > 0.7) {
            const endIntensity = intensity * ((signal.progress - 0.7) / 0.3);
            const baseIdx = endIdx * 3;
            colors[baseIdx] = THREE.MathUtils.lerp(baseR, brightColor.r, endIntensity);
            colors[baseIdx + 1] = THREE.MathUtils.lerp(baseG, brightColor.g, endIntensity);
            colors[baseIdx + 2] = THREE.MathUtils.lerp(baseB, brightColor.b, endIntensity);
          }
        }
      });

      colorAttr.needsUpdate = true;
    }
  });

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    // Positions
    const positions = new Float32Array(nodeCount * 3);
    nodes.forEach((node, i) => {
      positions[i * 3] = node.x;
      positions[i * 3 + 1] = node.y;
      positions[i * 3 + 2] = node.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Colors
    const colors = new Float32Array(nodeCount * 3);
    const baseColor = new THREE.Color('#5300be');
    for (let i = 0; i < nodeCount; i++) {
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, [nodes, nodeCount]);

  const linePositions = useMemo(() => {
    const positions = new Float32Array(connections.length * 6);
    connections.forEach((connection, i) => {
      const [start, end] = connection;
      const startNode = nodes[start];
      const endNode = nodes[end];

      if (!startNode || !endNode) return;

      positions[i * 6] = startNode.x;
      positions[i * 6 + 1] = startNode.y;
      positions[i * 6 + 2] = startNode.z;
      positions[i * 6 + 3] = endNode.x;
      positions[i * 6 + 4] = endNode.y;
      positions[i * 6 + 5] = endNode.z;
    });
    return positions;
  }, [connections, nodes]);

  const lineColors = useMemo(() => {
    const colors = new Float32Array(connections.length * 8);
    connections.forEach((_connection, i) => {
      // Create luminosity gradient based on connection index
      // const t = i / connections.length;
      const lum = 0.5 // - t * 0.65; // Luminosity (org 0.6)
      const color = new THREE.Color().setHSL(0.68, 0.95, lum);

      colors[i * 8] = color.r;
      colors[i * 8 + 1] = color.g;
      colors[i * 8 + 2] = color.b;
      colors[i * 8 + 3] = 0.4;
      colors[i * 8 + 4] = color.r;
      colors[i * 8 + 5] = color.g;
      colors[i * 8 + 6] = color.b;
      colors[i * 8 + 7] = 0.4;
    });
    return colors;
  }, [connections]);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={particleGeometry}>
        <pointsMaterial
          size={isMobile ? 0.15 : 0.15}
          vertexColors
          transparent
          opacity={1.0}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={connections.length * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 4]}
            count={connections.length * 2}
            array={lineColors}
            itemSize={4}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent />
      </lineSegments>
    </group>
  );
}
