import ReactCountryFlag from "react-country-flag"

interface FlagIconProps {
  language: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const languageToCountryCode: Record<string, string> = {
  french: "FR",
  german: "DE", 
  spanish: "ES",
  // Add more as needed
  all: "UN", // Use UN flag for "all languages"
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base", 
  lg: "text-lg",
  xl: "text-xl"
};

export function FlagIcon({ language, size = "md", className = "" }: FlagIconProps) {
  const countryCode = languageToCountryCode[language?.toLowerCase()];
  
  if (!countryCode) {
    // Fallback to globe icon for unknown languages
    return <span className={`${sizeClasses[size]} ${className}`}>🌐</span>;
  }

  // For "all languages" show a globe instead of UN flag
  if (language?.toLowerCase() === "all") {
    return <span className={`${sizeClasses[size]} ${className}`}>🌐</span>;
  }

  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{
        width: size === "sm" ? "16px" : size === "md" ? "20px" : size === "lg" ? "24px" : "28px",
        height: size === "sm" ? "12px" : size === "md" ? "15px" : size === "lg" ? "18px" : "21px",
      }}
      className={`inline-block ${className}`}
      title={`${language.charAt(0).toUpperCase() + language.slice(1)} flag`}
    />
  );
}

// Helper function to get language display name
export function getLanguageDisplayName(language: string): string {
  const names: Record<string, string> = {
    french: "French",
    german: "German", 
    spanish: "Spanish",
    all: "All Languages"
  };
  
  return names[language?.toLowerCase()] || language;
}

// Helper component for select options
export function LanguageSelectOption({ language }: { language: string }) {
  return (
    <div className="flex items-center gap-2">
      <FlagIcon language={language} size="sm" />
      <span>{getLanguageDisplayName(language)}</span>
    </div>
  );
}