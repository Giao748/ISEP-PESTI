"use client";
import { useEffect, useState } from "react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "pt-BR", label: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "sv", label: "Swedish", flag: "🇸🇪" },
  { code: "da", label: "Danish", flag: "🇩🇰" },
  { code: "fi", label: "Finnish", flag: "🇫🇮" },
  { code: "no", label: "Norwegian", flag: "🇳🇴" },
  { code: "pl", label: "Polish", flag: "🇵🇱" },
  { code: "ro", label: "Romanian", flag: "🇷🇴" },
  { code: "hu", label: "Hungarian", flag: "🇭🇺" },
  { code: "cs", label: "Czech", flag: "🇨🇿" },
  { code: "sk", label: "Slovak", flag: "🇸🇰" },
  { code: "sl", label: "Slovenian", flag: "🇸🇮" },
  { code: "hr", label: "Croatian", flag: "🇭🇷" },
  { code: "el", label: "Greek", flag: "🇬🇷" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "uk", label: "Ukrainian", flag: "🇺🇦" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "he", label: "Hebrew", flag: "🇮🇱" },
  { code: "zh", label: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", label: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", flag: "🇧🇩" },
  { code: "th", label: "Thai", flag: "🇹🇭" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { code: "id", label: "Indonesian", flag: "🇮🇩" },
  { code: "ms", label: "Malay", flag: "🇲🇾" },
  { code: "fil", label: "Filipino", flag: "🇵🇭" },
  { code: "sw", label: "Swahili", flag: "🇰🇪" },
  { code: "fa", label: "Persian", flag: "🇮🇷" },
  { code: "ur", label: "Urdu", flag: "🇵🇰" },
  { code: "bg", label: "Bulgarian", flag: "🇧🇬" },
  { code: "et", label: "Estonian", flag: "🇪🇪" },
  { code: "lv", label: "Latvian", flag: "🇱🇻" },
  { code: "lt", label: "Lithuanian", flag: "🇱🇹" },
  { code: "mt", label: "Maltese", flag: "🇲🇹" },
  { code: "ga", label: "Irish", flag: "🇮🇪" },
  { code: "is", label: "Icelandic", flag: "🇮🇸" },
  { code: "sq", label: "Albanian", flag: "🇦🇱" },
  { code: "mk", label: "Macedonian", flag: "🇲🇰" },
  { code: "bs", label: "Bosnian", flag: "🇧🇦" },
  { code: "sr", label: "Serbian", flag: "🇷🇸" },
  { code: "me", label: "Montenegrin", flag: "🇲🇪" },
  { code: "hy", label: "Armenian", flag: "🇦🇲" },
  { code: "az", label: "Azerbaijani", flag: "🇦🇿" },
  { code: "ka", label: "Georgian", flag: "🇬🇪" }
];

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(langCode);
    }
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="h-10 flex items-center space-x-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-100 transition"
      >
        <span>{languages.find((l) => l.code === currentLang)?.flag}</span>
        <span>{currentLang.toUpperCase()}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 max-h-64 overflow-y-auto bg-white border rounded shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left"
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default LanguageSelector;
