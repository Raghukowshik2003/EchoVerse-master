// src/components/ui/Lightning.tsx
import React, { useRef, useEffect } from "react";

interface LightningProps {
  hue?: number;
  xOffset?: number; // Positioning the line horizontally
  intensity?: number; // Overall brightness
  speed?: number; // Controls subtle animation speed
  size?: number; // Controls subtle animation texture size
  taperMin?: number; // Minimum thickness multiplier (0.0 to 1.0, for narrow end)
  taperMax?: number; // Maximum thickness multiplier (>= taperMin, for wide end)
}

const Lightning: React.FC<LightningProps> = ({
  hue = 230,
  xOffset = 0,
  intensity = 1,
  speed = 0.3, // Default subtle speed
  size = 1.8, // Default subtle size
  taperMin = 0.3, // Default: Narrow end is 30% of base thickness
  taperMax = 1.0, // Default: Wide end is 100% of base thickness
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Update useEffect dependencies ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // --- MODIFIED FRAGMENT SHADER ---
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uIntensity;
      uniform float uSpeed; // Re-added
      uniform float uSize; // Re-added
      uniform float uTaperMin; // New uniform for taper
      uniform float uTaperMax; // New uniform for taper

      #define OCTAVE_COUNT 5 // Can reduce octaves for simpler noise

      // --- Re-added Noise Functions ---
      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45); // Keep rotation for some texture
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }
      // --- End Noise Functions ---


      // Convert HSV to RGB (Keep this utility)
      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          // Normalized pixel coordinates.
          vec2 uv = fragCoord / iResolution.xy; // 0 to 1
          uv = 2.0 * uv - 1.0; // -1 to 1

          // --- ASPECT RATIO CORRECTION (Assuming VERTICAL line) ---
          uv.y *= iResolution.y / iResolution.x;

          // --- APPLY OFFSET (Assuming VERTICAL line) ---
          uv.x += uXOffset;

          // --- RE-ADD SUBTLE JAGGEDNESS/MOVEMENT ---
          // Use a SMALL multiplier (e.g., 0.05 to 0.2) for subtlety
          float noiseAmplitude = 0.08;
          uv += noiseAmplitude * (2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0); // Added back with small amplitude

          // --- CALCULATE DISTANCE TO THE CENTER LINE (VERTICAL) ---
          float dist = abs(uv.x);

          // --- TAPER CALCULATION ---
          // Map uv.y from [-1, 1] to [0, 1] (0 = bottom, 1 = top)
          float taperFactor = (uv.y + 1.0) * 0.5;
          // Interpolate between min and max thickness based on vertical position
          // Use smoothstep for a potentially smoother transition near the ends
          // float taperMultiplier = mix(uTaperMin, uTaperMax, smoothstep(0.0, 1.0, taperFactor));
          float taperMultiplier = mix(uTaperMin, uTaperMax, taperFactor); // Linear taper

          // --- STEADY GLOW CALCULATION (No Flicker) ---
          float glowThickness = 0.04; // Base thickness (adjust as needed)
          float falloffSharpness = 1.8; // Edge sharpness (adjust as needed)

          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.85, 0.9)); // Slightly adjusted saturation/value

          // Apply taper to the thickness
          float currentThickness = glowThickness * taperMultiplier;

          // Calculate color based on distance, using tapered thickness
          vec3 col = baseColor * pow(currentThickness / dist, falloffSharpness) * uIntensity;

          // Clamp the color
          col = clamp(col, 0.0, 1.0);
          float alpha = pow(currentThickness / dist, falloffSharpness) ; // you can change this value for a softer or a harder fade.
          alpha = clamp(alpha, 0.0, 1.0); // Clamp alpha to [0, 1]
          fragColor = vec4(col, alpha);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;
    // --- END OF MODIFIED FRAGMENT SHADER ---

    // --- Restore compileShader FUNCTION ---
    const compileShader = (
      source: string, // <-- Parameter 'source'
      type: number    // <-- Parameter 'type'
    ): WebGLShader | null => {
        const shader = gl.createShader(type); // Now 'type' is defined
        if (!shader) {
            console.error("Unable to create shader of type", type);
            return null;
        }
        gl.shaderSource(shader, source); // Now 'source' is defined
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Shader compile error (${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'}):`, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };
    // --- END OF RESTORED FUNCTION ---

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) { console.error("Failed to compile shaders."); return; }

    const program = gl.createProgram();
    if (!program) { console.error("Unable to create WebGL program."); return; }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error("Program linking error:", gl.getProgramInfoLog(program)); return; }
    gl.useProgram(program);

    // (Vertex buffer setup remains the same)
    const vertices = new Float32Array([ -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1 ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // --- Get uniform locations (including new/re-added ones) ---
    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uHueLocation = gl.getUniformLocation(program, "uHue");
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed"); // Re-added
    const uSizeLocation = gl.getUniformLocation(program, "uSize"); // Re-added
    const uTaperMinLocation = gl.getUniformLocation(program, "uTaperMin"); // New
    const uTaperMaxLocation = gl.getUniformLocation(program, "uTaperMax"); // New

    const startTime = performance.now();
    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); // RGBA: Black with alpha 0 (fully transparent)
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      const currentTime = performance.now();
      gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      gl.uniform1f(uHueLocation, hue);
      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSpeedLocation, speed); // Set speed uniform
      gl.uniform1f(uSizeLocation, size); // Set size uniform
      gl.uniform1f(uTaperMinLocation, taperMin); // Set taper min uniform
      gl.uniform1f(uTaperMaxLocation, taperMax); // Set taper max uniform

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      // Optional: Add WebGL cleanup if needed
    };
  // --- Update dependencies ---
  }, [hue, xOffset, intensity, speed, size, taperMin, taperMax]); // Add new props

  return <canvas ref={canvasRef} className="w-full h-full relative"  style={{ backgroundColor: 'transparent' }} />;
};

export default Lightning;
