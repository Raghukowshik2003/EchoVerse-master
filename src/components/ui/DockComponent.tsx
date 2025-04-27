// src/components/ui/DockComponent.tsx
"use client";

import React from "react";
// Ensure this path is correct
import { Dock, DockIcon } from "@/components/magicui/dock";

// Removed the IconProps type and the Icons object as they are no longer needed

// --- Define Props for DockComponent ---
interface DockComponentProps {
    onFileUpload?: () => void;
    onShare?: () => void;
    onCopy?: () => void; // Keep if you plan to add a copy icon later
    onDownloadPdf?: () => void;
    onDownloadMp3?: () => void;
    isTargetTextPresent?: boolean; // To enable/disable copy/mp3
    isAnyTextPresent?: boolean; // To enable/disable pdf
    copied?: boolean; // To show copy feedback
}

export const DockComponent: React.FC<DockComponentProps> = ({
    onFileUpload = () => console.warn("onFileUpload not provided"),
    onShare = () => console.warn("onShare not provided"),
    onCopy = () => console.warn("onCopy not provided"), // Keep handler if needed
    onDownloadPdf = () => console.warn("onDownloadPdf not provided"),
    onDownloadMp3 = () => console.warn("onDownloadMp3 not provided"),
    isTargetTextPresent = false,
    isAnyTextPresent = false,
    copied = false,
}) => {
  // Define base path for icons - pointing directly to the public root
  const iconBasePath = "/"; // Icons are directly in /public/

  return (
    <div className="relative"> {/* Keep the relative wrapper */}
      <Dock iconMagnification={60} iconDistance={100}>
        {/* File Upload */}
        <DockIcon
          onClick={onFileUpload}
          className={"bg-white/70 dark:bg-white/50 flex flex-col items-center justify-center "}
          title="Upload File"
        >
          {/* Use img tag pointing to your public icon */}
          <img
            src={`${iconBasePath}ufile.png`} // Use your specific filename
            alt="Upload"
            className="size-2 sm:size-8" // Apply size classes
          />
        </DockIcon>

        {/* Share */}
        <DockIcon
          onClick={onShare}
          className={"bg-white/70 dark:bg-white/10 flex flex-col items-center justify-center "}
          title="Share"
        >
           {/* Use img tag pointing to your public icon */}
           <img
            src={`${iconBasePath}shareicon.png`} // Use your specific filename
            alt="Share"
            className="size-6 sm:size-8" // Apply size classes
          />
        </DockIcon>

        {/* Download PDF */}
        <DockIcon
          onClick={isAnyTextPresent ? onDownloadPdf : undefined}
          className={`bg-white/70 dark:bg-white/10 flex flex-col items-center justify-center ${!isAnyTextPresent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Download PDF"
        >
           {/* Use img tag pointing to your public icon */}
           <img
            src={`${iconBasePath}dpdf.png`} // Use your specific filename
            alt="Download PDF"
            className="size-6 sm:size-8" // Apply size classes
          />
        </DockIcon>

        {/* Download MP3 */}
        <DockIcon
          onClick={isTargetTextPresent ? onDownloadMp3 : undefined}
          className={`bg-white/70 dark:bg-white/10 flex flex-col items-center justify-center ${!isTargetTextPresent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Download MP3"
        >
           {/* Use img tag pointing to your public icon */}
           <img
            src={`${iconBasePath}daudio.png`} // Use your specific filename
            alt="Download MP3"
            className="size-6 sm:size-8" // Apply size classes
          />
        </DockIcon>

        

      </Dock>
    </div>
  );
};
