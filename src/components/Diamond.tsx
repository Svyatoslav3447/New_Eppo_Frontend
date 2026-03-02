export function Diamond() {
  return (
    <svg
      viewBox="0 0 70 70"
      width="220"
      height="220"
      className="diamond-404"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="diamondGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="40%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* основний діамант */}
      <path
        d="M67.142,23.641L55.405,10.456c-0.379-0.423-0.92-0.873-1.488-0.873h-37.98
           c-0.568,0-1.109,0.45-1.489,0.874L2.711,23.752c-0.691,0.771-0.68,1.94,0.025,2.697
           L33.462,59.46c0.378,0.407,0.909,0.638,1.464,0.638s1.086-0.257,1.464-0.664
           l30.728-33.042C67.822,25.634,67.833,24.411,67.142,23.641z
           M46.555,25.583L34.902,53.414L22.608,25.583H46.555z
           M21.725,23.583l-4.417-10h34.272l-4.188,10H21.725z
           M32.231,52.152L7.586,25.583h12.879L32.231,52.152z
           M48.702,25.583H62c0.094,0,0.179-0.029,0.265-0.054L37.462,52.318L48.702,25.583z
           M61.871,23.583H49.543l3.971-9.447L61.871,23.583z
           M15.714,14.851l3.867,8.732H8.027L15.714,14.851z"
        fill="url(#diamondGradient)"
      />

      {/* рухомий блиск */}
      <rect
        x="-20"
        y="0"
        width="30"
        height="70"
        fill="url(#shine)"
        className="diamond-shine"
      />
    </svg>
  );
}