// src/components/Inputs/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from "react";
import { IconLanguage, IconChevronDown, IconCheck } from "@tabler/icons-react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import Image from 'next/image'; // <--- Import Image component


const languageToCountryCodeMap = {
    "English": "gb", // or "us"
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Chinese": "cn",
    "Hindi": "in",
    "Telugu": "in",    
    "Japanese": "jp",  
    "Bengali": "in",   
    "Italian": "it",   
    "Arabic": "sa",   
};
// --- Helper function to get the flag image source path ---
const getFlagSrc = (language) => {
    const code = languageToCountryCodeMap[language];
    
    return code ? `/flags/${code}.png` : '/flags/unknown.png'; 
};
const LanguageSelector = ({
  selectedLanguage,
  setSelectedLanguage,
  languages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => {
      if (isOpen) {
          setIsOpen(false);
      }
  });

  const handleSelect = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // --- Get flag for the currently selected language ---
  // Provide a default empty string or first language if selectedLanguage is initially null/undefined
  const currentSelectedLanguage = selectedLanguage || "";
  const selectedFlagSrc = getFlagSrc(currentSelectedLanguage);

  // --- Styles (Keep existing styles) ---
  const triggerClasses = `
    relative flex items-center justify-between mt-[2px] mr-[-85px] w-[130px] cursor-pointer /* Adjusted width slightly */
    rounded-md border border-neutral-700 hover:border-neutral-500
    bg-black/50 hover:bg-black/70
    px-1 py-1.5 text-sm text-white transition-colors duration-150 /* Adjusted padding */
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    space-x-2 z-50
  `;

  const menuClasses = `
    absolute z-40 right-0 mt-1 w-48
    origin-top-right rounded-md shadow-lg
    bg-neutral-900/95
    border border-neutral-700
    ring-1 ring-black ring-opacity-5
    focus:outline-none
    py-1
    transition ease-out duration-100 transform
    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    max-h-60 overflow-y-auto /* Added max-height and scroll */
  `;

  // Modified itemClasses to use flex for alignment
  const itemClasses = `
    flex items-center justify-between w-full px-3 py-1.5 text-sm /* Adjusted padding */
    text-neutral-200 hover:text-white hover:bg-blue-600/50
    cursor-pointer transition-colors duration-150
  `;

  const selectedItemClasses = `
    bg-blue-600/30 font-medium
  `;

  const backdropClasses = `
    fixed inset-0 z-20
    bg-black/30
    backdrop-blur-sm
    transition-opacity duration-150 ease-out
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={triggerClasses}
        id="language-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={toggleDropdown}
      >
        {/* --- Modified Trigger Content --- */}
        <span className="flex items-center space-x-1.5 flex-grow min-w-0"> {/* Allow shrinking/growing */}
          {currentSelectedLanguage ? (
            <Image
              src={selectedFlagSrc}
              alt={`${currentSelectedLanguage} flag`}
              width={20} // Adjust size as needed
              height={15} // Adjust size (maintain aspect ratio)
              className="flex-shrink-0" // Prevent flag from shrinking
              unoptimized // Often needed for SVGs in public folder
            />
          ) : (
            <IconLanguage size={18} className="text-neutral-400 flex-shrink-0" /> // Show icon if no language selected
          )}
          <span className="truncate">{currentSelectedLanguage || "Select"}</span> {/* Ensure text truncates */}
        </span>
        {/* --- End Modified Trigger Content --- */}

        <IconChevronDown
          size={16}
          className={`transform transition-transform duration-200 text-neutral-400 flex-shrink-0 ${ // Added flex-shrink-0
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Backdrop */}
      <div
        className={backdropClasses}
        aria-hidden="true"
      />

      {/* Dropdown Panel */}
      <ul
        className={menuClasses}
        role="listbox"
        aria-labelledby="language-menu-button"
        aria-orientation="vertical"
        tabIndex={-1}
      >
        {languages.map((language) => {
          const flagSrc = getFlagSrc(language); // Get flag for this option
          const isSelected = language === selectedLanguage;
          return (
            <li
              key={language}
              className={`${itemClasses} ${isSelected ? selectedItemClasses : ""}`}
              onClick={() => handleSelect(language)}
              role="option"
              aria-selected={isSelected}
              id={`language-option-${language.replace(/\s+/g, '-')}`}
            >
              {/* --- Modified List Item Content --- */}
              <span className="flex items-center flex-grow min-w-0 mr-2"> {/* Group flag/text, allow truncate */}
                <Image
                  src={flagSrc}
                  alt={`${language} flag`}
                  width={20} // Match trigger size
                  height={15} // Match trigger size
                  className="mr-2 flex-shrink-0" // Add space between flag and text
                  unoptimized
                />
                <span className="truncate">{language}</span> {/* Language name */}
              </span>
              {/* --- End Modified List Item Content --- */}

              {/* Checkmark stays on the right */}
              {isSelected && (
                <IconCheck size={16} className="text-blue-400 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LanguageSelector;
