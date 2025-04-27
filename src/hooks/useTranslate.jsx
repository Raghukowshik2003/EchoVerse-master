// src/hooks/useTranslate.jsx
import { useEffect, useState } from "react";
import axios from "axios";

// Mapping language names to their ISO codes (Google Cloud uses different codes in some cases)
const languageCodes = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Chinese: "zh", // Simplified Chinese for Google Cloud
  Hindi: "hi",
  Telugu: "te",
  Japanese: "ja",
  Bengali: "bn",
  Italian: "it",
  Arabic: "ar",
  // Add more languages as needed
  
};

const useTranslate = (sourceText, selectedLanguage) => {
  const [targetText, setTargetText] = useState("");

  useEffect(() => {
    const handleTranslate = async (sourceText) => {
      try {
        const targetLang = languageCodes[selectedLanguage] || "en";
        const response = await axios.post('/api/translate', {
            text: sourceText,
            targetLang: targetLang,
        });

        setTargetText(response.data.translatedText);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    };

    if (sourceText.trim()) {
      const timeoutId = setTimeout(() => {
        handleTranslate(sourceText);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [sourceText, selectedLanguage]);

  return targetText;
};

export default useTranslate;
