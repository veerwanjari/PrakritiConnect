export default function VineDivider({ className = '', flip = false }) {
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`h-8 w-full ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 24 C 180 4, 360 44, 540 24 S 900 4, 1080 24 S 1350 44, 1440 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[120, 380, 640, 900, 1160, 1380].map((x, i) => (
        <path
          key={x}
          d={`M${x} 24 q ${i % 2 === 0 ? 10 : -10} -14 ${i % 2 === 0 ? 22 : -22} -10`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
