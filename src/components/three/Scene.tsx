import { Canvas, useFrame as useFrameExport } from '@react-three/fiber';
import { NeuralNetwork } from './NeuralNetwork';
import { useEffect, useRef } from 'react';

function AnimationStarter() {
  const started = useRef(false);

  useFrameExport((state) => {
    if (!started.current) {
      started.current = true;
      // Force a few renders to ensure visibility
      state.gl.render(state.scene, state.camera);
    }
  });

  return null;
}

export function Scene() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force a repaint on mount
    if (canvasRef.current) {
      const canvas = canvasRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.opacity = '0.99';
        setTimeout(() => {
          canvas.style.opacity = '1';
        }, 10);
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
      <div
        ref={canvasRef}
        style={{
          width: '70vw',
          height: '70vh',
          maxWidth: '800px',
          maxHeight: '800px',
          minWidth: '400px',
          minHeight: '400px',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          dpr={[1, 2]}
          frameloop="always"
          flat
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
        >
          <AnimationStarter />
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00c5f5" />
          <NeuralNetwork />
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 dark:to-[#0a0a0f]/90 pointer-events-none" style={{ zIndex: 1 }} />
    </div>
  );
}
