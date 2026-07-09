export const authArt = `
<svg viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustração de confeitaria com bolo, cupcake e macarons">
  <defs>
    <linearGradient id="authBg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#7a352e" />
      <stop offset="55%" stop-color="#8f3f37" />
      <stop offset="100%" stop-color="#c8795b" />
    </linearGradient>
  </defs>
  <rect width="400" height="640" fill="url(#authBg)" />
  <circle cx="30" cy="70" r="140" fill="#a8564c" opacity="0.35" />
  <circle cx="390" cy="580" r="190" fill="#7a352e" opacity="0.45" />
  <circle cx="360" cy="130" r="70" fill="#f2a765" opacity="0.18" />

  <g opacity="0.7">
    <rect x="60" y="55" width="10" height="3" rx="1.5" fill="#f8e8df" transform="rotate(20 65 56)" />
    <rect x="300" y="90" width="10" height="3" rx="1.5" fill="#f2a765" transform="rotate(-30 305 91)" />
    <rect x="330" y="200" width="10" height="3" rx="1.5" fill="#e8586f" transform="rotate(50 335 201)" />
    <rect x="36" y="230" width="10" height="3" rx="1.5" fill="#f8e8df" transform="rotate(-15 41 231)" />
    <rect x="88" y="150" width="8" height="3" rx="1.5" fill="#e8586f" transform="rotate(80 92 151)" />
    <circle cx="250" cy="55" r="4" fill="#f8e8df" />
    <circle cx="130" cy="95" r="3" fill="#f2a765" />
    <circle cx="60" cy="180" r="3" fill="#f8e8df" />
  </g>

  <!-- macarons empilhados (esquerda) -->
  <g transform="translate(28,320)">
    <ellipse cx="45" cy="150" rx="55" ry="12" fill="#5a241d" opacity="0.3" />
    <g>
      <ellipse cx="45" cy="120" rx="46" ry="16" fill="#f2a765" />
      <rect x="4" y="112" width="82" height="10" fill="#f8e8df" />
      <ellipse cx="45" cy="108" rx="46" ry="16" fill="#f4c199" />
    </g>
    <g transform="translate(6,-34)">
      <ellipse cx="42" cy="120" rx="42" ry="15" fill="#e8586f" />
      <rect x="4" y="112" width="76" height="9" fill="#fbdadf" />
      <ellipse cx="42" cy="106" rx="42" ry="15" fill="#f2879a" />
    </g>
    <g transform="translate(14,-66)">
      <ellipse cx="36" cy="120" rx="36" ry="13" fill="#c8795b" />
      <rect x="4" y="112" width="64" height="8" fill="#f8e8df" />
      <ellipse cx="36" cy="105" rx="36" ry="13" fill="#dd9a72" />
    </g>
  </g>

  <!-- cupcake (direita) -->
  <g transform="translate(255,370)">
    <ellipse cx="55" cy="150" rx="62" ry="12" fill="#5a241d" opacity="0.3" />
    <path d="M15 90 L25 145 Q55 158 85 145 L95 90 Z" fill="#c8795b" />
    <path d="M18 90h74" stroke="#a8564c" stroke-width="3" />
    <path d="M22 106h66M26 122h58" stroke="#a8564c" stroke-width="2" opacity="0.6" />
    <path d="M10 90 Q55 20 100 90 Q90 70 55 66 Q20 70 10 90Z" fill="#f8e8df" />
    <path d="M18 78 Q55 34 92 78 Q80 62 55 60 Q30 62 18 78Z" fill="#fff" />
    <circle cx="55" cy="40" r="7" fill="#e8586f" />
  </g>

  <!-- bolo com stand (centro, base) -->
  <g transform="translate(110,440)">
    <ellipse cx="80" cy="185" rx="95" ry="14" fill="#5a241d" opacity="0.35" />
    <rect x="30" y="150" width="100" height="14" rx="4" fill="#f8e8df" />
    <path d="M40 160 L120 160 L110 100 Q80 86 50 100 Z" fill="#f4c199" />
    <path d="M46 130h68M50 112h60" stroke="#e2a877" stroke-width="3" opacity="0.7" />
    <path d="M42 100 Q80 70 118 100 Q100 84 80 82 Q60 84 42 100Z" fill="#fff" />
    <path d="M50 100 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0" stroke="#f2a765" stroke-width="3" fill="none" />
    <circle cx="80" cy="66" r="8" fill="#e8586f" />
  </g>
</svg>`;
