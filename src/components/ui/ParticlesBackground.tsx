// src/components/ui/ParticlesBackground.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils"; // Ensure this path is correct

// Props interface: Added children, removed title/subtitle
interface ParticlesBackgroundProps {
    children?: React.ReactNode; // To render content inside
    particleCount?: number;
    noiseIntensity?: number;
    particleSize?: { min: number; max: number };
    className?: string;
}

// --- createNoise function remains exactly the same ---
function createNoise() {
    const permutation = [ 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180, ];
    const p = new Array(512);
    for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];
    function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(t: number, a: number, b: number) { return a + t * (b - a); }
    function grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15; const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    return {
        simplex3: (x: number, y: number, z: number) => {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
            x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
            const u = fade(x), v = fade(y), w = fade(z);
            const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
            return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
        },
    };
}
// --- End createNoise function ---

// --- COLOR_SCHEME ---
const COLOR_SCHEME = {
    light: { // Kept for reference, but not used
        particle: { color: "rgba(0, 0, 0, 0.07)" },
        background: "rgba(255, 255, 255, 0.1)",
    },
    dark: { // Always use this
        particle: { color: "rgba(255, 255, 255, 0.07)" }, // White particles
        background: "rgba(0, 0, 0, 0.1)", // Dark background for trails
    },
} as const;
// --- END COLOR_SCHEME ---

// --- Particle INTERFACE ---
interface Particle {
    x: number;
    y: number;
    size: number;
    velocity: { x: number; y: number };
    life: number;
    maxLife: number;
}
// --- END Particle INTERFACE ---

// Default export the component
export default function ParticlesBackground({
    children,
    particleCount = 2000,
    noiseIntensity = 0.003,
    particleSize = { min: 0.5, max: 2 },
    className,
}: ParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const noise = useRef(createNoise()).current;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = container.clientWidth * dpr;
            canvas.height = container.clientHeight * dpr;
            canvas.style.width = `${container.clientWidth}px`;
            canvas.style.height = `${container.clientHeight}px`;
            ctx.scale(dpr, dpr);
        };
        resizeCanvas();

        const particles: Particle[] = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
            y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
            size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
            velocity: { x: 0, y: 0 },
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50,
        }));

        const animate = () => {
            // --- Removed isDark check ---
            // const isDark = document.documentElement.classList.contains("dark");
            // const scheme = isDark ? COLOR_SCHEME.dark : COLOR_SCHEME.light;

            const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

            // --- Background Clearing ---
            // --- Always use DARK background color ---
            ctx.fillStyle = COLOR_SCHEME.dark.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // --- Particle Update and Draw ---
            for (const particle of particles) {
                particle.life += 1;
                if (particle.life > particle.maxLife) {
                    particle.life = 0;
                    particle.x = Math.random() * canvasWidth;
                    particle.y = Math.random() * canvasHeight;
                }
                const opacity = Math.sin((particle.life / particle.maxLife) * Math.PI) * 0.15;
                const n = noise.simplex3(particle.x * noiseIntensity, particle.y * noiseIntensity, Date.now() * 0.0001);
                const angle = n * Math.PI * 4;
                particle.velocity.x = Math.cos(angle) * 0.5;
                particle.velocity.y = Math.sin(angle) * 0.5;
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                if (particle.x < 0) particle.x = canvasWidth; if (particle.x > canvasWidth) particle.x = 0;
                if (particle.y < 0) particle.y = canvasHeight; if (particle.y > canvasHeight) particle.y = 0;

                // --- Always use DARK mode particle color (white with opacity) ---
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => { resizeCanvas(); };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [particleCount, noiseIntensity, particleSize, noise]);

    // --- JSX Output ---
    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
            {children && <div className="relative z-10 h-full w-full">{children}</div>}
        </div>
    );
}
