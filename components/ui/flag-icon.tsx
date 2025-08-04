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
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          width: size === "sm" ? "20px" : size === "md" ? "24px" : size === "lg" ? "28px" : "32px",
          height: size === "sm" ? "15px" : size === "md" ? "18px" : size === "lg" ? "21px" : "24px",
        }}
      >
        <span className={`${sizeClasses[size]}`}>🌐</span>
      </div>
    );
  }

  // For "all languages" show a globe instead of UN flag
  if (language?.toLowerCase() === "all") {
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          width: size === "sm" ? "20px" : size === "md" ? "24px" : size === "lg" ? "28px" : "32px",
          height: size === "sm" ? "15px" : size === "md" ? "18px" : size === "lg" ? "21px" : "24px",
        }}
      >
        <span className={`${sizeClasses[size]}`}>🌐</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size === "sm" ? "20px" : size === "md" ? "24px" : size === "lg" ? "28px" : "32px",
        height: size === "sm" ? "15px" : size === "md" ? "18px" : size === "lg" ? "21px" : "24px",
      }}
    >
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }}
        title={`${language.charAt(0).toUpperCase() + language.slice(1)} flag`}
      />
    </div>
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