import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightMode?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  lightMode = false,
  className = '',
  iconOnly = false,
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', text: 'text-base', sub: 'text-[8px]', ringStroke: '6', cut: '4' },
    sm: { box: 'w-8 h-8', text: 'text-lg', sub: 'text-[9px]', ringStroke: '8', cut: '6' },
    md: { box: 'w-10 h-10', text: 'text-xl', sub: 'text-[10px]', ringStroke: '12', cut: '8' },
    lg: { box: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', ringStroke: '14', cut: '10' },
    xl: { box: 'w-20 h-20', text: 'text-4xl', sub: 'text-sm', ringStroke: '16', cut: '12' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="daro-logo-brand">
      {/* Official DARÔ Emblem: Medical Cross + QR Matrix + Two Interlocking Center Rings */}
      <div
        className={`relative ${currentSize.box} flex-shrink-0 flex items-center justify-center rounded-xl bg-white p-0.5 shadow-sm border border-slate-200/80 hover:scale-105 transition-transform`}
        title="DARÔ Santé QR"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`daroCrossGrad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B3C5D" />
              <stop offset="25%" stopColor="#0284C7" />
              <stop offset="65%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id={`ringInnerGrad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B3C5D" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>

            {/* Greek Medical Cross Clip Path */}
            <clipPath id={`crossClip-${size}`}>
              <path d="M 140 20 L 260 20 L 260 140 L 380 140 L 380 260 L 260 260 L 260 380 L 140 380 L 140 260 L 20 260 L 20 140 L 140 140 Z" />
            </clipPath>
          </defs>

          {/* Group Clipped to the Cross */}
          <g clipPath={`url(#crossClip-${size})`}>
            {/* Base Gradient Fill */}
            <rect x="0" y="0" width="400" height="400" fill={`url(#daroCrossGrad-${size})`} />

            {/* Channels / Cutout Dividing Lines in Crisp White */}
            {/* Top vertical channel */}
            <rect x="194" y="0" width="12" height="145" fill="#FFFFFF" />

            {/* Full horizontal divider channel */}
            <rect x="0" y="194" width="400" height="12" fill="#FFFFFF" />

            {/* Digital circuit traces */}
            <path
              d="M 200 95 L 250 95 L 250 145 L 300 145"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeLinecap="square"
            />
            <path
              d="M 260 178 L 285 178 L 285 145 L 345 145"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />
            <path
              d="M 285 178 L 330 178 L 330 196"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />

            {/* Lower arm circuit stepping traces */}
            <path
              d="M 175 250 L 175 285 L 210 285 L 210 330 L 250 330"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />
            <path
              d="M 210 285 L 210 250"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />
            <path
              d="M 140 290 L 180 290"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />
            <path
              d="M 235 250 L 235 300 L 260 300"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="square"
            />

            {/* Right Arm QR Finder Pattern */}
            <g transform="translate(300, 142)">
              <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" rx="2" />
              <rect x="7" y="7" width="34" height="34" fill={`url(#daroCrossGrad-${size})`} rx="1" />
              <rect x="15" y="15" width="18" height="18" fill="#FFFFFF" rx="1" />
            </g>

            {/* Bottom Arm QR Finder Pattern */}
            <g transform="translate(142, 300)">
              <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" rx="2" />
              <rect x="7" y="7" width="34" height="34" fill={`url(#daroCrossGrad-${size})`} rx="1" />
              <rect x="15" y="15" width="18" height="18" fill="#FFFFFF" rx="1" />
            </g>

            {/* QR Matrix Digital Pixel Blocks in Right Arm */}
            <rect x="272" y="214" width="14" height="14" fill="#FFFFFF" />
            <rect x="292" y="214" width="14" height="14" fill="#FFFFFF" />
            <rect x="322" y="214" width="14" height="14" fill="#FFFFFF" />
            <rect x="352" y="214" width="14" height="14" fill="#FFFFFF" />

            <rect x="272" y="234" width="14" height="14" fill="#FFFFFF" />
            <rect x="302" y="234" width="14" height="14" fill="#FFFFFF" />
            <rect x="332" y="234" width="14" height="14" fill="#FFFFFF" />
            <rect x="352" y="234" width="14" height="14" fill="#FFFFFF" />

            <rect x="292" y="254" width="14" height="14" fill="#FFFFFF" />
            <rect x="312" y="254" width="14" height="14" fill="#FFFFFF" />
            <rect x="342" y="254" width="14" height="14" fill="#FFFFFF" />

            {/* QR Matrix Digital Pixel Blocks in Bottom Arm */}
            <rect x="206" y="254" width="14" height="14" fill="#FFFFFF" />
            <rect x="226" y="254" width="14" height="14" fill="#FFFFFF" />
            <rect x="206" y="274" width="14" height="14" fill="#FFFFFF" />
            <rect x="246" y="274" width="14" height="14" fill="#FFFFFF" />
            <rect x="226" y="294" width="14" height="14" fill="#FFFFFF" />
            <rect x="246" y="294" width="14" height="14" fill="#FFFFFF" />
            <rect x="206" y="324" width="14" height="14" fill="#FFFFFF" />
            <rect x="226" y="324" width="14" height="14" fill="#FFFFFF" />
            <rect x="246" y="344" width="14" height="14" fill="#FFFFFF" />
            <rect x="206" y="354" width="14" height="14" fill="#FFFFFF" />
            <rect x="226" y="354" width="14" height="14" fill="#FFFFFF" />
          </g>

          {/* TWO INTERLOCKING RINGS IN EXACT CENTER */}
          <g id={`interlocking-rings-${size}`}>
            {/* Left Ring (Center: 176, 200) */}
            <circle cx="176" cy="200" r="46" fill="none" stroke="#FFFFFF" strokeWidth="14" />
            <circle
              cx="176"
              cy="200"
              r="46"
              fill="none"
              stroke={`url(#ringInnerGrad-${size})`}
              strokeWidth="2.5"
            />

            {/* Right Ring (Center: 224, 200) */}
            <circle cx="224" cy="200" r="46" fill="none" stroke="#FFFFFF" strokeWidth="14" />
            <circle
              cx="224"
              cy="200"
              r="46"
              fill="none"
              stroke={`url(#ringInnerGrad-${size})`}
              strokeWidth="2.5"
            />

            {/* Optical Interlocking Weave: Left Ring Top-Right Arc over Right Ring */}
            <path
              d="M 192 160 A 46 46 0 0 1 222 200"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 192 160 A 46 46 0 0 1 222 200"
              fill="none"
              stroke={`url(#ringInnerGrad-${size})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Right Ring Bottom-Left Arc over Left Ring */}
            <path
              d="M 208 240 A 46 46 0 0 1 178 200"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 208 240 A 46 46 0 0 1 178 200"
              fill="none"
              stroke={`url(#ringInnerGrad-${size})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {showText && !iconOnly && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${currentSize.text} ${
                lightMode ? 'text-white' : 'text-[#0B3C5D]'
              }`}
            >
              DARÔ
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold tracking-wider border border-teal-500/20">
              SANTÉ QR
            </span>
          </div>
          <span
            className={`font-semibold tracking-wide uppercase ${currentSize.sub} ${
              lightMode ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Système Hospitalier Tchad
          </span>
        </div>
      )}
    </div>
  );
};

