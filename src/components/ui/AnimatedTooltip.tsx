// src/components/ui/AnimatedTooltip.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';

// Define the type for each item in the items array
interface Item {
  id: number;
  name: string;
  designation: string;
  image: string;
}

// Define the props for the AnimatedTooltip component
interface AnimatedTooltipProps {
  items: Item[];
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Spring animation for smooth motion
  const springConfig = { stiffness: 100, damping: 5 };

  // Track mouse x position relative to the hovered element
  const x = useMotionValue(0);

  // Rotate the tooltip based on mouse position
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]), // Map x range to rotation range
    springConfig
  );

  // Translate the tooltip horizontally based on mouse position
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]), // Map x range to translation range
    springConfig
  );

  // Handle mouse move event
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    // Calculate mouse x position relative to the center of the element
    const relativeX = event.clientX - rect.left - rect.width / 2;
    x.set(relativeX);
  };

  // Handle mouse enter event
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, itemId: number) => {
    setHoveredIndex(itemId);
    // Immediately set initial position on enter
    handleMouseMove(event);
  };

  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative -mr-4" // Keep overlapping style
          onMouseEnter={(e) => handleMouseEnter(e, item.id)} // Use updated handler
          onMouseLeave={() => {
            setHoveredIndex(null);
            x.set(0); // Reset x on leave
          }}
          onMouseMove={handleMouseMove} // Track mouse move on the wrapper
        >
          {/* Use AnimatePresence for exit animations */}
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                // Animation props from Vue example
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 260, damping: 10 },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                // Dynamic styles for following mouse
                style={{
                  translateX: translateX, // Apply horizontal translation
                  rotate: rotate, // Apply rotation
                  whiteSpace: 'nowrap', // Ensure text doesn't wrap
                }}
                // Tooltip styling from Vue example
                className="absolute -left-1/2 -top-16 z-50 flex translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
              >
                {/* Gradient lines from Vue example */}
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-1/5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-2/5 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

                {/* Tooltip content */}
                <div className="relative z-30 text-base font-bold text-white">
                  {item.name}
                </div>
                <div className="text-xs text-white">
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Image */}
          <Image
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-14 w-14 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
};
