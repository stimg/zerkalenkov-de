import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';

export function NeuralNetwork() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const nodeCount = isMobile ? 12 : isTablet ? 15 : 20;

  // Create nodes in a more structured spherical pattern
  const { nodes, connections } = useMemo(() => {
    const nodePositions: THREE.Vector3[] = [];
    const radius = 4; // Smaller, more contained sphere

    // Create nodes in a structured sphere
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    // Connect EVERY node to EVERY other node
    const connectionsList: [number, number][] = [];

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        connectionsList.push([i, j]);
      }
    }

    return { nodes: nodePositions, connections: connectionsList };
  }, [nodeCount]);

  useFrame((state) => {
    if (!groupRef.current || !linesRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate the entire structure as one object
    groupRef.current.rotation.y = time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
    groupRef.current.rotation.z = Math.cos(time * 0.05) * 0.1;

    // Gentle floating motion
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.5;

    // Update line colors with animated gradient
    const lineColors: number[] = [];
    connections.forEach((connection, idx) => {
      const hue = (time * 0.05 + idx * 0.01) % 1;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

      lineColors.push(color.r, color.g, color.b, 0.3);
      lineColors.push(color.r, color.g, color.b, 0.3);
    });

    if (linesRef.current.geometry.attributes.color) {
      const colorAttribute = linesRef.current.geometry.attributes.color;
      for (let i = 0; i < lineColors.length; i++) {
        colorAttribute.array[i] = lineColors[i];
      }
      colorAttribute.needsUpdate = true;
    }
  });

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(nodeCount * 3);
    nodes.forEach((node, i) => {
      positions[i * 3] = node.x;
      positions[i * 3 + 1] = node.y;
      positions[i * 3 + 2] = node.z;
    });
    return positions;
  }, [nodes, nodeCount]);

  const linePositions = useMemo(() => {
    const positions = new Float32Array(connections.length * 6);
    connections.forEach((connection, i) => {
      const [start, end] = connection;
      positions[i * 6] = nodes[start].x;
      positions[i * 6 + 1] = nodes[start].y;
      positions[i * 6 + 2] = nodes[start].z;
      positions[i * 6 + 3] = nodes[end].x;
      positions[i * 6 + 4] = nodes[end].y;
      positions[i * 6 + 5] = nodes[end].z;
    });
    return positions;
  }, [connections, nodes]);

  const lineColors = useMemo(() => {
    const colors = new Float32Array(connections.length * 8);
    connections.forEach((_, i) => {
      const color = new THREE.Color().setHSL(i * 0.01, 0.8, 0.6);
      colors[i * 8] = color.r;
      colors[i * 8 + 1] = color.g;
      colors[i * 8 + 2] = color.b;
      colors[i * 8 + 3] = 0.3;
      colors[i * 8 + 4] = color.r;
      colors[i * 8 + 5] = color.g;
      colors[i * 8 + 6] = color.b;
      colors[i * 8 + 7] = 0.3;
    });
    return colors;
  }, [connections]);

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodeCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.25 : 0.2}
          color="#7061ff"
          transparent
          opacity={0.95}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
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
