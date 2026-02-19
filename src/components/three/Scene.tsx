import { Canvas } from '@react-three/fiber';
import { NeuralNetwork } from './NeuralNetwork';
import React, { useLayoutEffect, useRef, useState } from 'react';

export const Scene: React.FC = () => {
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
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black" style={{ zIndex: 1 }}>
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 55 }}
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
          <NeuralNetwork />
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/100 dark:bg-gradient-to-b dark:from-transparent dark:via-transparent dark:to-[#0a0a0f]/90 pointer-events-none" style={{ zIndex: 2 }} />
    </div>
  );
}
