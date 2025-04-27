// src/components/VRTranslateMode.tsx
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { IconX, IconCopy, IconDownload , IconTrash } from '@tabler/icons-react';
import { ClipLoader } from 'react-spinners';
import TextArea from './Inputs/TextArea';
import LanguageSelector from './Inputs/LanguageSelector';
import SpeechRecognitionComponent from './SpeechRecognition/SpeechRecognition';
import AnimatedMicButton from './ui/AnimatedMicButton';
import DetailedVoiceSelector from './Inputs/DetailedVoiceSelector';
import AnimatedSpeakerButton from './ui/AnimatedSpeakerButton';
import { DockComponent } from "./ui/DockComponent";
import { BatteryIndicator } from '@/components/ui/BatteryIndicator';
import { BorderBeam } from '@/components/magicui/borderbeam';
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { jsPDF } from 'jspdf'; // Import directly if always needed or keep dynamic

// --- Interface for BatteryManager (based on Web API) ---
interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number; // Time in seconds until full, or Infinity
    dischargingTime: number; // Time in seconds until empty, or Infinity
    level: number; // Level is 0.0 to 1.0
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

declare global {
    interface Navigator {
        getBattery?(): Promise<BatteryManager>;
    }
}

interface VoiceOption {
    id: string;
    name: string;
    languageCode: string;
    googleVoiceName: string;
    gender: 'Male' | 'Female';
}

interface VRTranslateModeProps {
    sourceText: string;
    targetText: string;
    setSourceText: (text: string) => void;
    selectedLanguage: string;
    setSelectedLanguage: (lang: string) => void;
    availableVoices: VoiceOption[];
    selectedVoiceId: string | null;
    setSelectedVoiceId: (id: string | null) => void;
    languages: string[];
    isLoading: boolean;
    setIsLoading:(loading: boolean) => void;
    isSpeaking: boolean;
    handleAudioPlayback: (text: string, targetLanguage: string, voiceId: string | null) => void;
    getLanguageCode: (language: string) => string;
    onExit: () => void;
    handleCopyToClipboard: () => void;
    handleCopySource: () => void;
    handleDownload: () => void; // PDF download handler
    copied: boolean;
}

const VRTranslateMode: React.FC<VRTranslateModeProps> = ({
    sourceText,
    targetText,
    setSourceText,
    selectedLanguage,
    setSelectedLanguage,
    availableVoices,
    selectedVoiceId,
    setSelectedVoiceId,
    languages,
    isLoading,
    isSpeaking,
    setIsLoading,
    handleAudioPlayback,
    getLanguageCode,
    onExit,
    handleCopyToClipboard,
    handleCopySource,
    handleDownload, // Assuming this is the PDF one based on context
    copied,
}) => {
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isCharging, setIsCharging] = useState<boolean | null>(null);
    const [chargingTime, setChargingTime] = useState<number | null>(null);
    const [dischargingTime, setDischargingTime] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);
    const micWrapperRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const speakerRef = useRef<HTMLDivElement>(null);
    const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];
    const color = useMotionValue(COLORS_TOP[0]);

    useEffect(() => {
        const controls = animate(color, COLORS_TOP, {
          ease: "easeInOut",
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        });
        return () => controls.stop();
      }, [color]);

    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

    useEffect(() => {
        let batteryManager: BatteryManager | null = null;
        let isMounted = true;

        const updateBatteryStatus = (manager: BatteryManager) => {
            if (!isMounted) return;
            setBatteryLevel(Math.round(manager.level * 100));
            setIsCharging(manager.charging);
            setChargingTime(Number.isFinite(manager.chargingTime) && manager.chargingTime > 0 ? manager.chargingTime : null);
            setDischargingTime(Number.isFinite(manager.dischargingTime) && manager.dischargingTime > 0 ? manager.dischargingTime : null);
        };

        const setupBatteryListener = async () => {
            if ('getBattery' in navigator && navigator.getBattery) {
                try {
                    batteryManager = await navigator.getBattery();
                    if (!isMounted) return;
                    updateBatteryStatus(batteryManager);
                    batteryManager.addEventListener('levelchange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.addEventListener('chargingchange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.addEventListener('chargingtimechange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.addEventListener('dischargingtimechange', () => updateBatteryStatus(batteryManager!));
                } catch (error) {
                    console.error("Error getting battery status:", error);
                    if (isMounted) {
                        setBatteryLevel(null);
                        setIsCharging(null);
                        setChargingTime(null);
                        setDischargingTime(null);
                    }
                }
            } else {
                console.warn("Battery Status API not supported.");
                if (isMounted) {
                    setBatteryLevel(null);
                    setIsCharging(null);
                    setChargingTime(null);
                    setDischargingTime(null);
                }
            }
        };
        setupBatteryListener();

        return () => {
            isMounted = false;
            if (batteryManager) {
                try {
                    batteryManager.removeEventListener('levelchange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.removeEventListener('chargingchange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.removeEventListener('chargingtimechange', () => updateBatteryStatus(batteryManager!));
                    batteryManager.removeEventListener('dischargingtimechange', () => updateBatteryStatus(batteryManager!));
                } catch (e) {
                    console.warn("Minor error during battery listener cleanup:", e)
                }
            }
        };
    }, []);

    useEffect(() => {
        if (sourceText.trim() && !selectedLanguage && !isLoading) { // Prevent alert while loading
            // Consider using a less intrusive notification instead of alert
            console.warn("No language selected for translation.");
            // alert("Please select a language to translate.");
        }
    }, [sourceText, selectedLanguage, isLoading]);


    const handleSpeakerClick = () => {
        if (!targetText) {
            console.warn("No target text to speak.");
            return;
        }
        if (!selectedLanguage) {
             alert("Please select a language first.");
             return;
        }
        if (!selectedVoiceId) {
             alert("Please select a voice type.");
             return;
        }
        if (!isSpeaking) {
            handleAudioPlayback(targetText, selectedLanguage, selectedVoiceId);
        }
    };

    function handleFileUpload(): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.docx,.pdf';
        fileInput.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                // Basic text reading (consider libraries for docx/pdf on client or server)
                if (file.type === "text/plain") {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setSourceText(reader.result as string);
                    };
                    reader.onerror = () => console.error('Error reading file:', reader.error);
                    reader.readAsText(file);
                } else {
                    alert(`File type "${file.type}" cannot be read directly in the browser. Please upload .txt files or use a server-side solution for .docx/.pdf.`);
                    setSourceText(`Cannot read file: ${file.name}`);
                }
            }
        };
        fileInput.click();
    }

    function handleShare(): void {
        if (!selectedLanguage && targetText) {
             alert("Please select a language before sharing.");
             return;
        }
        if (navigator.share && targetText) {
            navigator.share({
                title: 'Translation',
                text: targetText,
            }).catch((error) => console.error('Error sharing:', error));
        } else if (!targetText) {
             console.warn('No translated text to share.');
        } else {
            console.warn('Web Share API is not supported or no text to share.');
            // Fallback: maybe copy to clipboard?
            handleCopyToClipboard();
            alert("Translation copied to clipboard (Sharing not supported).");
        }
    }


    const languageFontMap: { [key: string]: { path: string; name: string } } = {
        'Japanese': { path: '/fonts/NotoSansJP-Regular.ttf', name: 'NotoSansJP' },
        'Chinese ': { path: '/fonts/NotoSansSC-Regular.ttf', name: 'NotoSansSC' }, // Adjust key if your name is different
        'Chinese': { path: '/fonts/NotoSansTC-Regular.ttf', name: 'NotoSansTC' }, // Adjust key if your name is different
        'Telugu': { path: '/fonts/NotoSansTelugu-Regular.ttf', name: 'NotoSansTelugu' },
        'Arabic': { path: '/fonts/NotoSansArabic-Regular.ttf', name: 'NotoSansArabic' },
        'Bengali': { path: '/fonts/NotoSansBengali-Regular.ttf', name: 'NotoSansBengali' },
        // Add other languages here if they need specific fonts
        // ...
        'default': { path: '/fonts/NotoSans-Regular.ttf', name: 'NotoSans' } // Fallback font
    };
    // --- End Font Mapping ---

    // --- Revised PDF Download Handler ---
    const handleDownloadPdfClick = async () => {
        // 1. Basic Checks (Keep as is)
        if (!targetText && !sourceText) {
            console.warn('No text available to download as PDF.');
            alert('No text available to download as PDF.');
            return;
        }
        if (!selectedLanguage && (sourceText || targetText)) {
            console.warn("No target language selected. PDF will use the default font...");
        }

        setIsLoading(true);
        // console.log("Starting PDF generation...");
        // console.log(`[Debug] Current selectedLanguage state: "${selectedLanguage}"`);

        let defaultFontInfo = languageFontMap['default'];
        let FONT_PATH = defaultFontInfo.path;
        let FONT_NAME = defaultFontInfo.name;
        let fontSuccessfullyLoaded = false;

        try {
            // 2. Determine the Correct Font
            // Use selectedLanguage name if it exists and is mapped, otherwise use '__default__'
            const fontInfo = selectedLanguage && languageFontMap[selectedLanguage]
                             ? languageFontMap[selectedLanguage]
                             : defaultFontInfo; // Use the default info directly

            FONT_PATH = fontInfo.path;
            FONT_NAME = fontInfo.name;

            // console.log(`Attempting to use font: ${FONT_NAME} (for language: ${selectedLanguage || 'Default'}) from path: ${FONT_PATH}`);

            // 3. Load the Selected Font File
            // console.log(`Fetching font: ${FONT_PATH}`);
            const fontResponse = await fetch(FONT_PATH);

            if (!fontResponse.ok) {
                // If the specific language font failed, explicitly try the default font
                // console.error(`Failed to fetch primary font (${FONT_NAME}) - Status: ${fontResponse.status}. Attempting fallback to default font.`);
                // Reset to default font info
                FONT_PATH = defaultFontInfo.path;
                FONT_NAME = defaultFontInfo.name;

                // console.log(`Fetching default font: ${FONT_PATH}`);
                const defaultFontResponse = await fetch(FONT_PATH);
                if (!defaultFontResponse.ok) {
                     throw new Error(`Failed to fetch both primary and default fonts. Default font error: ${defaultFontResponse.statusText}`);
                }
                // Use the default font's blob if fallback succeeded
                 const fontBlob = await defaultFontResponse.blob();
                 // ... (rest of the font loading logic for fallback remains the same)
                 const reader = new FileReader();
                 const fontBase64 = await new Promise<string>((resolve, reject) => {
                     reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                     reader.onerror = reject;
                     reader.readAsDataURL(fontBlob);
                 });
                //  console.log(`Default font "${FONT_NAME}" fetched and converted.`);
                 fontSuccessfullyLoaded = true; // Mark success

            } else {
                 // Primary font loaded successfully
                 const fontBlob = await fontResponse.blob();
                 // ... (rest of the font loading logic for primary remains the same)
                 const reader = new FileReader();
                 const fontBase64 = await new Promise<string>((resolve, reject) => {
                     reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                     reader.onerror = reject;
                     reader.readAsDataURL(fontBlob);
                 });
                //  console.log(`Font "${FONT_NAME}" fetched and converted to Base64.`);
                 fontSuccessfullyLoaded = true; // Mark success
            }


            // 4. Initialize jsPDF and Add Font
            const doc = new jsPDF();

            if (fontSuccessfullyLoaded) {
                 // Re-fetch blob and convert based on final FONT_PATH/FONT_NAME
                 const finalFontResponse = await fetch(FONT_PATH);
                 if (!finalFontResponse.ok) throw new Error(`Failed to re-fetch final font: ${FONT_PATH}`); // Add check
                 const finalFontBlob = await finalFontResponse.blob();
                 const finalReader = new FileReader();
                 const finalFontBase64 = await new Promise<string>((resolve, reject) => {
                     finalReader.onloadend = () => resolve((finalReader.result as string).split(',')[1]);
                     finalReader.onerror = reject;
                     finalReader.readAsDataURL(finalFontBlob);
                 });

                 doc.addFileToVFS(`${FONT_NAME}.ttf`, finalFontBase64);
                 doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, 'normal');
                 doc.setFont(FONT_NAME, 'normal');
                //  console.log(`Font "${FONT_NAME}" registered and set in jsPDF.`);
            } else {
                //  console.error("Font loading failed, PDF generation cannot continue with proper font.");
                 throw new Error("Font loading failed.");
            }

            // 5. PDF Layout and Text Addition (Keep this logic the same)
            // ... (source text, target text addition) ...
             const marginLeft = 15;
            const marginTop = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            const usableWidth = pageWidth - marginLeft * 2;
            let yPos = marginTop;
            const lineHeight = 7;

            // Source Text
            doc.setFontSize(14);
            doc.text(`Source Text:`, marginLeft, yPos);
            yPos += lineHeight;
            doc.setFontSize(11);
            const sourceLines = doc.splitTextToSize(sourceText || 'N/A', usableWidth);
            if (yPos + (sourceLines.length * lineHeight) > doc.internal.pageSize.getHeight() - marginTop) {
                doc.addPage();
                yPos = marginTop;
            }
            doc.text(sourceLines, marginLeft, yPos);
            yPos += (sourceLines.length * lineHeight) + (lineHeight * 2);

            // Target Text
            doc.setFontSize(14);
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - marginTop) {
                doc.addPage();
                yPos = marginTop;
            }
            doc.text(`Target Text (${selectedLanguage || 'Default Font Used'}):`, marginLeft, yPos);
            yPos += lineHeight;
            doc.setFontSize(11);
            const targetLines = doc.splitTextToSize(targetText || 'N/A', usableWidth);
            if (yPos + (targetLines.length * lineHeight) > doc.internal.pageSize.getHeight() - marginTop) {
                doc.addPage();
                yPos = marginTop;
            }
            doc.text(targetLines, marginLeft, yPos);


            // 6. Save the PDF (Keep as is)
            doc.save('translation.pdf');
            // console.log("PDF saved successfully.");

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    //

    const handleDownloadMp3Click = async () => {
        if (!targetText) {
           console.warn('No translated text available to download as MP3.');
           alert('No translated text available to download as MP3.');
           return;
        }
        if (!selectedLanguage) {
            alert("Please select a target language before downloading audio.");
            return;
        }
        if (!selectedVoiceId) {
            alert("Please select a voice before downloading audio.");
            return;
        }

        console.log(`[Frontend] Initiating MP3 download for language ${selectedLanguage} using voice ${selectedVoiceId}`);
        setIsLoading(true);

        try {
            const targetLangCode = getLanguageCode(selectedLanguage);
            const voiceName = selectedVoiceId; // Already have the ID

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: targetText,
                    languageCode: targetLangCode,
                    voiceName: voiceName, // Send the voice ID/name
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${errorData?.error || 'Unknown API error'}`);
            }

            const data = await response.json();

            if (data.audioBase64) {
                const audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
                const link = document.createElement('a');
                link.href = audioSrc;
                const filename = `translation_${targetLangCode}_${voiceName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log(`[Frontend] MP3 download triggered as ${filename}`);
            } else {
                throw new Error("API response successful but did not contain audio data.");
            }

        } catch (error) {
            console.error("[Frontend] Error during MP3 download process:", error);
            alert(`Failed to download MP3: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
   };

    return (
        // Use motion.div for potential future animations
        <motion.div
            style={{ backgroundImage }}
            className="fixed inset-0 z-50 flex w-screen h-screen items-start justify-center p-4 overflow-y-auto animate-fadeIn"
        >
            {/* Stars Background */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Stars radius={50} count={2500} factor={4} fade speed={2} />
                </Canvas>
            </div>
            <div
                ref={containerRef}
                className="relative z-10 flex flex-col items-center w-full max-w-7xl gap-6 pt-16 pb-24 lg:pt-8 lg:pb-8 lg:flex-row lg:items-stretch lg:justify-center lg:gap-[44px] lg:mt-[200px]" // Added top padding, bottom padding for mobile dock space
            >
                {/* Exit Button & Battery - Placed top right */}
                <div className="absolute mt-[-60px] right-4 z-[60] flex items-center space-x-3 sm:space-x-4">
                    <BatteryIndicator
                        level={batteryLevel}
                        isCharging={isCharging}
                        chargingTime={chargingTime}
                        dischargingTime={dischargingTime}
                    />
                    <button
                        onClick={onExit}
                        className="text-neutral-400 hover:text-white transition-colors"
                        aria-label="Exit Translate Mode"
                    >
                        <IconX className="h-6 w-6 sm:h-7 sm:w-7" />
                    </button>
                </div>

                {/* --- Source Text Area --- */}
                {/* Added flex-grow to allow it to take space */}
                <div ref={sourceRef} className="flex flex-col w-full lg:flex-1 flex-grow">
                     {/* Removed lg:w-[600px] - let flex-1 handle width */}
                    <div className="relative w-full min-h-[400px] sm:min-h-[250px] h-full flex flex-col bg-black/40 rounded-lg p-2 lg:p-3 overflow-hidden shadow-lg">
                        <div className="pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-neutral-300">Source Language</span>
                            {/* --- MODIFIED CLEAR BUTTON --- */}
                                {sourceText && (
                                    <button
                                        onClick={() => setSourceText('')}
                                        className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-red-500" // Adjusted padding slightly for icon
                                        aria-label="Clear source text"
                                        title="Clear source text"
                                    >
                                        {/* Replace text with Icon */}
                                        <IconTrash size={16} stroke={1.5} /> {/* Adjust size and stroke as needed */}
                                    </button>
                                )}
                                {/* --- END CLEAR BUTTON --- */}
                            </div>


                        <div className="flex flex-col flex-grow relative">
                            <TextArea
                                id="vr-source-language"
                                value={sourceText}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSourceText(e.target.value)}
                                placeholder="Enter text or use microphone..."
                                maxWords={2000}
                                className="flex-grow w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base text-white placeholder-neutral-400 p-1" // Added slight padding
                            />
                            <span className="mt-1 text-left text-xs sm:text-sm text-neutral-400 pr-1 flex-shrink-0">
                                {sourceText ? sourceText.trim().split(/\s+/).filter(Boolean).length : 0} / 2000 words
                            </span>
                            {/* Copy Button */}
                            <div className="absolute bottom-1 right-1 flex items-center space-x-1 sm:space-x-2">
                                {copied && sourceText && <span className="text-xs text-green-500 animate-pulse mr-1">Copied!</span>}
                                <div
                                    title="Copy Source Text"
                                    className={`cursor-pointer rounded-full bg-blue-600 p-1.5 sm:p-2 text-white shadow-md transition-colors hover:bg-blue-700 ${!sourceText ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => sourceText && handleCopySource()}
                                    aria-label="Copy source text"
                                >
                                   <IconCopy className="h-3 w-3 sm:h-4 sm:w-4" /> {/* Slightly smaller icons */}
                                </div>
                            </div>
                        </div>
                        <BorderBeam size={100} duration={8} delay={0} />
                    </div>
                </div>

                {/* --- Center Controls (Mic/Speaker) --- */}
                <div className="flex w-full flex-row items-center justify-center gap-6 py-2
                                lg:w-auto lg:flex-shrink-0 lg:flex-col lg:justify-start lg:gap-0 lg:space-y-12 lg:py-0 lg:mt-12">
                    {/* Added scaling for mobile */}
                    <div ref={micWrapperRef} title="Speak to Input" className="transform scale-90 lg:scale-100">
                        <SpeechRecognitionComponent
                            setSourceText={setSourceText}
                            getLanguageCode={getLanguageCode}
                            selectedLanguage={"English"} // Assuming source is always English for speech input? Adjust if needed.
                            renderTrigger={(startListening, stopListening, isListening) => (
                                <AnimatedMicButton
                                    isListening={isListening}
                                    onClick={isListening ? stopListening : startListening}
                                />
                            )}
                        />
                    </div>
                     {/* Added scaling for mobile */}
                   <div ref={speakerRef} title="Listen to Translation" className="transform scale-90 lg:scale-100">
                       <AnimatedSpeakerButton
                            isSpeaking={isSpeaking}
                            onClick={handleSpeakerClick}
                            className={`${isSpeaking || !targetText || !selectedVoiceId ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable if no text/voice
                       />
                   </div>
                </div>

                {/* --- Target Text Area --- */}
                 {/* Added flex-grow to allow it to take space */}
                <div ref={targetRef} className="flex flex-col w-full lg:flex-1 flex-grow">
                     {/* Removed lg:w-[600px] - let flex-1 handle width */}
                    <div className="relative w-full min-h-[500px] sm:min-h-[250px] h-full flex flex-col bg-black/40 rounded-lg p-2 lg:p-3 overflow-hidden shadow-lg">
                         {/* Header: Default column, lg: row */}
                         <div className="pb-1 mb-1 sm:pb-2 sm:mb-2 border-b border-white/10 flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-4 flex-shrink-0">
                            <span className="text-xs sm:text-sm font-semibold text-neutral-300 flex-shrink-0">Target Language</span>
                            {/* Controls container: Default column (full width), lg: row (auto width) */}
                            <div className="flex flex-col mr-[90px] items-stretch gap-2 w-full lg:flex-row lg:items-center lg:gap-2 lg:w-auto lg:ml-auto">
                                
                                <LanguageSelector
                                    selectedLanguage={selectedLanguage}
                                    setSelectedLanguage={setSelectedLanguage}
                                    languages={languages}
                                     // Add width class if needed for mobile consistency
                                     
                                />
                                <DetailedVoiceSelector
                                    availableVoices={availableVoices}
                                    selectedVoiceId={selectedVoiceId}
                                    setSelectedVoiceId={setSelectedVoiceId}
                                    // Add width class if needed for mobile consistency
                                    className="w-full relative  sm:ml-[90px] mb-[-5px] lg:w-auto"
                                />
                            </div>
                        </div>
                         {/* Content Area */}
                         <div className="flex flex-col flex-grow relative">
                            <TextArea
                                id="vr-target-language"
                                value={targetText}
                                readOnly
                                placeholder={isLoading ? "Translating..." : (selectedLanguage ? "Translation appears here..." : "Select a language first")}
                                className="flex-grow w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base text-white placeholder-neutral-400 p-1" // Added slight padding
                            />
                            {isLoading && (
                                 <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70 z-10">
                                    <ClipLoader color="#FF7F01" loading={isLoading} size={35} aria-label="Loading translation" />
                                </div>
                            )}
                             {/* Copy Button */}
                             <div className="absolute bottom-1 right-1 flex items-center space-x-1 sm:space-x-2">
                                {copied && targetText && <span className="text-xs text-green-500 animate-pulse mr-1">Copied!</span>}
                                <div title="Copy Translation" className={`cursor-pointer rounded-full bg-blue-600 p-1.5 sm:p-2 text-white shadow-md transition-colors hover:bg-blue-700 ${!targetText || !selectedLanguage ?
                                            'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => targetText && selectedLanguage && handleCopyToClipboard()}
                                aria-label="Copy translation text"
                                >
                                   <IconCopy className="h-3 w-3 sm:h-4 sm:w-4" /> {/* Slightly smaller icons */}
                                </div>
                            </div>
                        </div>
                        <BorderBeam size={100} duration={8} delay={0} />
                    </div>
                </div>
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]
                                lg:absolute lg:bottom-auto lg:left-1/2 lg:translate-x-[-50%] lg:mt-[420px] lg:ml-[0px]"> {/* Adjusted desktop positioning slightly */}

                    <DockComponent
                        onFileUpload={handleFileUpload}
                        onShare={handleShare}
                        onDownloadPdf={handleDownloadPdfClick}
                        onDownloadMp3={handleDownloadMp3Click}
                        isTargetTextPresent={!!targetText && !!selectedLanguage && !!selectedVoiceId}
                        isAnyTextPresent={!!(sourceText || targetText)}
                        // Optionally pass size prop if DockComponent supports it
                        // size="small" // Example
                    />
                </div>

            </div> {/* End Main Content Container */}
        </motion.div> // End Full Screen Wrapper
    );
};

export default VRTranslateMode;