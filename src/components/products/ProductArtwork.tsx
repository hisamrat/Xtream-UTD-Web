import type { Product } from "@/lib/product-schema";
import type { CSSProperties } from "react";

type ProductArtworkProps = {
  product: Product;
  compact?: boolean;
};

export function ProductArtwork({ product, compact = false }: ProductArtworkProps) {
  const accent = product.accent || "#3385FF";

  if (compact) {
    return (
      <div
        aria-hidden="true"
        className="product-art product-art-compact"
        style={{ "--art-accent": accent } as CSSProperties}
        data-compact="true"
      >
        <CompactHardwareIcon kind={product.kind} accent={accent} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`product-art product-art-full art-${product.kind}`}
      style={{ "--art-accent": accent } as CSSProperties}
      data-compact="false"
    >
      <HardwareVectorArtwork kind={product.kind} accent={accent} title={product.title} />
    </div>
  );
}

function CompactHardwareIcon({ kind, accent }: { kind: string; accent: string }) {
  const normalized = kind.toLowerCase();

  if (normalized.includes("camera") || normalized.includes("cinema")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="4" y="9" width="32" height="24" rx="5" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <path d="M12 9L15 4.5H25L28 9" stroke={accent} strokeWidth="1.75" strokeLinejoin="round" strokeOpacity="0.9" />
        <circle cx="20" cy="21" r="7.5" fill="#0A0D14" stroke="#F5F1E8" strokeWidth="1.75" />
        <circle cx="20" cy="21" r="3.2" fill={accent} />
        <circle cx="30" cy="14" r="1.8" fill="#FF453A" />
      </svg>
    );
  }

  if (normalized.includes("mic")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="13" y="6" width="14" height="20" rx="7" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <path d="M8 18C8 24.5 13 29.5 20 29.5C27 29.5 32 24.5 32 18" stroke="#F5F1E8" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M20 29.5V36M14 36H26" stroke="#F5F1E8" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.85" />
        <circle cx="20" cy="13" r="2.5" fill={accent} />
      </svg>
    );
  }

  if (normalized.includes("tripod")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="15" y="4" width="10" height="7" rx="2" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <path d="M20 11V23" stroke="#F5F1E8" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M20 23L9 37" stroke={accent} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M20 23L20 37" stroke="#F5F1E8" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M20 23L31 37" stroke={accent} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="20" cy="7.5" r="1.8" fill={accent} />
      </svg>
    );
  }

  if (normalized.includes("light") || normalized.includes("lamp")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <path d="M10 10L30 4.5V31.5L10 26V10Z" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <circle cx="10" cy="18" r="4.5" fill={accent} />
        <path d="M30 18H37M33 11L38 8.5M33 25L38 27.5" stroke={accent} strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.85" />
      </svg>
    );
  }

  if (normalized.includes("monitor")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="4" y="8" width="32" height="22" rx="4" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <rect x="7.5" y="11.5" width="25" height="15" rx="2" fill="#0A0D14" />
        <circle cx="11" cy="15" r="1.8" fill="#FF453A" />
        <path d="M13 22L17 18L22 23L28 17" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized.includes("gimbal")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="13" y="4" width="14" height="9" rx="2.5" fill="#141822" stroke="#F5F1E8" strokeWidth="1.5" />
        <path d="M13 9C6 11 6 22 15 24.5H25C34 22 34 11 27 9" stroke={accent} strokeWidth="1.75" strokeLinecap="round" />
        <rect x="17.5" y="26" width="5" height="12" rx="2.5" fill="#141822" stroke={accent} strokeWidth="1.75" />
      </svg>
    );
  }

  if (normalized.includes("headphone") || normalized.includes("earbud") || normalized.includes("speaker")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <path d="M8 23V17C8 10.5 13.5 5 20 5C26.5 5 32 10.5 32 17V23" stroke="#F5F1E8" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.85" />
        <rect x="5.5" y="20" width="6.5" height="13" rx="3" fill={accent} stroke="#0A0D14" strokeWidth="1.2" />
        <rect x="28" y="20" width="6.5" height="13" rx="3" fill={accent} stroke="#0A0D14" strokeWidth="1.2" />
      </svg>
    );
  }

  if (normalized.includes("lens")) {
    return (
      <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
        <rect x="9" y="7" width="22" height="26" rx="4" fill="#141822" stroke={accent} strokeWidth="1.75" strokeOpacity="0.9" />
        <line x1="9" y1="15" x2="31" y2="15" stroke="#F5F1E8" strokeWidth="1.2" strokeOpacity="0.6" />
        <line x1="9" y1="23" x2="31" y2="23" stroke="#F5F1E8" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="20" cy="11" r="3.5" fill={accent} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" className="compact-art-svg" fill="none">
      <circle cx="20" cy="20" r="15" fill={accent} fillOpacity="0.22" />
      <circle cx="20" cy="20" r="9.5" fill="#141822" stroke={accent} strokeWidth="1.75" />
      <circle cx="20" cy="20" r="4.5" fill={accent} />
    </svg>
  );
}

function HardwareVectorArtwork({ kind, accent, title }: { kind: string; accent: string; title: string }) {
  const norm = kind.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // 1. CAMERAS
  if (norm.includes("camera") || lowerTitle.includes("sony") || lowerTitle.includes("canon") || lowerTitle.includes("blackmagic")) {
    const isCanon = lowerTitle.includes("canon") || lowerTitle.includes("eos");

    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <defs>
          <radialGradient id={`cam-lens-${accent.replace("#", "")}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B101D" />
            <stop offset="50%" stopColor="#080C14" />
            <stop offset="85%" stopColor="#1A2838" />
            <stop offset="100%" stopColor="#253C58" />
          </radialGradient>
          <linearGradient id={`cam-body-${accent.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#252A36" />
            <stop offset="50%" stopColor="#171A22" />
            <stop offset="100%" stopColor="#0D0F14" />
          </linearGradient>
        </defs>
        <ellipse cx="90" cy="128" rx="68" ry="8" fill="#000" fillOpacity="0.55" filter="blur(6px)" />
        <rect x="26" y="38" width="128" height="82" rx="14" fill={`url(#cam-body-${accent.replace("#", "")})`} stroke="#3A4252" strokeWidth="1.5" />
        <rect x="26" y="42" width="30" height="74" rx="10" fill="#12141A" stroke="#252B38" strokeWidth="1" />
        <line x1="32" y1="52" x2="32" y2="106" stroke="#2D3546" strokeWidth="1.5" strokeDasharray="2 3" />
        <line x1="38" y1="52" x2="38" y2="106" stroke="#2D3546" strokeWidth="1.5" strokeDasharray="2 3" />
        <line x1="44" y1="52" x2="44" y2="106" stroke="#2D3546" strokeWidth="1.5" strokeDasharray="2 3" />
        <path d="M72 38L78 22H118L124 38H72Z" fill="#1A1E27" stroke="#3A4252" strokeWidth="1.5" />
        <rect x="86" y="20" width="24" height="4" rx="1.5" fill="#2E3646" />
        <rect x="36" y="30" width="14" height="8" rx="2" fill="#3D4556" />
        <rect x="132" y="32" width="16" height="6" rx="2" fill="#2D3546" />
        <rect x="120" y="30" width="10" height="8" rx="2" fill="#3D4556" />
        <circle cx="58" cy="50" r="3.5" fill={isCanon ? "#FF3B30" : accent} />
        <rect x="88" y="27" width="20" height="3" rx="1.5" fill="#E8EDF5" fillOpacity="0.75" />
        <circle cx="102" cy="79" r="38" fill="#1A1F2B" stroke="#485368" strokeWidth="2" />
        <circle cx="102" cy="79" r="34" fill="#0C0E14" stroke="#2C3444" strokeWidth="2" />
        <circle cx="102" cy="79" r="28" fill={`url(#cam-lens-${accent.replace("#", "")})`} />
        <path d="M84 66C90 58 106 56 118 64" stroke="#4CC9F0" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.65" />
        <path d="M88 92C96 98 112 98 120 90" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
        <circle cx="106" cy="73" r="5" fill="#FFFFFF" fillOpacity="0.45" filter="blur(1px)" />
        <circle cx="102" cy="79" r="8" fill="#04060A" stroke={accent} strokeWidth="1" strokeOpacity="0.7" />
      </svg>
    );
  }

  // 2. GIMBALS / STABILIZERS
  if (norm.includes("gimbal") || lowerTitle.includes("dji") || lowerTitle.includes("rs 3") || lowerTitle.includes("stabilizer")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="130" rx="55" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <path d="M90 122L62 134M90 122L90 135M90 122L118 134" stroke="#2D3546" strokeWidth="4" strokeLinecap="round" />
        <rect x="83" y="78" width="14" height="44" rx="4" fill="#1B202A" stroke="#3A4456" strokeWidth="1.5" />
        <line x1="87" y1="84" x2="87" y2="114" stroke="#364052" strokeWidth="1.5" strokeDasharray="2 3" />
        <line x1="93" y1="84" x2="93" y2="114" stroke="#364052" strokeWidth="1.5" strokeDasharray="2 3" />
        <rect x="85" y="82" width="10" height="12" rx="2" fill="#0C0E14" stroke={accent} strokeWidth="1" />
        <circle cx="90" cy="104" r="2.5" fill="#4B566C" />
        <rect x="79" y="68" width="22" height="10" rx="3" fill="#2E3646" stroke={accent} strokeWidth="1.5" />
        <path d="M101 73C122 73 134 54 130 38C126 24 104 22 88 22" stroke="#2E3646" strokeWidth="6" strokeLinecap="round" />
        <path d="M101 73C122 73 134 54 130 38C126 24 104 22 88 22" stroke="#48556D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="128" cy="38" r="8" fill="#1C212C" stroke={accent} strokeWidth="1.5" />
        <path d="M88 22H54C48 22 46 36 50 48L64 54" stroke="#384357" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="62" y="32" width="38" height="24" rx="4" fill="#141822" stroke="#4E5C74" strokeWidth="1.5" />
        <circle cx="81" cy="44" r="8" fill="#0C0E14" stroke={accent} strokeWidth="1.5" />
        <circle cx="81" cy="44" r="3" fill={accent} />
        <circle cx="101" cy="73" r="2.5" fill="#FF3B30" />
        <circle cx="88" cy="22" r="2.5" fill="#FF3B30" />
      </svg>
    );
  }

  // 3. MICROPHONES / WIRELESS GO
  if (norm.includes("mic") || lowerTitle.includes("rode") || lowerTitle.includes("wireless") || lowerTitle.includes("sennheiser mic")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="126" rx="60" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="42" y="36" width="46" height="52" rx="8" fill="#161A24" stroke="#3A4354" strokeWidth="1.5" />
        <rect x="48" y="44" width="34" height="20" rx="4" fill="#0A0C12" stroke="#252C3A" strokeWidth="1" />
        <circle cx="56" cy="50" r="1.5" fill="#6B7892" />
        <circle cx="62" cy="50" r="1.5" fill="#6B7892" />
        <circle cx="68" cy="50" r="1.5" fill="#6B7892" />
        <circle cx="74" cy="50" r="1.5" fill="#6B7892" />
        <circle cx="56" cy="56" r="1.5" fill="#6B7892" />
        <circle cx="62" cy="56" r="1.5" fill="#6B7892" />
        <circle cx="68" cy="56" r="1.5" fill="#6B7892" />
        <circle cx="74" cy="56" r="1.5" fill="#6B7892" />
        <rect x="52" y="70" width="26" height="10" rx="2" fill="#0D1017" />
        <rect x="55" y="73" width="10" height="4" rx="1" fill={accent} />
        <rect x="68" y="73" width="7" height="4" rx="1" fill="#30D158" />

        <rect x="92" y="28" width="50" height="58" rx="9" fill="#1B202D" stroke={accent} strokeWidth="1.5" />
        <rect x="99" y="36" width="36" height="28" rx="4" fill="#06080E" stroke="#2C3546" strokeWidth="1" />
        <rect x="103" y="42" width="12" height="4" rx="1" fill="#30D158" />
        <rect x="119" y="42" width="12" height="4" rx="1" fill="#30D158" />
        <line x1="103" y1="52" x2="131" y2="52" stroke="#48556D" strokeWidth="1" />
        <line x1="103" y1="56" x2="123" y2="56" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="103" y1="60" x2="117" y2="60" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="117" cy="98" r="4" fill="#E5A93C" stroke="#8A6016" strokeWidth="1" />
        <circle cx="132" cy="74" r="2.5" fill="#E5A93C" />
      </svg>
    );
  }

  // 4. STUDIO LIGHTS / COB LED / LAMPS
  if (norm.includes("light") || norm.includes("lamp") || lowerTitle.includes("godox") || lowerTitle.includes("aputure") || lowerTitle.includes("sl60")) {
    const isSunsetLamp = lowerTitle.includes("sunset") || lowerTitle.includes("aurora") || lowerTitle.includes("projector");

    if (isSunsetLamp) {
      return (
        <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
          <ellipse cx="90" cy="128" rx="50" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
          <rect x="66" y="118" width="48" height="10" rx="5" fill="#1C202B" stroke="#3A4354" strokeWidth="1.5" />
          <rect x="87" y="55" width="6" height="65" rx="3" fill="#D4AF37" stroke="#9A7B1C" strokeWidth="1" />
          <circle cx="90" cy="42" r="26" fill="#141822" stroke="#3A4354" strokeWidth="2" />
          <circle cx="90" cy="42" r="20" fill="url(#sunset-glow)" />
          <circle cx="90" cy="42" r="14" fill="#FFE066" fillOpacity="0.85" />
          <circle cx="86" cy="38" r="5" fill="#FFFFFF" fillOpacity="0.75" filter="blur(1px)" />
          <defs>
            <radialGradient id="sunset-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="40%" stopColor="#FF7A00" />
              <stop offset="85%" stopColor="#FF0055" />
              <stop offset="100%" stopColor="#660066" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="60" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <path d="M46 76C46 102 72 116 90 116C108 116 134 102 134 76" stroke="#384357" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="85" y="114" width="10" height="14" rx="2" fill="#242B38" stroke="#48556D" strokeWidth="1" />
        <circle cx="46" cy="76" r="6" fill="#1A1E28" stroke={accent} strokeWidth="1.5" />
        <circle cx="134" cy="76" r="6" fill="#1A1E28" stroke={accent} strokeWidth="1.5" />
        <rect x="82" y="34" width="58" height="52" rx="8" fill="#181D27" stroke="#3E475A" strokeWidth="1.5" />
        <line x1="90" y1="42" x2="132" y2="42" stroke="#2C3545" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="48" x2="132" y2="48" stroke="#2C3545" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="54" x2="132" y2="54" stroke="#2C3545" strokeWidth="2" strokeLinecap="round" />
        <path d="M84 38L32 18V98L84 78V38Z" fill="#283040" stroke="#4E5A72" strokeWidth="1.5" />
        <ellipse cx="32" cy="58" rx="10" ry="40" fill="#0E121B" stroke="#687694" strokeWidth="2" />
        <ellipse cx="34" cy="58" rx="6" ry="24" fill={accent} fillOpacity="0.4" />
        <circle cx="35" cy="58" r="8" fill="#FFF5D6" />
        <circle cx="35" cy="58" r="5" fill="#FFE58F" />
        <path d="M30 30L12 10M30 58H8M30 86L12 106" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.65" />
      </svg>
    );
  }

  // 5. HEADPHONES
  if (norm.includes("headphone") || lowerTitle.includes("sennheiser") || lowerTitle.includes("hd 660") || lowerTitle.includes("audio")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="55" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <path d="M42 70C42 32 64 16 90 16C116 16 138 32 138 70" stroke="#3A4456" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 68C48 36 67 22 90 22C113 22 132 36 132 68" stroke="#1B202B" strokeWidth="4" strokeLinecap="round" />
        <path d="M66 22C74 18 106 18 114 22" stroke="#252C3A" strokeWidth="6" strokeLinecap="round" />
        <path d="M38 68V86M44 68V86" stroke="#4E5A70" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="28" y="60" width="24" height="52" rx="12" fill="#141822" stroke="#3A4456" strokeWidth="1.5" />
        <rect x="32" y="66" width="16" height="40" rx="8" fill="#0A0D14" stroke={accent} strokeWidth="1" />
        <circle cx="40" cy="78" r="1.5" fill="#4B566D" />
        <circle cx="40" cy="86" r="1.5" fill="#4B566D" />
        <circle cx="40" cy="94" r="1.5" fill="#4B566D" />

        <path d="M136 68V86M142 68V86" stroke="#4E5A70" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="128" y="60" width="24" height="52" rx="12" fill="#141822" stroke="#3A4456" strokeWidth="1.5" />
        <rect x="132" y="66" width="16" height="40" rx="8" fill="#0A0D14" stroke={accent} strokeWidth="1" />
        <circle cx="140" cy="78" r="1.5" fill="#4B566D" />
        <circle cx="140" cy="86" r="1.5" fill="#4B566D" />
        <circle cx="140" cy="94" r="1.5" fill="#4B566D" />
        <path d="M40 112L38 124M140 112L142 124" stroke="#2D3546" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 6. LENSES
  if (norm.includes("lens") || lowerTitle.includes("sigma") || lowerTitle.includes("24-70") || lowerTitle.includes("f2.8")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="46" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="58" y="24" width="64" height="96" rx="6" fill="#171B24" stroke="#384356" strokeWidth="1.5" />
        <rect x="56" y="44" width="68" height="26" rx="3" fill="#0F121A" stroke="#293140" strokeWidth="1" />
        <line x1="62" y1="46" x2="62" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="68" y1="46" x2="68" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="74" y1="46" x2="74" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="80" y1="46" x2="80" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="86" y1="46" x2="86" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="92" y1="46" x2="92" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="98" y1="46" x2="98" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="104" y1="46" x2="104" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="110" y1="46" x2="110" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <line x1="116" y1="46" x2="116" y2="68" stroke="#3D485C" strokeWidth="1.5" />
        <rect x="74" y="74" width="32" height="10" rx="2" fill="#0A0C12" stroke="#48566E" strokeWidth="1" />
        <text x="90" y="82" fontSize="6" fill="#00E5FF" textAnchor="middle" fontFamily="monospace">24-70mm</text>
        <rect x="56" y="88" width="68" height="18" rx="2" fill="#12151E" stroke="#2A3342" strokeWidth="1" />
        <rect x="68" y="120" width="44" height="6" rx="1.5" fill="#8896AB" />
        <ellipse cx="90" cy="24" rx="32" ry="8" fill="#1D2330" stroke="#526078" strokeWidth="1.5" />
        <ellipse cx="90" cy="24" rx="26" ry="6" fill="#090E17" />
        <ellipse cx="90" cy="24" rx="18" ry="4" fill={accent} fillOpacity="0.4" />
      </svg>
    );
  }

  // 7. MONITORS / RECORDERS
  if (norm.includes("monitor") || lowerTitle.includes("ninja") || lowerTitle.includes("atomos") || lowerTitle.includes("recorder")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="64" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="28" y="24" width="124" height="88" rx="10" fill="#181C26" stroke="#3B4558" strokeWidth="2" />
        <rect x="25" y="28" width="6" height="16" rx="2" fill="#2E3748" />
        <rect x="149" y="28" width="6" height="16" rx="2" fill="#2E3748" />
        <rect x="25" y="90" width="6" height="16" rx="2" fill="#2E3748" />
        <rect x="149" y="90" width="6" height="16" rx="2" fill="#2E3748" />
        <rect x="36" y="32" width="108" height="72" rx="4" fill="#07090F" stroke="#252D3C" strokeWidth="1.5" />
        <rect x="42" y="38" width="22" height="8" rx="2" fill="#FF3B30" />
        <text x="53" y="44.5" fontSize="5.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">REC ●</text>
        <text x="138" y="44" fontSize="5.5" fill="#30D158" textAnchor="end" fontFamily="monospace">4K 60P</text>
        <line x1="138" y1="56" x2="138" y2="88" stroke="#30D158" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="134" y1="62" x2="134" y2="88" stroke="#30D158" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M46 86C56 70 68 84 80 62C92 88 106 54 122 86" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 8. TRIPODS / SUPPORT
  if (norm.includes("tripod") || lowerTitle.includes("manfrotto") || lowerTitle.includes("support")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="132" rx="60" ry="6" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="82" y="14" width="16" height="10" rx="2" fill="#1C212D" stroke={accent} strokeWidth="1.5" />
        <circle cx="90" cy="30" r="8" fill="#384356" stroke="#5E6D88" strokeWidth="1.5" />
        <rect x="98" y="26" width="8" height="6" rx="1.5" fill="#FF3B30" />
        <path d="M76 42H104L100 50H80L76 42Z" fill="#181D26" stroke="#48566D" strokeWidth="1.5" />
        <circle cx="90" cy="46" r="3" fill="#E5A93C" />
        <line x1="78" y1="50" x2="42" y2="128" stroke="#1E232E" strokeWidth="6" strokeLinecap="round" />
        <line x1="78" y1="50" x2="42" y2="128" stroke="#4A566E" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
        <rect x="58" y="82" width="6" height="6" rx="1" fill="#FF3B30" />
        <circle cx="42" cy="128" r="3.5" fill="#0C0E14" />
        <line x1="90" y1="50" x2="90" y2="128" stroke="#1E232E" strokeWidth="6" strokeLinecap="round" />
        <line x1="90" y1="50" x2="90" y2="128" stroke="#4A566E" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
        <rect x="87" y="82" width="6" height="6" rx="1" fill="#FF3B30" />
        <circle cx="90" cy="128" r="3.5" fill="#0C0E14" />
        <line x1="102" y1="50" x2="138" y2="128" stroke="#1E232E" strokeWidth="6" strokeLinecap="round" />
        <line x1="102" y1="50" x2="138" y2="128" stroke="#4A566E" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
        <rect x="116" y="82" width="6" height="6" rx="1" fill="#FF3B30" />
        <circle cx="138" cy="128" r="3.5" fill="#0C0E14" />
      </svg>
    );
  }

  // 9. STANDS / LAPTOP STANDS
  if (norm.includes("stand") || lowerTitle.includes("holder") || lowerTitle.includes("dock")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="126" rx="60" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <path d="M42 118L72 38H108L138 118" stroke="#3A4456" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42 118L72 38H108L138 118" stroke="#5A6882" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="36" y="112" width="14" height="10" rx="3" fill="#12151D" stroke={accent} strokeWidth="1.5" />
        <rect x="130" y="112" width="14" height="10" rx="3" fill="#12151D" stroke={accent} strokeWidth="1.5" />
        <line x1="58" y1="84" x2="122" y2="84" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="90" cy="54" r="7" fill="#12151D" stroke="#48566E" strokeWidth="1" />
      </svg>
    );
  }

  // 10. KEYBOARDS
  if (norm.includes("keyboard")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="126" rx="65" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="26" y="44" width="128" height="66" rx="8" fill="#171A24" stroke="#3B4456" strokeWidth="1.5" />
        <rect x="34" y="52" width="112" height="50" rx="4" fill="#0C0E14" />
        <rect x="38" y="56" width="14" height="8" rx="2" fill={accent} />
        <rect x="56" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="68" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="80" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="92" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="104" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="116" y="56" width="8" height="8" rx="2" fill="#283040" />
        <rect x="128" y="56" width="14" height="8" rx="2" fill="#FF3B30" />
        <rect x="62" y="88" width="56" height="8" rx="2" fill="#3A465C" />
      </svg>
    );
  }

  // 11. SMARTWATCH / WATCH
  if (norm.includes("watch")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="45" ry="6" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="76" y="12" width="28" height="34" rx="4" fill="#1B202A" stroke="#343E50" strokeWidth="1" />
        <rect x="76" y="94" width="28" height="34" rx="4" fill="#1B202A" stroke="#343E50" strokeWidth="1" />
        <rect x="66" y="38" width="48" height="64" rx="14" fill="#12151D" stroke="#48566E" strokeWidth="2" />
        <circle cx="116" cy="54" r="3" fill="#D4AF37" />
        <rect x="72" y="44" width="36" height="52" rx="10" fill="#05070B" />
        <text x="90" y="66" fontSize="11" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">10:42</text>
        <circle cx="90" cy="80" r="8" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="32 12" />
        <text x="90" y="83" fontSize="5" fill={accent} textAnchor="middle" fontFamily="sans-serif">84 BPM</text>
      </svg>
    );
  }

  // 12. SPEAKERS / AUDIO
  if (norm.includes("speaker")) {
    return (
      <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
        <ellipse cx="90" cy="128" rx="55" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
        <rect x="52" y="38" width="76" height="82" rx="20" fill="#161922" stroke="#3A4456" strokeWidth="2" />
        <circle cx="90" cy="79" r="28" fill="#0B0D13" stroke={accent} strokeWidth="1.5" />
        <circle cx="90" cy="79" r="18" fill="#1D2330" />
        <circle cx="90" cy="79" r="10" fill="#05070A" stroke={accent} strokeWidth="1" />
        <circle cx="76" cy="46" r="3" fill="#4B566D" />
        <circle cx="90" cy="46" r="3" fill="#4B566D" />
        <circle cx="104" cy="46" r="3" fill="#FF3B30" />
      </svg>
    );
  }

  // 13. POWERBANKS / HUBS / GADGETS (Default fallback)
  return (
    <svg viewBox="0 0 180 140" className="full-art-svg" fill="none">
      <ellipse cx="90" cy="126" rx="55" ry="7" fill="#000" fillOpacity="0.55" filter="blur(5px)" />
      <rect x="56" y="34" width="68" height="86" rx="10" fill="#161A24" stroke="#3A4456" strokeWidth="2" />
      <rect x="64" y="44" width="52" height="24" rx="4" fill="#080A10" stroke="#252D3C" strokeWidth="1" />
      <circle cx="74" cy="56" r="4" fill={accent} />
      <text x="100" y="59" fontSize="8" fontWeight="bold" fill="#30D158" textAnchor="middle" fontFamily="monospace">98%</text>
      <rect x="76" y="104" width="12" height="4" rx="1.5" fill="#080A10" stroke="#48566E" strokeWidth="1" />
      <rect x="92" y="104" width="12" height="4" rx="1.5" fill="#080A10" stroke="#48566E" strokeWidth="1" />
    </svg>
  );
}

