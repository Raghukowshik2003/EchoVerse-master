// src/components/Inputs/DetailedVoiceSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IconMicrophone, IconChevronDown, IconCheck } from '@tabler/icons-react'; // Or other relevant icons
import useOnClickOutside from '@/hooks/useOnClickOutside';

// Interface for the voice options passed as props
interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  languageCode: string;
  // Add other fields if needed for display (e.g., languageCode, gender)
}

interface DetailedVoiceSelectorProps {
  availableVoices: VoiceOption[];
  selectedVoiceId: string | null;
  setSelectedVoiceId: (id: string | null) => void;
  className?: string; // Optional styling
}

// --- ADD THIS HELPER FUNCTION ---
const getIconPrefixFromLanguageCode = (langCode: string): string => {
  switch (langCode) {
    case 'en-US': return 'american';
    case 'zh-CN': return 'chinese';
    case 'fr-FR': return 'French'; // Note: Case matches your filename 'FrenchM.png'
    case 'hi-IN': return 'indian';
    case 'es-ES': return 'spanish';
    case 'de-DE': return 'german';
    case 'te-IN': return 'indian'; // Or create a separate "telugu" prefix
    case  'ja-JP': return 'japanese'; // Or create a separate "japanese" prefix
    case 'bn-IN': return 'indian'; // Or create a separate "bengali" prefix
    case 'it-IT': return 'italian'; // Or create a separate "italian" prefix
    case 'ar-XA': return 'arabic'; // Or create a separate "arabic" prefix
    default: return ''; // Return empty string or a default prefix if needed
  }
};

const DetailedVoiceSelector: React.FC<DetailedVoiceSelectorProps> = ({
  availableVoices,
  selectedVoiceId,
  setSelectedVoiceId,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const handleSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    setIsOpen(false);
  };

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const selectedVoice = availableVoices.find(v => v.id === selectedVoiceId);
  const displayLabel = selectedVoice ? selectedVoice.name : "Select Voice...";

  const triggerClasses = `
    relative flex items-center justify-between w-full cursor-pointer
    rounded-md border border-neutral-700 hover:border-neutral-500
    bg-black/50 hover:bg-black/70
    px-2 py-1.5 text-sm text-white transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    space-x-2 z-30 ${className}
  `;

  const menuClasses = `
    absolute z-40 left-0 right-0 mt-1 w-full /* Make dropdown full width of trigger */
    origin-top rounded-md shadow-lg
    bg-neutral-900/95
    border border-neutral-700
    ring-1 ring-black ring-opacity-5
    focus:outline-none
    py-1
    transition ease-out duration-100 transform
    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    max-h-60 overflow-y-auto /* Scroll for many voices */
  `;

  const itemClasses = `
    flex items-center justify-between w-full px-3 py-1.5 text-sm
    text-neutral-200 hover:text-white hover:bg-blue-600/50
    cursor-pointer transition-colors duration-150
  `;

  const selectedItemClasses = `
    bg-blue-600/30 font-medium
  `;

  return (
    <div className="relative inline-block text-left w-[200px]" ref={dropdownRef}> {/* Adjust width */}
      {/* Trigger Button */}
      <button
        type="button"
        className={triggerClasses}
        id="voice-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={toggleDropdown}
        title={displayLabel} // Show full name on hover
      >
        <span className="flex items-center space-x-1.5 flex-grow min-w-0">
          <IconMicrophone size={16} className="text-neutral-400 flex-shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </span>
        <IconChevronDown
          size={16}
          className={`transform transition-transform duration-200 text-neutral-400 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && ( // Conditionally render for performance if many items
        <ul
          className={menuClasses}
          role="listbox"
          aria-labelledby="voice-menu-button"
          aria-orientation="vertical"
          tabIndex={-1}
        >
          {/* Optional: Add a "None" or "Default" option if needed */}
          {/* <li className={itemClasses} onClick={() => handleSelect(null)}>Select Voice...</li> */}
          {availableVoices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const prefix = getIconPrefixFromLanguageCode(voice.languageCode);
          const genderSuffix = voice.gender === 'Male' ? 'M' : 'F';
          let iconSrc = ''; // Default to empty
          if (prefix) { // Only construct path if prefix exists
              iconSrc = `/voices/${prefix}${genderSuffix}.png`;
          }
            return (
              <li
                key={voice.id}
                className={`${itemClasses} ${isSelected ? selectedItemClasses : ""}`}
                onClick={() => handleSelect(voice.id)}
                role="option"
                aria-selected={isSelected}
                id={`voice-option-${voice.id}`}
              >

                  <span className="flex items-center flex-grow min-w-0 mr-2">
                  {/* --- ADDED: Gender Icon --- */}
                  <img
                    src={iconSrc}
                    alt={`${prefix} ${voice.gender}`} // Accessibility: Describe the icon
                    className="w-4 h-4 mr-2 flex-shrink-0" // Adjust size (w-4 h-4) and margin (mr-2) as needed
                  />
                  {/* --- Voice Name --- */}
                <span className="truncate flex-grow">{voice.name}</span>
                </span>
                {isSelected && (
                  <IconCheck size={16} className="text-blue-400 flex-shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
export default DetailedVoiceSelector;
