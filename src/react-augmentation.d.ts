// src/react-augmentation.d.ts
import 'react';

declare module 'react' {
  interface CSSProperties {
    // Allow any property starting with --
    [key: `--${string}`]: string | number | undefined;

    
  }
}
