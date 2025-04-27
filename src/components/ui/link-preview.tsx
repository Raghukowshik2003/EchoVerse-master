"use client";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import Image from 'next/image';


import { encode } from "qss";
import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  className?: string;
  imageSrc: string; 
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Callback for state changes
};

export const LinkPreview = ({
  children,
  imageSrc, 
  className,
  width = 200,
  height = 125,
  quality = 50,
  layout = "fixed",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: LinkPreviewProps) => {

  const src = imageSrc;


  // Internal open state if not controlled
  const [internalOpen, setInternalOpen] = React.useState(false);
  // Determine if the component is controlled
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  // Use controlled state if available, otherwise internal state
  const isOpen = isControlled ? controlledOpen : internalOpen;
  // Function to update state (calls external callback if controlled)
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);

  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2; // Reduce the effect to make it subtle
    x.set(offsetFromCenter);
  };

  return (
    <>
      <HoverCardPrimitive.Root
        
        open={isOpen}
        onOpenChange={setIsOpen}
        openDelay={50}
        closeDelay={100}
        
      >
        <HoverCardPrimitive.Trigger asChild 
          onMouseMove={handleMouseMove} 
        >
          {React.isValidElement(children) ? children : <span>{children}</span>}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="[transform-origin:var(--radix-hover-card-content-transform-origin)] z-50"
          side="top"
          align="center"
          sideOffset={10}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 260,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="shadow-xl rounded-xl"
                style={{
                  x: translateX,
                }}
              >
                {/* --- Changed <a> to <div> --- */}
                <div
                  // Removed href, target, rel
                  className="block border-2 border-transparent shadow rounded-xl overflow-hidden" // Removed hover border styles as it's not a link
                  style={{ fontSize: 0 }} // Keep to collapse potential text nodes
                  // Keep mouse enter/leave to prevent closing when moving onto the preview
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <Image
                    src={src} // Use the imageSrc directly
                    width={width}
                    height={height}
                    className="rounded-lg bg-white" // Keep background for loading state
                    alt="Preview image"
                    priority={isOpen} // Prioritize loading when open
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};
