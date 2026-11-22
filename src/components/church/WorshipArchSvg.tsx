interface WorshipArchSvgProps {
  className?: string;
  blue?: string;
  navy?: string;
}

export const WorshipArchSvg = ({
  className = "w-[340px] sm:w-[400px] lg:w-[440px] max-w-full h-auto drop-shadow-2xl",
  blue = "#1F6FB5",
  navy = "#0F3E6B",
}: WorshipArchSvgProps) => {
  return (
    <svg
      viewBox="0 0 440 520"
      role="img"
      aria-label="Illustration of a congregation worshipping with raised hands beneath a cross"
      className={className}
    >
      <defs>
        <clipPath id="clbc-arch">
          <path d="M0 520V220A220 220 0 0 1 440 220V520Z" />
        </clipPath>
        <g id="clbc-worship-up">
          <circle cx="0" cy="-60" r="14" fill="currentColor" />
          <path d="M-27 72Q-27 2 0 2Q27 2 27 72Z" fill="currentColor" />
          <path
            d="M-18 10L-36 -46M18 10L36 -46"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g id="clbc-worship-one">
          <circle cx="0" cy="-60" r="14" fill="currentColor" />
          <path d="M-27 72Q-27 2 0 2Q27 2 27 72Z" fill="currentColor" />
          <path
            d="M18 10L36 -46M-18 12L-40 -6"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </defs>
      <g clipPath="url(#clbc-arch)">
        {/* Arch background */}
        <path d="M0 520V220A220 220 0 0 1 440 220V520Z" fill={blue} />
        
        {/* Radiant halos */}
        <circle cx="220" cy="190" r="150" fill="#fff" opacity="0.10" />
        <circle cx="220" cy="190" r="96" fill="#fff" opacity="0.16" />
        
        {/* Cross */}
        <rect x="213" y="136" width="14" height="104" rx="3" fill="#fff" />
        <rect x="188" y="164" width="64" height="14" rx="3" fill="#fff" />
        
        {/* Background congregation row */}
        <g style={{ color: "#1a5c9a" }}>
          <use href="#clbc-worship-up" transform="translate(65 335) scale(.7)" />
          <use href="#clbc-worship-one" transform="translate(135 335) scale(.7)" />
          <use href="#clbc-worship-up" transform="translate(205 335) scale(.7)" />
          <use href="#clbc-worship-up" transform="translate(275 335) scale(.7)" />
          <use href="#clbc-worship-one" transform="translate(345 335) scale(.7)" />
          <use href="#clbc-worship-up" transform="translate(415 335) scale(.7)" />
        </g>
        
        {/* Middle congregation row */}
        <g style={{ color: navy }}>
          <use href="#clbc-worship-one" transform="translate(35 415) scale(.9)" />
          <use href="#clbc-worship-up" transform="translate(110 415) scale(.9)" />
          <use href="#clbc-worship-up" transform="translate(185 415) scale(.9)" />
          <use href="#clbc-worship-one" transform="translate(255 415) scale(.9)" />
          <use href="#clbc-worship-up" transform="translate(330 415) scale(.9)" />
          <use href="#clbc-worship-up" transform="translate(405 415) scale(.9)" />
        </g>
        
        {/* Foreground congregation row */}
        <g style={{ color: "#082a4b" }}>
          <use href="#clbc-worship-up" transform="translate(80 490) scale(1.15)" />
          <use href="#clbc-worship-one" transform="translate(190 490) scale(1.15)" />
          <use href="#clbc-worship-up" transform="translate(300 490) scale(1.15)" />
          <use href="#clbc-worship-up" transform="translate(410 490) scale(1.15)" />
        </g>
      </g>
    </svg>
  );
};
