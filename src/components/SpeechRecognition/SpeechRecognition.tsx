// src/components/SpeechRecognition/SpeechRecognition.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react'; // Or your preferred icons

// Define the props for the component
interface SpeechRecognitionComponentProps {
    setSourceText: (text: string) => void;
    getLanguageCode: (language: string) => string;
    selectedLanguage: string; // Keep this if needed for recognition language
    // iconSize?: number; // Keep if you want a fallback icon size
    renderTrigger?: (
        startListening: () => void,
        stopListening: () => void,
        isListening: boolean
    ) => React.ReactNode; // <<< ADD RENDER PROP
    onListeningChange?: (isListening: boolean) => void; // Optional: Callback for state changes
}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionComponentProps> = ({
    setSourceText,
    getLanguageCode,
    selectedLanguage,
    // iconSize = 24, // Default fallback size
    renderTrigger, // <<< GET RENDER PROP
    onListeningChange,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);

    // --- Initialize Speech Recognition ---
    useEffect(() => {
        // Check for browser support first
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after first utterance
        recognition.interimResults = false; // We only want final results
        // recognition.lang = getLanguageCode(selectedLanguage); // Set language dynamically if needed

        recognition.onstart = () => {
            console.log("Speech recognition started");
            setIsListening(true);
            onListeningChange?.(true); // Notify parent
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            console.log("Transcript:", transcript);
            setSourceText(transcript); // Update the source text in the parent
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
               // Handle specific errors, maybe show a message
            }
             setIsListening(false); // Ensure state is reset on error
             onListeningChange?.(false); // Notify parent
        };

        recognition.onend = () => {
            console.log("Speech recognition ended");
            setIsListening(false);
             onListeningChange?.(false); // Notify parent
        };

        setRecognitionInstance(recognition);

        // Cleanup function
        return () => {
            recognition.stop(); // Ensure recognition stops if component unmounts while listening
        };
    // }, [getLanguageCode, selectedLanguage, setSourceText, onListeningChange]); // Adjust dependencies if lang changes
     }, [setSourceText, onListeningChange]); // Simplified dependencies if lang isn't set here

    // --- Control Functions ---
    const startListening = useCallback(() => {
        if (recognitionInstance && !isListening) {
             // Optional: Update language just before starting if needed
             // recognitionInstance.lang = getLanguageCode(selectedLanguage);
            try {
                recognitionInstance.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
                setIsListening(false); // Reset state if start fails
                onListeningChange?.(false);
            }
        }
    }, [recognitionInstance, isListening, onListeningChange]); // Add getLanguageCode, selectedLanguage if lang is updated here

    const stopListening = useCallback(() => {
        if (recognitionInstance && isListening) {
            recognitionInstance.stop();
            // onend handler will set isListening to false
        }
    }, [recognitionInstance, isListening]);

    // --- Render Logic ---
    if (renderTrigger) {
        // If renderTrigger is provided, use it
        return renderTrigger(startListening, stopListening, isListening);
    }

    // --- Fallback UI (Original Icon Button) ---
    // Keep this if you want the component to be usable without the new UI
    // return (
    //     <button
    //         onClick={isListening ? stopListening : startListening}
    //         title={isListening ? "Stop Listening" : "Start Listening"}
    //         className="p-2 rounded-full hover:bg-gray-700 transition-colors" // Example fallback style
    //         aria-label={isListening ? "Stop Listening" : "Start Listening"}
    //     >
    //         {isListening
    //             ? <IconMicrophoneOff size={iconSize} className="text-red-500" />
    //             : <IconMicrophone size={iconSize} className="text-white" />
    //         }
    //     </button>
    // );

    // If no renderTrigger and no fallback, render nothing or a placeholder
     return null; // Or return the fallback UI above
};

export default SpeechRecognitionComponent;

