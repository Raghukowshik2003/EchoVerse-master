// src/components/VisionProScene.tsx

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { useSpring as useSpringThree, a as aThree, config as springConfig, SpringValue } from '@react-spring/three';
import { useSpring as useSpringWeb, a as aWeb } from '@react-spring/web';
import * as THREE from 'three';
import { LinkPreview } from '@/components/ui/link-preview';

// --- Props Interface ---
interface VisionProSceneProps {
  startAnimation: boolean;
  onAnimationComplete: () => void;
  isVRModeVisible: boolean;
}

// --- ADD ModelAndAnimation Props ---
interface ModelAndAnimationProps extends VisionProSceneProps {
  onModelPointerOver: () => void;
  onModelPointerOut: () => void;
}

// Helper function (remains the same)
const getArrayValue = (springVal: SpringValue<number[]>): number[] | null => {
    const val = springVal.get();
    return Array.isArray(val) && val.length === 3 ? val : null;
}

// --- Inner Component for Model and 3D Animations ---
// (ModelAndAnimation component remains the same as the previous version)
function ModelAndAnimation({ startAnimation, onAnimationComplete, isVRModeVisible,  onModelPointerOver,
  onModelPointerOut }: ModelAndAnimationProps){
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/vision_pro.glb');
  const { camera } = useThree();

  const initialCameraPos = useRef<THREE.Vector3 | null>(null);
  const initialModelRotation = useRef<THREE.Euler | null>(null);
  const modelInitialY = useRef<number>(0);
  const isAnimating = useRef(false);

  // --- Capture Initial States ---
  useEffect(() => {
    // Reset refs if the component remounts due to key change
    initialCameraPos.current = null;
    initialModelRotation.current = null;
    modelInitialY.current = 0;
    console.log("VisionProScene: ModelAndAnimation mounted/remounted.");

    if (camera) { // Capture camera immediately if available
        initialCameraPos.current = camera.position.clone();
        console.log("VisionProScene: Initial Camera Pos Captured:", initialCameraPos.current);
    }
    if (group.current) { // Capture model rotation/pos immediately if available
        initialModelRotation.current = group.current.rotation.clone();
        modelInitialY.current = group.current.position.y;
        console.log("VisionProScene: Initial Model Rotation Captured:", initialModelRotation.current);
        console.log("VisionProScene: Initial Model Y Captured:", modelInitialY.current);
    }
  }, [camera]); // Depend only on camera, group ref is stable once mounted

  // --- Springs for 3D elements ---
  const [modelSpring, modelApi] = useSpringThree(() => ({
    rotation: initialModelRotation.current?.toArray().slice(0, 3) as [number, number, number] || [0, 0, 0], // Initialize from ref if possible
    config: springConfig.gentle,
  }));

  const [cameraSpring, cameraApi] = useSpringThree(() => ({
    cameraPosition: initialCameraPos.current?.toArray() || [0, 0, 5], // Initialize from ref if possible
    config: springConfig.gentle,
    onRest: (result) => {
      if (isAnimating.current && result.finished) {
        console.log("VisionProScene: Camera 'Enter VR' animation finished.");
        isAnimating.current = false;
        onAnimationComplete(); // Signal page.tsx
      } else if (!result.finished && isAnimating.current) {
         console.log("VisionProScene: Camera 'Enter VR' animation interrupted.");
         isAnimating.current = false;
      }
    },
  }));

  // --- Set Initial Spring State (more robustly on mount/remount) ---
  useEffect(() => {
    // This effect now runs reliably when the component mounts/remounts
    if (initialModelRotation.current) {
      const rotArray = initialModelRotation.current.toArray().slice(0, 3).filter((v): v is number => typeof v === 'number');
      if (rotArray.length === 3) {
        // Use 'to' and 'immediate' to ensure it snaps to the correct initial state on remount
        modelApi.start({ to: { rotation: rotArray as [number, number, number] }, immediate: true });
      }
    } else if (group.current) {
        // Fallback if ref wasn't ready instantly
        modelApi.start({ to: { rotation: group.current.rotation.toArray().slice(0,3) as [number, number, number] }, immediate: true });
    }

    if (initialCameraPos.current) {
      // Use 'to' and 'immediate'
      cameraApi.start({ to: { cameraPosition: initialCameraPos.current.toArray() }, immediate: true });
    } else if (camera) {
        // Fallback if ref wasn't ready instantly
        cameraApi.start({ to: { cameraPosition: camera.position.toArray() }, immediate: true });
    }
  }, [initialModelRotation, initialCameraPos, modelApi, cameraApi, camera, group]); // Add camera/group refs


  // --- Animation Sequence Trigger ---
  useEffect(() => {
    // No changes needed here, logic remains the same
    // It will use the freshly captured initial states if remounted

    if (!initialCameraPos.current || !initialModelRotation.current || !group.current) {
      console.log("VisionProScene: Waiting for initial states...");
      return;
    }

    // --- START 'ENTER VR' ANIMATION ---
    if (startAnimation && !isAnimating.current) {
      isAnimating.current = true;
      console.log("VisionProScene: Starting 'Enter VR' animation sequence...");

      const currentGroupRotation = group.current.rotation.clone();
      const currentCameraPosition = camera.position.clone();
      console.log("VisionProScene: Animating FROM Cam Pos:", currentCameraPosition);
      console.log("VisionProScene: Animating FROM Model Rot:", currentGroupRotation);

      const targetRotationY = currentGroupRotation.y + Math.PI;
      const targetCameraX = 3.55;
      const targetCameraY = modelInitialY.current - 0.7;
      const targetCameraZ = 0.1; // Adjust as needed
      const enterVrConfig = { tension: 110, friction: 40 };

      const runAnimation = async () => {
        try {
            await modelApi.start({
              from: { rotation: currentGroupRotation.toArray().slice(0, 3) as [number, number, number] },
              to: { rotation: [currentGroupRotation.x, targetRotationY, currentGroupRotation.z] },
              reset: true,
              config: enterVrConfig,
            });
            console.log("VisionProScene: Model rotation to back finished.");

            await cameraApi.start({
              from: { cameraPosition: currentCameraPosition.toArray() },
              to: { cameraPosition: [targetCameraX, targetCameraY, targetCameraZ] },
              reset: true,
              config: enterVrConfig,
            });
            console.log("VisionProScene: Camera zoom to back started (onRest will handle completion).");

        } catch (error) {
            console.error("VisionProScene: Animation error:", error);
            isAnimating.current = false;
        }
      };
      runAnimation();

    // --- RESET ANIMATION (Handles reset if animation was interrupted before exit) ---
    } else if (!startAnimation && isAnimating.current) {
        // If exiting VR mode *while* the enter animation is still running, force stop/reset
        console.log("VisionProScene: Resetting due to exit during animation...");
        isAnimating.current = false; // Stop animation flag
        modelApi.stop(); // Stop any ongoing spring animations
        cameraApi.stop();
        // Immediately snap back to initial state (or start gentle animation)
        if (initialModelRotation.current) {
            const rotArray = initialModelRotation.current.toArray().slice(0, 3).filter((v): v is number => typeof v === 'number');
            if (rotArray.length === 3) modelApi.start({ to: { rotation: rotArray as [number, number, number] }, immediate: true }); // Immediate reset
        }
        if (initialCameraPos.current) {
            cameraApi.start({ to: { cameraPosition: initialCameraPos.current.toArray() }, immediate: true }); // Immediate reset
        }
    }
    // No explicit reset needed here anymore if not animating, as remount handles it
  }, [startAnimation, modelApi, cameraApi, initialCameraPos, initialModelRotation, group, camera, onAnimationComplete]); // Dependencies

  // --- Apply Camera Animation ---
  // --- Apply Camera Animation AND Floating Effect ---
useFrame((state, delta) => { // <-- Make sure 'state' is included here
  // Apply camera position ONLY if the main animation is running
  if (isAnimating.current) { // <-- Keep this part for camera animation
      const pos = getArrayValue(cameraSpring.cameraPosition);
      if (pos) {
        camera.position.set(pos[0], pos[1], pos[2]);
        camera.lookAt( 0, modelInitialY.current, 0 );
      }
  }

  // --- Floating Effect --- // <--- ADD THIS NEW BLOCK
  // Apply ONLY when not animating and not in VR mode
  if (!startAnimation && !isAnimating.current && group.current) {
      const elapsedTime = state.clock.getElapsedTime();
      // Parameters for floating effect (ADJUST THESE)
      const floatFrequency = 0.3; // How fast it bobs
      const floatAmplitude = 0.03; // How high/low it bobs

      // Calculate the vertical offset using a sine wave
      const yOffset = Math.sin(elapsedTime * floatFrequency * Math.PI * 2) * floatAmplitude;

      // Apply the offset to the base Y position (captured in modelInitialY.current)
      group.current.position.y = modelInitialY.current + yOffset;
  }

  // --- REMOVED AUTOMATIC ROTATION ---
  // The old rotation block is now gone or commented out.
});

// --- Event Handlers for Model Hover ---
const handlePointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
  event.stopPropagation(); // Prevent bubbling to canvas/container if needed
  if (!startAnimation) { // Only trigger hover effect if not animating/in VR mode
      document.body.style.cursor = 'pointer'; // Change cursor
      onModelPointerOver(); // Call parent callback
  }
}, [startAnimation, onModelPointerOver]);

const handlePointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
  event.stopPropagation();
  document.body.style.cursor = 'auto'; // Reset cursor
  onModelPointerOut(); // Call parent callback
}, [startAnimation, onModelPointerOut]); // Include startAnimation dependency
// ------------------------------------
  // --- Render Model ---
  return (
    <aThree.group
      ref={group}
      rotation={modelSpring.rotation as any}
      scale={2.8}
      position={[0, -0.1, 0]}
      dispose={null}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={scene} scale={1.8} position={[0, 0, 0]} />
    </aThree.group>
  );
}


// --- Main Scene Component ---
const VisionProScene: React.FC<VisionProSceneProps> = ({ startAnimation, onAnimationComplete, isVRModeVisible }) => {
  const initialCamPos: [number, number, number] = [12, 3.4, 0];
  const initialFov = 14;
 

  const [isModelHovered, setIsModelHovered] = useState(false);

  const [containerSpring, containerApi] = useSpringWeb(() => ({
    opacity: 1,
    config: { duration: 300 }
  }));

  useEffect(() => {
    if (isVRModeVisible) {
      console.log("VisionProScene: Fading out container...");
      containerApi.start({ opacity: 0 });
    } else {
      // Only fade in if not already fully opaque
      if (containerSpring.opacity.get() < 1) {
          console.log("VisionProScene: Fading in container...");
          containerApi.start({ opacity: 1 });
      }
    }
  }, [isVRModeVisible, containerApi, containerSpring.opacity]);

  const containerBaseStyle: React.CSSProperties = {
    position: 'relative', width: '1000px', height: '530px',
     zIndex: 1, backgroundColor: 'transparent',
    transition: 'width 0.3s ease, height 0.3s ease',
  };
  const containerFullscreenStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 40, cursor: 'default', backgroundColor: 'black',
  };

  const combinedStyle = {
    ...(startAnimation ? containerFullscreenStyle : containerBaseStyle),
    opacity: containerSpring.opacity,
  };

  // Determine the key for the Canvas based on the animation state
  const canvasKey = startAnimation ? 'fullscreen' : 'initial';
  console.log(`VisionProScene: Rendering Canvas with key: ${canvasKey}, background: ${startAnimation ? 'black' : 'transparent'}`);

  return (
    <LinkPreview
      // url={previewUrl} // <-- REMOVED
      
      imageSrc="/previewimg.png" // <-- ADDED: Path to your image in /public/images/
      width={300} // <-- Optional: Adjust width
      height={180} // <-- Optional: Adjust height
      className="block"
      open={isModelHovered && !startAnimation && !isVRModeVisible}
      onOpenChange={setIsModelHovered}
    >
    <aWeb.div style={combinedStyle}>
      <Canvas
        // *** ADD/USE KEY TO FORCE REMOUNT ON STATE CHANGE ***
        key={canvasKey}
        camera={{ position: initialCamPos, fov: initialFov, near: 2 }}
        gl={{ alpha: true }} // Keep alpha buffer enabled
        // Style depends on startAnimation state
        style={{ background: startAnimation ? 'black' : 'transparent' }}
      >
        {/* Content inside Canvas will also be remounted */}
        <ambientLight intensity={startAnimation ? 0.5 : 0.8} />
        <Environment preset="city" />
        <React.Suspense fallback={null}>
          <ModelAndAnimation
            startAnimation={startAnimation}
            onAnimationComplete={onAnimationComplete}
            isVRModeVisible={isVRModeVisible}
            onModelPointerOver={() => setIsModelHovered(true)}
            onModelPointerOut={() => setIsModelHovered(false)}
          />
        </React.Suspense>
      </Canvas>
    </aWeb.div>
    </LinkPreview>
  );
};

useGLTF.preload('/vision_pro.glb');
export default VisionProScene;

