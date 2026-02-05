import { Canvas } from '@react-three/fiber';
import { NeuralNetwork } from './NeuralNetwork';
import { useLayoutEffect, useRef, useState } from 'react';

export function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSize({ width: rect.width, height: rect.height });
        }
      }
    };

    // Get size immediately before paint
    updateSize();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
      <div
        ref={containerRef}
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
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          resize={{ scroll: false, debounce: 0 }}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
          onCreated={({ gl, size }) => {
            // Force canvas to use container dimensions
            gl.setSize(size.width, size.height);
          }}
        >
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
