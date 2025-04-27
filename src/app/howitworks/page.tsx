// src/app/howitworks/page.tsx
'use client'; // Required for hooks like useRef, useScroll

import React, { useRef } from 'react';
import Image from 'next/image';
import ClientLoadingScreen from '@/components/ClientLoadingScreen';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { ReactLenis } from 'lenis/react'; // Import ReactLenis
import { useTransform, motion, useScroll, MotionValue } from 'framer-motion'; // Import from framer-motion

// --- Data Mapping ---
// Original data structure from your Timeline
const originalData = [
  {
    title: "Speech-to-Speech (S2S) Translation",
    imageSrc: "/pic1.jpg",
    description: "Speech-to-Speech (S2S) Translation enables seamless real-time communication between speakers of different languages. It captures spoken input, transcribes it into text, translates the text into the target language, and then synthesizes natural-sounding speech in the target language. This feature is ideal for live conversations, conferences, and multilingual meetings, breaking down language barriers effortlessly.",
  },
  {
    title: "Speech-to-Text (S2T) Translation",
    imageSrc: "/pic2.jpg",
    description: "Speech-to-Text (S2T) Translation is designed to convert spoken words into accurate, real-time text transcriptions. This feature is perfect for creating subtitles, generating meeting notes, or enabling accessibility for the hearing impaired. It ensures that spoken content is captured and displayed in text format with precision, ready for further processing or sharing.",
  },
  {
    title: "Text-to-Speech (TTS) Conversion",
    imageSrc: "/pic3.png",
    description: "Text-to-Speech (TTS) Conversion transforms written text into lifelike, expressive speech. By leveraging advanced linguistic analysis and phonetic modeling, this feature produces audio output that sounds natural and engaging. It is ideal for creating voiceovers, audiobooks, virtual assistants, and other applications where converting text into speech enhances user experience.",
  },
  {
    title: "Text-to-Text (T2T) Translation",
    imageSrc: "/pic4.png",
    description: "Text-to-Text (T2T) Translation provides accurate and context-aware translations between multiple languages. It ensures that the original meaning, grammar, and cultural nuances are preserved, making it suitable for translating documents, websites, and messages. This feature empowers users to communicate effectively across linguistic boundaries with confidence.",
  },
];

// Map originalData to the structure needed by the Card component
// Define some colors for the cards
const cardColors = [ "#8f89ff", "#353835", "#13006c", "#ed649e", "#fd521a"]; // Add more if needed

const projectsForCards = originalData.map((item, index) => ({
  title: item.title,
  description: item.description,
  src: item.imageSrc.split('/').pop() || `image-${index}.jpg`, // Extract filename for potential future use, not used by Card
  link: item.imageSrc, // Use the original image path for the Card's image URL
  color: cardColors[index % cardColors.length], // Cycle through colors
}));


// --- Card Component Definition (from your provided code) ---
interface CardProps {
  i: number;
  title: string;
  description: string;
  src: string; // Keep src prop even if unused by Image, for consistency
  url: string; // This will hold the image path for Next/Image
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card: React.FC<CardProps> = ({
  i,
  title,
  description,
  src, // unused in Image tag below, but kept for prop consistency
  url, // used as the src for Next/Image
  color,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'], // Animate when card starts entering viewport from bottom
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]); // Zoom out effect
  const scale = useTransform(progress, range, [1, targetScale]); // Stacking effect

  // --- Split description into points ---
  // Split by period, filter out empty strings, trim whitespace, and add period back
  const descriptionPoints = description
    .split('.')
    .filter(point => point.trim() !== '')
    .map(point => point.trim() + '.');
  // ------------------------------------



  return (
    <div
      ref={container}
      className='h-[90vh] md:h-screen flex items-center justify-center sticky top-0 px-2 sm:px-4' // Each card takes screen height and sticks
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`, // Adjust vertical stacking offset
        }}
        // Adjusted height/width and padding for potentially better fit
        className={`flex flex-col relative h-[80vh] md:h-[600px] w-full max-w-md md:max-w-none md:w-[70%] rounded-2xl p-4 md:p-10 origin-top shadow-2xl`}
      >
        <h2 className='text-lg sm:text-xl md:text-2xl text-center font-semibold mb-2 md:mb-4'>{title}</h2>
        <div className={`flex flex-col md:flex-row h-full mt-2 md:mt-5 gap-4 md:gap-10`}>
          {/* Description Area */}
          <div className={`w-full md:w-[40%] relative md:top-[15%]`}> {/* Adjusted top */}
          <ul className="list-disc list-inside text-sm sm:text-base md:text-lg mb-4 space-y-1 md:space-y-2">
              {descriptionPoints.map((point, index) => (
                <li key={index}>💗{point}</li>
              ))}
            </ul>
          </div>

          {/* Image Area */}
          <div
             className={`relative w-full h-[150px] sm:h-[200px] md:w-[60%] md:h-full rounded-lg overflow-hidden `}// Adjusted height for mobile
          >
            <motion.div
              className={`w-full h-full`}
              style={{ scale: imageScale }}
            >
              {/* Use the 'url' prop which contains the correct image path */}
              <Image fill src={url} alt={title || 'Project image'} className='object-cover' />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


// --- Main HowItWorks Page Component ---
const HowItWorks: React.FC = () => {
  const container = useRef(null); // Ref for the main scrollable container
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'], // Track scroll progress of the whole card section
  });

  return (
    <ClientLoadingScreen>
      {/* Fixed background layer - KEEP AS IS */}
      <div className="fixed inset-0 -z-10 h-screen w-screen [background:radial-gradient(125%_105%_at_50%_10%,#000_36%,#63e_100%)]"></div>

      {/* Wrap scrollable content with ReactLenis */}
      <ReactLenis root options={{ lerp: 0.08, duration: 1.2 }}>
        {/* Main content container - No background needed here */}
        {/* Use the ref here for scroll tracking */}
        <main ref={container} className="relative w-full text-white">

          {/* Title Section - KEEP AS IS (adjust top margin if needed) */}
          <div className="pt-12 pb-8 md:pt-24 md:pb-16 text-center px-4"> {/* Adjust mobile padding */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold font-['Outfit']">
              <SparklesText> Behind the Magic ~ How EchoVerse Translates</SparklesText>
            </h1>
          </div>

          {/* Stacking Cards Section - REPLACES TIMELINE */}
          {/* No specific background needed here, will show the fixed background */}
          <section className='relative z-10'> {/* Add relative and z-index */}
            {projectsForCards.map((project, i) => {
              const targetScale = 1 - (projectsForCards.length - i) * 0.05;
              return (
                <Card
                  key={`p_${i}`}
                  i={i}
                  url={project.link} // Pass the image path here
                  src={project.src} // Keep passing src even if unused directly by Image
                  title={project.title}
                  color={project.color}
                  description={project.description}
                  progress={scrollYProgress} // Pass overall progress
                  range={[i * 0.25, 1]} // Adjust range based on number of cards
                  targetScale={targetScale}
                />
              );
            })}
          </section>

          {/* Optional: Add padding at the bottom or a simple footer */}
          <div className="h-40"></div>

        </main>
      </ReactLenis>
    </ClientLoadingScreen>
  );
};

export default HowItWorks;
