import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';

export function NeuralNetwork() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const nodeCount = isMobile ? 15 : isTablet ? 20 : 40;

  // Create nodes in a more structured spherical pattern
  const { nodes, connections } = useMemo(() => {
    const nodePositions: THREE.Vector3[] = [];
    const radius = 4; // Smaller, more contained sphere

    // Create nodes in a structured sphere
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = 1.2 * radius * Math.cos(theta) * Math.sin(phi);
      const y = radius / 1.1 * Math.sin(theta) * Math.sin(phi);
      const z = 1.2 * radius * Math.cos(phi);

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

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate the entire structure as one object
    groupRef.current.rotation.y = time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
    groupRef.current.rotation.z = Math.cos(time * 0.05) * 0.1;

    // Gentle floating motion
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.5;
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
      // Create gradient from purple to cyan based on connection index
      const t = i / connections.length;
      // const hue = 0.75 - t * 0.45; // Purple (0.75) to Cyan (0.5) to Blue (0.6)
      const lum = 0.6 - t * 0.65; // Luminosity (was 0.6)
      const color = new THREE.Color().setHSL(0.7, 0.95, lum);

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
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
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
