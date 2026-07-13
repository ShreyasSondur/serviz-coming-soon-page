"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

// Country configuration with custom SVG flags
const IndiaFlag = (
  <svg className="w-5 h-3.5 rounded-sm object-cover" viewBox="0 0 3 2">
    <rect width="3" height="0.67" fill="#FF9933" />
    <rect y="0.67" width="3" height="0.67" fill="#FFF" />
    <rect y="1.34" width="3" height="0.67" fill="#138808" />
    <circle cx="1.5" cy="1" r="0.18" fill="#000080" />
  </svg>
);

const OmanFlag = (
  <svg className="w-5 h-3.5 rounded-sm object-cover" viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#D21034" />
    <rect y="0" x="0.75" width="2.25" height="0.67" fill="#FFF" />
    <rect y="1.33" x="0.75" width="2.25" height="0.67" fill="#008000" />
  </svg>
);

const UAEFlag = (
  <svg className="w-5 h-3.5 rounded-sm object-cover" viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#00732F" />
    <rect y="0.66" width="3" height="1.34" fill="#FFF" />
    <rect y="1.33" width="3" height="0.67" fill="#000" />
    <rect width="0.75" height="2" fill="#FF0000" />
  </svg>
);

const KSAFlag = (
  <svg className="w-5 h-3.5 rounded-sm object-cover" viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#006C35" />
    <path d="M0.5,0.8 Q1.5,0.6 2.5,0.8 M0.8,1.4 L2.2,1.4 M2.1,1.3 L2.2,1.4 L2.1,1.5" stroke="#FFF" strokeWidth="0.1" fill="none" strokeLinecap="round" />
  </svg>
);

const countries = [
  { name: "UAE", code: "AE", domain: "servizuae.com", flag: UAEFlag, ready: true },
  { name: "India", code: "IN", domain: "servizind.com", flag: IndiaFlag, ready: false },
  { name: "Oman", code: "OM", domain: "servizoman.com", flag: OmanFlag, ready: false },
  { name: "KSA", code: "SA", domain: "servizksa.com", flag: KSAFlag, ready: false },
];

export default function ComingSoon() {
  const [activeCountry, setActiveCountry] = useState(countries[1]); // Default to a coming soon country if un-detected
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [suggestedLocation, setSuggestedLocation] = useState<typeof countries[0] | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Basic frontend domain detection just for UI purposes
    const hostname = window.location.hostname;
    let initialCountry = countries[1]; // Default
    let isOnLocalizedDomain = false;

    if (hostname.includes("servizind.com")) { initialCountry = countries.find(c => c.code === "IN")!; isOnLocalizedDomain = true; }
    else if (hostname.includes("servizoman.com")) { initialCountry = countries.find(c => c.code === "OM")!; isOnLocalizedDomain = true; }
    else if (hostname.includes("servizksa.com")) { initialCountry = countries.find(c => c.code === "SA")!; isOnLocalizedDomain = true; }
    else if (hostname.includes("servizuae.com")) { initialCountry = countries.find(c => c.code === "AE")!; isOnLocalizedDomain = true; }

    setActiveCountry(initialCountry);

    // If user previously made a manual choice, DO NOT bother them with IP detection popups.
    const hasUserMadeChoice = localStorage.getItem("userSelectedCountry");

    if (!hasUserMadeChoice) {
      // Fetch IP config for automatic location detection using GeoJS (more reliable, no CORS/adblock issues)
      fetch("https://get.geojs.io/v1/ip/country.json")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            const detectedCountry = countries.find((c) => c.code === data.country);
            if (detectedCountry) {
              // Only auto-update the active country if we are on a non-localized domain (like localhost or a global domain)
              if (!isOnLocalizedDomain) {
                setActiveCountry(detectedCountry);
              }
              // Show popup if they are not on the localized domain
              if (hostname !== detectedCountry.domain && !hostname.includes(detectedCountry.domain)) {
                setSuggestedLocation(detectedCountry);
                setShowLocationPopup(true);
              }
            }
          }
        })
        .catch((err) => console.error("IP config error:", err));
    } else {
      // If they made a choice and are on a non-localized domain, respect their choice
      if (!isOnLocalizedDomain) {
        const savedCountry = countries.find(c => c.code === hasUserMadeChoice);
        if (savedCountry) setActiveCountry(savedCountry);
      }
    }
  }, []);

  const handleCountrySelect = (country: typeof countries[0]) => {
    localStorage.setItem("userSelectedCountry", country.code);
    setActiveCountry(country);
    setIsCountryDropdownOpen(false);
    // As requested: "be there only" - no automatic redirect from the dropdown. 
    // It only updates the UI and saves their preference.
  };

  const handlePopupRedirect = (country: typeof countries[0]) => {
    localStorage.setItem("userSelectedCountry", country.code);
    window.location.href = `https://${country.domain}`;
  };

  const handlePopupStay = () => {
    localStorage.setItem("userSelectedCountry", activeCountry.code);
    setShowLocationPopup(false);
  };

  return (
    <main className="min-h-screen bg-[#0B0A0A] text-white flex flex-col relative overflow-hidden">

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0b0a0a]/95 backdrop-blur-md border-b border-white/5 h-20">
        <div className="w-full h-full mx-auto px-6 lg:px-12 flex items-center justify-between relative">

          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-2xl md:text-3xl font-black italic tracking-wide text-white uppercase select-none transition-transform group-hover:scale-[1.02]">
              SERV
              <span className="text-gold font-extrabold text-glow">
                IZ
              </span>
            </span>
          </div>

          <div className="relative" ref={countryDropdownRef}>
            <button
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#141414]/90 hover:bg-[#202020]/90 text-white px-3 py-2 rounded-full border border-white/10 hover:border-gold/30 transition-all text-sm font-sans font-semibold cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2">
                {activeCountry.flag}
                <span className="text-[#D4D2CD] group-hover:text-white tracking-wide">{activeCountry.name}</span>
              </div>
              <svg className={`w-3.5 h-3.5 text-white/45 transition-transform duration-250 ${isCountryDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCountryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl py-1.5 flex flex-col z-50 animate-in fade-in duration-200">
                {countries.map((country) => (
                  <button
                    key={country.name}
                    onClick={() => handleCountrySelect(country)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer w-full hover:bg-gold/10 hover:text-gold ${activeCountry.name === country.name
                        ? "bg-white/5 text-gold font-bold"
                        : "text-[#D4D2CD]"
                      }`}
                  >
                    {country.flag}
                    <span className="font-sans tracking-wider">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 hero-overlay">
        <div className="max-w-3xl w-full mx-auto text-center z-10 glass-card p-8 sm:p-10 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden animate-slide-up">

          {/* Subtle glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col items-center gap-6 relative z-10">
            {/* Premium Animated Icon */}
            <div className="relative mb-4 group cursor-default">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl group-hover:bg-gold/30 transition-colors duration-700" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#1E1C1A] to-[#0B0A0A] border border-gold/30 flex items-center justify-center relative shadow-[0_0_40px_rgba(201,152,63,0.15)]">
                {/* Rotating border effect */}
                <div className="absolute inset-[-1px] rounded-full border border-transparent border-t-gold/50 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-[-6px] rounded-full border border-white/5 border-b-gold/20 animate-[spin_5s_linear_infinite_reverse]" />

                {/* Location Map Pin Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gold drop-shadow-[0_0_12px_rgba(201,152,63,0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>

                {/* Twinkling Sparkle */}
                <svg className="absolute top-4 right-4 w-4 h-4 text-white animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1l2.8 7.2L22 11l-7.2 2.8L12 21l-2.8-7.2L2 11l7.2-2.8L12 1z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
                Expanding to <br className="sm:hidden" />
                <span className="text-gold text-glow relative inline-block mt-1 sm:mt-0">
                  Your Region
                  <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#A19D94] font-sans max-w-lg mx-auto leading-relaxed mt-4 px-2 sm:px-0">
                Our services are not currently available in your region. We look forward to serving you in the near future
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Suggestion Popup */}
      {showLocationPopup && suggestedLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-gold/20 rounded-3xl p-8 sm:p-10 max-w-[460px] w-full shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            
            {/* Flag Icon */}
            <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mb-6 bg-transparent">
              <div className="scale-150">
                {suggestedLocation.flag}
              </div>
            </div>

            <h3 className="text-2xl sm:text-[26px] font-serif font-bold text-white mb-5">
              Are you visiting from {suggestedLocation.name}?
            </h3>
            
            <p className="text-[#A19D94] text-[15px] sm:text-base leading-relaxed mb-8 px-2">
              We detected your location is {suggestedLocation.name}. Would you like to switch to our local site <span className="text-gold font-medium">{suggestedLocation.domain}</span> to get localized services, partner support, and special deals?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button 
                onClick={() => handlePopupRedirect(suggestedLocation)}
                className="flex-1 bg-gold text-black py-3 sm:py-3.5 px-4 rounded-full font-semibold hover:bg-gold/90 transition-colors text-[15px]"
              >
                Go to {suggestedLocation.domain}
              </button>
              <button 
                onClick={handlePopupStay}
                className="flex-1 bg-transparent border border-white/10 text-[#A19D94] hover:text-white py-3 sm:py-3.5 px-4 rounded-full hover:bg-white/5 transition-colors text-[15px]"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
