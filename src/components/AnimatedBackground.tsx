'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TOTAL_BUBBLES = 24;

const createSeededRandom = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const AnimatedBackground = () => {
  const palette = useMemo(
    () => [
      'rgba(255, 107, 0, 0.35)',
      'rgba(0, 198, 255, 0.3)',
      'rgba(13, 37, 63, 0.25)',
    ],
    [],
  );

  const bubbles = useMemo(() => {
    const random = createSeededRandom(20240914);
    const range = (min: number, max: number) => min + (max - min) * random();

    return Array.from({ length: TOTAL_BUBBLES }).map((_, i) => ({
      width: range(20, 80),
      height: range(18, 75),
      opacity: range(0.15, 0.4),
      left: `${range(2, 98)}%`,
      x: range(-120, 120),
      duration: range(18, 32),
      delay: range(0, 6),
      backgroundColor: palette[i % palette.length],
    }));
  }, [palette]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: bubble.width,
            height: bubble.height,
            opacity: bubble.opacity,
            left: bubble.left,
            bottom: -120,
            backgroundColor: bubble.backgroundColor,
            filter: 'blur(1px)',
          }}
          animate={{
            y: '-120vh',
            x: bubble.x,
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
