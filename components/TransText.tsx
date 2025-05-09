import { useAppContext } from "@/context";
import React, { useEffect } from "react";

interface TextProps {
  ar: string;
  fr: string;
  en: string;
}

const TransText: React.FC<TextProps> = (props) => {
  const { language, setLanguage } = useAppContext();

  const allowedLanguages = ["ar", "fr", "en"];

  useEffect(() => {
    if (!allowedLanguages.includes(language)) {
      setLanguage("fr");
    }
  }, [language, setLanguage]);

  return props[language as keyof TextProps] || props["fr"];
};

export default TransText;
