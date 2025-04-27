// src/components/Inputs/TextArea.tsx
import React, { ChangeEvent } from 'react';

import { cn } from "@/lib/utils"; 
// Define the props interface
interface TextAreaProps {
    id: string; 
    value: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void; 
    placeholder?: string;
    maxWords?: number; 
    className?: string; 
    readOnly?: boolean; 
    
}

const TextArea: React.FC<TextAreaProps> = ({
    id,
    value,
    onChange,
    placeholder,
    maxWords, 
    className,
    readOnly, 
   
}) => {

    // Prevent onChange call if readOnly is true
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!readOnly && onChange) {
            onChange(e);
        }
    };

    return (
        <textarea
            id={id}
            value={value}
            onChange={handleChange} 
            placeholder={placeholder}
            readOnly={readOnly} 
           
            className={cn(
                // Base styles suitable for the VR mode and general use
                "w-full h-full p-2", 
                "border-none", 
                "rounded", 
                "bg-red", 
                "text-neutral-200", 
                "placeholder-neutral-500", 
                "focus:outline-none focus:ring-0", 
                "resize-none", 
                readOnly ? "cursor-default" : "",
                className 
            )}
           
        />
    );
};

export default TextArea;
