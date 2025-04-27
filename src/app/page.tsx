// src/app/page.tsx
"use client";
import "regenerator-runtime/runtime";
import React, { useState, ChangeEvent, useEffect, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Import motion
import Image from "next/image"; // Use Next.js Image for optimization
// ... other imports
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import useTranslate from "@/hooks/useTranslate";
import { rtfToText } from "@/utils/rtfToText";
import TextRotate from "@/components/ui/text-rotate";
import { jsPDF } from "jspdf";
import Lightning from '@/components/ui/Lightning';
import { ClipLoader } from "react-spinners";
import { Liquid } from '@/components/ui/liquid-gradient';
import TranslateNowButton from '@/components/ui/TranslateNowButton';
import styles from './page.module.css';



// Lazy load components
const VisionProScene = React.lazy(() => import('@/components/VisionProScene'));
const VRTranslateMode = React.lazy(() => import('@/components/VRTranslateMode'));

interface VoiceOption {
  id: string; // Unique identifier, usually the Google Voice Name (e.g., 'en-US-Wavenet-D')
  name: string; // User-friendly display name (e.g., "English - Male (Wavenet D)")
  languageCode: string; // The language code this voice natively speaks (e.g., 'en-US')
  googleVoiceName: string; // The actual name needed for the API (e.g., 'en-US-Wavenet-D')
  gender: 'Male' | 'Female'; // Keep gender info if needed for display/filtering later
}

// --- NEW: Create a flat list of all available voices ---
const allAvailableVoices: VoiceOption[] = [
  // English Voices
  { id: 'en-US-Wavenet-D', name: 'English - Male ', languageCode: 'en-US', googleVoiceName: 'en-US-Wavenet-D', gender: 'Male' },
  { id: 'en-US-Wavenet-F', name: 'English - Female ', languageCode: 'en-US', googleVoiceName: 'en-US-Wavenet-F', gender: 'Female' },
  // Spanish Voices
  { id: 'es-ES-Standard-B', name: 'Spanish - Male ', languageCode: 'es-ES', googleVoiceName: 'es-ES-Standard-B', gender: 'Male' },
  { id: 'es-ES-Standard-A', name: 'Spanish - Female ', languageCode: 'es-ES', googleVoiceName: 'es-ES-Standard-A', gender: 'Female' },
  // French Voices
  { id: 'fr-FR-Wavenet-D', name: 'French - Male ', languageCode: 'fr-FR', googleVoiceName: 'fr-FR-Wavenet-D', gender: 'Male' },
  { id: 'fr-FR-Wavenet-A', name: 'French - Female ', languageCode: 'fr-FR', googleVoiceName: 'fr-FR-Wavenet-A', gender: 'Female' },
  // German Voices
  { id: 'de-DE-Standard-D', name: 'German - Male ', languageCode: 'de-DE', googleVoiceName: 'de-DE-Standard-D', gender: 'Male' },
  { id: 'de-DE-Standard-F', name: 'German - Female ', languageCode: 'de-DE', googleVoiceName: 'de-DE-Standard-F', gender: 'Female' },
  // Chinese Voices
  { id: 'cmn-CN-Wavenet-C', name: 'Chinese - Male ', languageCode: 'zh-CN', googleVoiceName: 'cmn-CN-Wavenet-C', gender: 'Male' },
  { id: 'cmn-CN-Wavenet-A', name: 'Chinese - Female ', languageCode: 'zh-CN', googleVoiceName: 'cmn-CN-Wavenet-A', gender: 'Female' },
  // Hindi Voices
  { id: 'hi-IN-Wavenet-B', name: 'Hindi - Male ', languageCode: 'hi-IN', googleVoiceName: 'hi-IN-Wavenet-B', gender: 'Male' },
  { id: 'hi-IN-Wavenet-A', name: 'Hindi - Female', languageCode: 'hi-IN', googleVoiceName: 'hi-IN-Wavenet-A', gender: 'Female' },
  // Telugu Voices
{ id: 'te-IN-Standard-A', name: 'Telugu - Female', languageCode: 'te-IN', googleVoiceName: 'te-IN-Standard-A', gender: 'Female' }, // Example, replace with correct data
{ id: 'te-IN-Standard-B', name: 'Telugu - Male', languageCode: 'te-IN', googleVoiceName: 'te-IN-Standard-B', gender: 'Male' },

// Japanese Voices
{ id: 'ja-JP-Standard-A', name: 'Japanese - Female ', languageCode: 'ja-JP', googleVoiceName: 'ja-JP-Standard-A', gender: 'Female' }, // Example, replace with correct data
{ id: 'ja-JP-Standard-C', name: 'Japanese - Male ', languageCode: 'ja-JP', googleVoiceName: 'ja-JP-Standard-B', gender: 'Male' },


// Bengali Voices
{ id: 'bn-IN-Wavenet-A', name: 'Bengali - Female', languageCode: 'bn-IN', googleVoiceName: 'bn-IN-Wavenet-A', gender: 'Female' }, // Example, replace with correct data
{ id: 'bn-IN-Wavenet-B', name: 'Bengali - Male', languageCode: 'bn-IN', googleVoiceName: 'bn-IN-Wavenet-B', gender: 'Male' },

// Italian Voices
{ id: 'it-IT-Wavenet-A', name: 'Italian - Female', languageCode: 'it-IT', googleVoiceName: 'it-IT-Wavenet-A', gender: 'Female' }, // Example, replace with correct data
{ id: 'it-IT-Wavenet-C', name: 'Italian - Male', languageCode: 'it-IT', googleVoiceName: 'it-IT-Wavenet-C', gender: 'Male' },

// Arabic Voices (check the proper dialect if you need a specific one)
 { id: 'ar-XA-Wavenet-A', name: 'Arabic - Female', languageCode: 'ar-XA', googleVoiceName: 'ar-XA-Wavenet-A', gender: 'Female' }, // Example, replace with correct data
 { id: 'ar-XA-Wavenet-B', name: 'Arabic - Male', languageCode: 'ar-XA', googleVoiceName: 'ar-XA-Wavenet-B', gender: 'Male' },
];



const Home: React.FC = () => {
  // --- Core State ---
  const [sourceText, setSourceText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [languages] = useState<string[]>([
    "English", "Spanish", "French", "German", "Chinese", "Hindi",  "Telugu", "Japanese", "Bengali", "Italian", "Arabic",
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null); // Start with no voice selected
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- UI Mode State ---
  // startModelAnimation triggers the overall transition *away* from the initial view
  const [startModelAnimation, setStartModelAnimation] = useState<boolean>(false);
  // showVRInterface controls the final VR mode visibility *after* the model animation
  const [showVRInterface, setShowVRInterface] = useState<boolean>(false);

  // --- Translation Hook ---
  const targetText = useTranslate(sourceText, selectedLanguage);

  // --- Effects ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (showVRInterface && sourceText && selectedLanguage && !targetText) {
      setIsLoading(true);
    } else if (showVRInterface && targetText) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [sourceText, selectedLanguage, targetText, showVRInterface]);


  const handleCopySourceToClipboard = () => {
    if (!sourceText) return;
    navigator.clipboard.writeText(sourceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToClipboard = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAudioPlayback = async (
    text: string,
    targetLanguage: string,
    voiceId: string | null
  ) => {
    if (!text || !targetLanguage || !voiceId) {
      alert("Please ensure text, target language, and a voice are selected.");
      console.warn("Playback cancelled: Missing text, target language, or voice ID.");
      return;
    }
    if (isSpeaking) {
      console.warn("Playback cancelled: Already speaking.");
      return;
    }

    setIsSpeaking(true);
    console.log(`[Frontend] Initiating TTS playback for language ${targetLanguage} using voice ${voiceId}`);

    try {
      const targetLangCode = getLanguageCode(targetLanguage);
      const voiceName = voiceId;

      console.log(`[Frontend] Requesting TTS via API: LangCode=${targetLangCode}, VoiceName=${voiceName}`);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: targetLangCode, voiceName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from API' }));
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData?.error || 'Unknown API error'}`);
      }
      const data = await response.json();

      if (data.audioBase64) {
        const audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
        const audio = new Audio(audioSrc);
        audio.onended = () => {
          console.log("[Frontend] Audio playback finished.");
          setIsSpeaking(false);
        };
        audio.onerror = (e) => {
          console.error("[Frontend] Error playing audio:", e);
          alert("An error occurred while trying to play the synthesized audio.");
          setIsSpeaking(false);
        };
        console.log("[Frontend] Playing synthesized audio...");
        await audio.play();
      } else {
        throw new Error("API response successful but did not contain audio data.");
      }

    } catch (error) {
      console.error("[Frontend] Error during TTS playback process:", error);
      alert(`Failed to play audio: ${error instanceof Error ? error.message : String(error)}`);
      setIsSpeaking(false);
    }
  };

  const getLanguageCode = (language: string): string => {
    const languageCodes: { [key: string]: string } = { English: "en-US", Spanish: "es-ES", French: "fr-FR", German: "de-DE", Chinese: "zh-CN", Hindi: "hi-IN",  Telugu: "te-IN", Japanese: "ja-JP" , Bengali: "bn-IN", Italian: "it-IT", Arabic: "ar-XA",  };
    return languageCodes[language] || "en-US";
  };

  const handleDownload = () => {
    if (!sourceText && !targetText) { alert("Nothing to download."); return; }
    try {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Source Text:", 10, 20);
        doc.setFontSize(12);
        doc.text(sourceText || "N/A", 10, 30, { maxWidth: 180 });
        doc.setFontSize(14);
        doc.text(`Target Text (${selectedLanguage || 'N/A'}):`, 10, 80);
        doc.setFontSize(12);
        doc.text(targetText || "N/A", 10, 90, { maxWidth: 180 });
        doc.save("EchoVerse-Translation.pdf");
    } catch (error) { console.error("Error generating PDF:", error); alert("Error generating PDF."); }
  };


  useEffect(() => {
    let mobileTransitionTimeout: NodeJS.Timeout | null = null;
    // Check if we are likely on a mobile device (screen width < lg breakpoint)
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024; // Tailwind's default lg breakpoint
 
    if (isMobileView && startModelAnimation && !showVRInterface) {
        // Simulate the time the 3D animation would take, or set a desired delay
        mobileTransitionTimeout = setTimeout(() => {
            console.log("page.tsx: Mobile transition delay complete, setting showVRInterface = true.");
            setShowVRInterface(true);
        }, 500); // Adjust delay (e.g., 500ms)
    }
 
    return () => {
        if (mobileTransitionTimeout) clearTimeout(mobileTransitionTimeout);
    };
 }, [startModelAnimation, showVRInterface])



  // --- VR Mode Flow Handlers ---
  const handleTranslateNowClick = () => {
    // Don't hide VR interface yet, just trigger the animation sequence
    setShowVRInterface(false);
    setStartModelAnimation(true); // This will trigger UI fade out and model animation start
  };

  // This is called by VisionProScene when its *internal* zoom/pan animation finishes
  const handleModelAnimationComplete = () => {
    console.log("page.tsx: Model animation complete, setting showVRInterface = true.");
    setShowVRInterface(true); // Now trigger the VR interface to appear
  };

  const handleExitVRMode = () => {
    setShowVRInterface(false);
    setStartModelAnimation(false); // Reset back to initial state
    // Optionally reset other states if needed
    // setSourceText("");
    // setSelectedLanguage("");
    // setSelectedVoiceId(null);
  };

  // --- Render Logic ---
   return (
    <>
      {/* Main page container */}
      <div className="w-full bg-black bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        {/* Container for the initial layout elements */}
        <div className={`${styles.pageContainer} relative z-10 w-full h-full flex flex-col items-center justify-center lg:mt-[-250px]`}> 

            {/* Initial UI Elements (Text, Button, etc.) - Fade out when animation starts */}
            <AnimatePresence>
                {!startModelAnimation && (
                    <motion.div
                        key="initial-ui-content"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }} // Fade out when startModelAnimation becomes true
                        transition={{ duration: 0.3 }}
                        className={`${styles.initialUiContent} flex flex-col items-center`} // Group the text and button
                    >
                        <div className="text-center mt-8 lg:mt-[30px]">
                        <h1 className={`${styles.title} text-4xl sm:text-6xl font-bold text-neutral-200 glowing-text`}>
                                <span className="text-[#FF7F01]">Echo</span>
                                <span className="text-[#075ff5]">Verse</span>
                            </h1>
                            <div className="mt-3 lg:mt-4 flex flex-col items-center">
                            <p className={`${styles.description} text-neutral-400 text-lg sm:text-xl md:text-2xl lg:mb-3 glowing-text`}>
                                AI-Powered Multilingual Communication
                                </p>
                                <div className={`${styles.textRotateContainer} mb-9 glowing-text`}>
                                <TextRotate
                                    texts={["Speak", "Translate", "Connect"]}
                                    mainClassName="text-white px-2 sm:px-3 md:px-4 bg-gradient-to-r from-orange-500 to-yellow-500 overflow-hidden py-1 sm:py-2 md:py-3 justify-center rounded-lg"
                                    staggerDuration={0.05}
                                    rotationInterval={3000}
                                />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layout container for Scene + Lightning */}
            <div className="mt-[-10px] lg:ml-[80px] mx-auto h-[500px] flex flex-row items-center">
                {/* Left Lightning - Fade out */}
                <AnimatePresence>
                    {!startModelAnimation && (
                        <motion.div
                            key="lightning-left"
                            className="hidden lg:block"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ width: "280px", height: "1280px", marginTop: "50px", position: "relative",  transform: "rotate(90deg) rotateX(180deg)", backgroundColor: "transparent" ,}}>
                                <div style={{ backgroundColor: "transparent", width: "100%", height: "100%" }}>
                                    <Lightning hue={25} xOffset={0} speed={0.5} intensity={0.4} size={0.4} taperMin={6.1} taperMax={6.1} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vision Pro Scene Container - Stays in layout initially */}
                {/* The Scene component itself will handle becoming fullscreen */}
                <div className={`${styles.mediaContainer} flex flex-col items-center relative z-20 lg:mx-0 lg:mt-[-30px] lg:w-auto`}> {/* Ensure scene is above background but potentially below VR mode later */}
                   {/* Static Image (Mobile View: block, lg and up: hidden) */}
                   <div className="block lg:hidden w-full">
                        <AnimatePresence>
                            {!startModelAnimation && ( // Fade out image along with other UI
                                <motion.div
                                    key="mobile-image-container"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Image // Use Next.js Image for optimization
                                        src="/static2.png"
                                        alt="EchoVerse Mobile View"
                                        width={1200} // Provide appropriate width
                                        height={600} // Provide appropriate height (adjust aspect ratio)
                                        className="w-full h-auto rounded-lg object-contain" // Adjust styling as needed
                                        priority // Load image sooner if it's above the fold
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                

                {/* VisionProScene (Desktop View: hidden, lg and up: block) */}
                <div className="hidden lg:block">
                        <Suspense fallback={
                                // --- MUI Skeleton for VisionProScene ---
                                <Skeleton
                                    variant="rectangular"
                                    // Adjust skeleton size if needed for desktop layout
                                    width={1000}
                                    height={530}
                                    animation="wave"
                                    sx={{ bgcolor: 'grey.900', borderRadius: '12px' }}
                                />
                                // ---------------------------------------
                            }>
                            <VisionProScene
                                startAnimation={startModelAnimation}
                                onAnimationComplete={handleModelAnimationComplete}
                                isVRModeVisible={showVRInterface} // Pass VR visibility state
                            />
                        </Suspense>
                    </div>
                </div>

                {/* Right Lightning - Fade out */}
                <AnimatePresence>
                    {!startModelAnimation && (
                        <motion.div
                            key="lightning-right"
                            className="hidden lg:block"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={{ width: "280px", height: "1280px", marginTop: "50px", position: "relative", transform: "rotate(90deg)", zIndex: -20, /* Keep zIndex low */ backgroundColor: "transparent" }}>
                                <div style={{ backgroundColor: "transparent", width: "100%", height: "100%" }}>
                                    <Lightning hue={230} xOffset={0} speed={0.5} intensity={0.6} size={0.4} taperMin={6.4} taperMax={6.1} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {!startModelAnimation && (
                    <motion.div
                        key="translate-button"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${styles.translateButtonContainer} lg:mt-4 lg:mb-4`}
                    >
                        <TranslateNowButton onClick={handleTranslateNowClick} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div> {/* End initial layout container */}
        

        {/* VR Mode View - Appears after model animation */}
        <AnimatePresence>
          {showVRInterface && (
            <motion.div
              key="vr-mode"
              initial={{ opacity: 0 }} // Start transparent
              animate={{ opacity: 1 }} // Fade in
              // Adjust delay based on how long VisionProScene takes to fade out internally
              transition={{ duration: 0.5, delay: 0.1 }} // Short delay after animation complete signal
              className="fixed inset-0 z-50" // Ensure it's on top
            >
              <Suspense
                fallback={
                  // --- MUI Skeleton for VRTranslateMode ---
                  // Use a Box to create the full-screen container
                  <Box sx={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 50,
                      bgcolor: 'black', // Background color
                      display: 'flex',
                      flexDirection: 'column', // Stack skeletons
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2 // Spacing between skeletons
                    }}
                  >
                    {/* Simulate loading UI elements */}
                    <Skeleton variant="text" width="40%" animation="wave" sx={{ fontSize: '2rem', bgcolor: 'grey.800' }} />
                    <Skeleton variant="rectangular" width="60%" height={100} animation="wave" sx={{ bgcolor: 'grey.900', borderRadius: '8px' }} />
                    <Skeleton variant="text" width="50%" animation="wave" sx={{ bgcolor: 'grey.800' }} />
                    <Skeleton variant="circular" width={40} height={40} animation="wave" sx={{ bgcolor: 'grey.900', mt: 2 }} />
                  </Box>
                  // ----------------------------------------
                }
              >
                <VRTranslateMode
                  sourceText={sourceText}
                  targetText={targetText}
                  setSourceText={setSourceText}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  availableVoices={allAvailableVoices}
                  selectedVoiceId={selectedVoiceId}
                  setSelectedVoiceId={setSelectedVoiceId}
                  languages={languages}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  isSpeaking={isSpeaking}
                  handleAudioPlayback={handleAudioPlayback}
                  getLanguageCode={getLanguageCode}
                  onExit={handleExitVRMode}
                  handleCopySource={handleCopySourceToClipboard}
                  handleCopyToClipboard={handleCopyToClipboard}
                  handleDownload={handleDownload}
                  copied={copied}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Home;
