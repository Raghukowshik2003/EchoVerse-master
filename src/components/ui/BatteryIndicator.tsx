// src/components/UI/BatteryIndicator.tsx
import React from 'react'; // <-- Added React import for clarity
import {
    BatteryChargingIcon,
    BatteryFullIcon,
    BatteryIcon, // <-- Keep this for the null case
    BatteryLowIcon,
    BatteryMediumIcon,
    BatteryWarningIcon,
    InfinityIcon,
} from "lucide-react";

// --- IMPORTANT: Update this path if necessary ---
import { cn } from "@/lib/utils"; // <-- Use your project's cn path

type BatteryInfoProps = {
    level: number | null;
    isCharging: boolean | null;
    chargingTime: number | null;
    dischargingTime: number | null;
    className?: string;
};

export const BatteryIndicator = ({
    level,
    isCharging,
    chargingTime,
    dischargingTime,
    className,
}: BatteryInfoProps) => {
    const getBatteryIcon = (level: number | null, isCharging: boolean | null) => {
        // Handle null level explicitly first
        if (level === null) {
            // You might want a specific "unknown" icon or use the base BatteryIcon
            return <BatteryIcon className="size-5 text-gray-500" />; // Example: Gray for unknown
        }
        if (isCharging) {
            return <BatteryChargingIcon className="size-5 text-blue-500" />;
        }
        if (level >= 90) {
            return <BatteryFullIcon className="size-5 text-emerald-500" />;
        }
        if (level >= 50) {
            return <BatteryMediumIcon className="size-5 text-lime-500" />;
        }
        if (level >= 20) {
            return <BatteryLowIcon className="size-5 text-yellow-500" />;
        }
        // Level is < 20 and not null
        return <BatteryWarningIcon className="size-5 text-red-500" />;
    };

    const getTextColor = (level: number | null) => {
        if (level === null) {
            return "text-gray-500"; // Match unknown icon color
        }
        // Keep original logic for known levels
        if (level >= 90) { // Adjusted threshold to match icon logic better
            return "text-emerald-500";
        }
        if (level >= 50) {
            return "text-lime-500";
        }
        if (level >= 20) {
            return "text-yellow-500";
        }
        return "text-red-500";
    };

    const formatTime = (time: number | null) => {
        if (time === null || time <= 0) { // Handle 0 or null
            return "";
        }
        if (!Number.isFinite(time)) {
            // Infinity often means charging is complete or calculation isn't possible yet
            return isCharging ? "Full" : <InfinityIcon className="inline size-3" />;
        }
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        if (hours > 23) {
            return ">1d"; // More than 1 day
        }
        // Show minutes only if less than an hour, otherwise show both
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const formattedLevel = level !== null ? `${Math.round(level)}%` : "N/A";
    const timeToShow = isCharging ? chargingTime : dischargingTime;
    const formattedTime = formatTime(timeToShow);

    return (
        <div
            className={cn(
                // Base styles from your component
                "inline-flex items-center space-x-2 rounded-lg border border-neutral-700/50 bg-black/30 px-2 py-1 shadow-sm",
                // Removed dark mode specifics, assuming VR mode has its own theme
                // Removed hover effect for VR context unless desired
                // Adjusted padding/rounding slightly for potentially smaller VR UI elements
                className, // Allow overrides
            )}
            title={ // Add a tooltip for more info
                `Battery: ${formattedLevel}` +
                (isCharging ? ` (Charging${formattedTime ? `, ${formattedTime} to full` : ''})` : '') +
                (!isCharging && formattedTime ? ` (${formattedTime} remaining)` : '')
            }
        >
            {getBatteryIcon(level, isCharging)}
            <div className="flex flex-col items-start -space-y-1"> {/* Adjusted spacing */}
                <span className={`font-medium text-xs ${getTextColor(level)}`}> {/* Slightly smaller text */}
                    {formattedLevel}
                </span>
                {/* Only show time if available */}
                {formattedTime && (
                    <span className="flex items-center text-neutral-400 text-[10px]"> {/* Even smaller text */}
                        {isCharging && <span className="mr-1">⚡1</span>}
                        {formattedTime}
                    </span>
                )}
            </div>
        </div>
    );
};

// Optional: Export default if it's the only export in the file
// export default BatteryIndicator;
