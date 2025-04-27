// components/Navbar.tsx
"use client"; // Add this line because we'll use useState

import React, { useState, useEffect } from 'react'; // Import useState
import { Menu, MenuItem } from '@/components/ui/navbar-menu'; // Assuming these are okay for mobile dropdown too
import Image from 'next/image';
import Link from 'next/link'; // Import Link for navigation

// Define the type for the BeforeInstallPromptEvent (optional but good practice for TypeScript)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed',
      platform: string
  }>;
  prompt(): Promise<void>;
}
const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State to track mobile menu visibility

 // State to hold the install prompt event
 const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
 // State to track if running as an installed PWA
 const [isStandalone, setIsStandalone] = useState(false);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

    useEffect(() => {
      // Check if running in standalone mode (installed PWA)
      if (window.matchMedia('(display-mode: standalone)').matches) {
          console.log("App is running in standalone mode.");
          setIsStandalone(true);
          return; // No need to set up install prompt if already installed
      }

      // Listener for the browser's install prompt event
      const handleBeforeInstallPrompt = (event: Event) => {
          event.preventDefault();
          setInstallPromptEvent(event as BeforeInstallPromptEvent);
          console.log("'beforeinstallprompt' event fired and stored.");
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      console.log("Event listener for 'beforeinstallprompt' added.");

      // Cleanup listener when the component unmounts
      return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          console.log("Event listener for 'beforeinstallprompt' removed.");
      };
  }, []); // Empty dependency array means this effect runs once on mount
  
  const handleInstallClick = async () => {
      if (!installPromptEvent) {
          console.log("Install prompt event not available.");
          return;
      }
      installPromptEvent.prompt();
      console.log("Install prompt shown to user.");
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setInstallPromptEvent(null); // Clear the event, hide the button
  };
  // --- END ADD ---
  return (
    
    <nav className="relative w-full bg-black lg:bg-transparent p-4 flex items-center justify-between z-50"> {/* Added z-50 for potential stacking */}

      {/* Logo - Always visible */}
      {/* Use Link for navigation if the logo should be clickable */}
      <Link href="/" className="flex-shrink-0"> {/* Added flex-shrink-0 to prevent shrinking */}
          <Image
            src="/translator.png"
            alt="EchoVerse Logo"
            width={40}
            height={40}
            className="cursor-pointer"
          />
      </Link>
      {/* Desktop Menu (Hidden on Mobile, Visible on lg screens and up) */}
      <div className="hidden mr-[600px] lg:flex lg:items-center lg:space-x-4">
        {/* The original Menu component might need internal adjustments for desktop if needed */}
        <Menu>
          <MenuItem item="Home" href="/" />
          <MenuItem item="How It Works" href="/howitworks" />
          <MenuItem item="Contact Us" href="/meetthecreators" />

          {!isStandalone && installPromptEvent && (
                        // We add it directly here, maybe style it slightly differently if needed
                        <button
                            onClick={handleInstallClick}
                            className="ml-4 px-3 py-1 text-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded hover:from-blue-600 hover:to-purple-700 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900" // Added margin-left and adjusted padding/text size
                            aria-label="Install EchoVerse App"
                        >
                            Install App
                        </button>
                    )}

        </Menu>
      </div>
      {/* Hamburger Button (Visible on Mobile, Hidden on lg screens and up) */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="text-white focus:outline-none"
        >
          {/* Simple Hamburger/Close Icon */}
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile Menu Dropdown (Conditionally rendered based on state, hidden on lg screens) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black lg:hidden flex flex-col items-center shadow-lg py-4">
          {/* Use standard Links or reuse MenuItem if it works standalone */}
          <Link href="/" className="text-white py-2 hover:text-gray-300" onClick={toggleMobileMenu}>Home</Link>
          <Link href="/howitworks" className="text-white py-2 hover:text-gray-300" onClick={toggleMobileMenu}>How It Works</Link>
          <Link href="/meetthecreators" className="text-white py-2 hover:text-gray-300" onClick={toggleMobileMenu}>Contact Us</Link>
          
          {!isStandalone && installPromptEvent && (
                        <button
                            onClick={() => {
                                handleInstallClick(); // Call the install handler
                                toggleMobileMenu(); // Also close the menu
                            }}
                            className="mt-3 w-4/5 text-center py-2 px-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded hover:from-blue-600 
                            hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800" // Added margin-top and width
                            aria-label="Install EchoVerse App"
                        >
                            Install App
                        </button>
                    )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
