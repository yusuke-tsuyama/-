export default function AppIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="日本語クリアチェッカー アイコン"
    >
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="var(--accent)" />

      {/* Pen nib */}
      <path
        d="M22 6L26 10L14 22L8 24L10 18L22 6Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M10 18L14 22"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Lines representing text */}
      <rect x="6" y="26" width="12" height="1.5" rx="0.75" fill="white" fillOpacity="0.6" />
      <rect x="6" y="28.5" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
