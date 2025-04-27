// src/components/ui/TranslateNowButton.tsx
'use client';
import React, { useState } from 'react';
import { Play } from 'lucide-react'; // <-- Import a relevant icon (e.g., Play)
import { Colors, Liquid } from '@/components/ui/liquid-gradient'; // <-- Adjust path if needed

// Define Colors (Keep or customize later to match your orange/blue theme)
const COLORS: Colors = {
    color1: '#FFFFFF', // White
    color2: '#ff7f01', // EchoVerse Orange
    color3: '#ff9a3d',
    color4: '#FCFCFE',
    color5: '#F9F9FD',
    color6: '#075ff5', // EchoVerse Blue
    color7: '#4a90e2',
    color8: '#0017E9', // Keep some darker blues/purples for contrast if desired
    color9: '#4743EF',
    color10: '#7D7BF4',
    color11: '#0B06FC',
    color12: '#C5C1EA',
    color13: '#1403DE',
    color14: '#B6BAF6',
    color15: '#C1BEEB',
    color16: '#290ECB',
    color17: '#3F4CC0',
};


// --- Define Props ---
interface TranslateNowButtonProps {
    onClick?: () => void; // Keep onClick optional if needed elsewhere
    type?: 'button' | 'submit' | 'reset'; // Add type prop
    disabled?: boolean; // Add disabled prop
    children?: React.ReactNode; // Add children prop for text/content
    className?: string; // Allow passing additional classes
}

const TranslateNowButton: React.FC<TranslateNowButtonProps> = ({
    onClick,
    type = 'button', // Default to 'button'
    disabled = false, // Default to not disabled
    children, // Use children prop
    className = '', // Default to empty string
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Combine base classes with any passed classes and disabled state styling
    const buttonClasses = `
        relative inline-block sm:w-48 w-40 h-[3.5em] mx-auto group dark:bg-black bg-white dark:border-white border-black border-2 rounded-full
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
    `;

    return (
        <div className='flex justify-center'> {/* Keep centering wrapper */}
            <button
                type={type} // <-- Use the type prop
                onClick={onClick}
                onMouseEnter={() => !disabled && setIsHovered(true)} // <-- Disable hover effect if disabled
                onMouseLeave={() => !disabled && setIsHovered(false)} // <-- Disable hover effect if disabled
                disabled={disabled} // <-- Use the disabled prop
                className={buttonClasses.trim()} // Apply combined classes
            >
                {/* --- Visual Effect Layers (Keep as is) --- */}
                {/* Only render complex effects if not disabled for performance? Optional */}
                {!disabled && (
                    <>
                        <div className='absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70'>
                            <span className='absolute inset-0 rounded-full bg-[#d9d9d9] filter blur-[6.5px]'></span>
                            <div className='relative w-full h-full overflow-hidden rounded-full'>
                                <Liquid isHovered={isHovered} colors={COLORS} />
                            </div>
                        </div>
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-full bg-[#010128] filter blur-[7.3px]'></div>
                        <div className='relative w-full h-full overflow-hidden rounded-full'>
                            <span className='absolute inset-0 rounded-full bg-[#d9d9d9]'></span>
                            <span className='absolute inset-0 rounded-full bg-black'></span>
                            <Liquid isHovered={isHovered} colors={COLORS} />
                            {[1, 2, 3, 4, 5].map((i) => (
                                <span
                                    key={i}
                                    className={`absolute inset-0 rounded-full border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${
                                        i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'
                                    }`}
                                ></span>
                            ))}
                            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-full filter blur-[15px] bg-[#006]'></span>
                        </div>
                    </>
                )}
                 {/* Fallback simple background for disabled state */}
                 {disabled && <div className="absolute inset-0 rounded-full bg-gray-700"></div>}
                {/* --- End of Visual Effect Layers --- */}


                {/* --- Use children prop for text/icon --- */}
                <span className={`absolute inset-0 flex items-center justify-center px-4 gap-2 rounded-full ${disabled ? 'text-gray-400' : 'group-hover:text-yellow-400 text-white'} text-lg font-semibold tracking-wide whitespace-nowrap`}>
                    {/* Render children if provided, otherwise default */}
                    {children || (
                        <>
                            <Play className={`w-5 h-5 flex-shrink-0 ${disabled ? 'fill-gray-400' : 'group-hover:fill-yellow-400 fill-white'}`} />
                            <span>Translate Now</span>
                        </>
                    )}
                </span>

            </button>
        </div>
    );
};

export default TranslateNowButton;
