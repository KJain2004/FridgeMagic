import React, { useState, useEffect, useRef } from 'react';

export default function ChefCharacter({ speaking = false, emotion = 'happy', size = 180 }) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [reacting, setReacting] = useState(false);
  const reactionTimeout = useRef(null);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => () => clearTimeout(reactionTimeout.current), []);

  useEffect(() => {
    if (!speaking) return;
    const talkInterval = setInterval(() => setMouthOpen(open => !open), 280);
    return () => clearInterval(talkInterval);
  }, [speaking]);

  const handlePointerMove = event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setLook({
      x: Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4)),
      y: Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - 0.35) * 3)),
    });
  };

  const handleInteract = () => {
    setReacting(true);
    setMouthOpen(true);
    clearTimeout(reactionTimeout.current);
    reactionTimeout.current = setTimeout(() => {
      setReacting(false);
      setMouthOpen(false);
    }, 900);
  };

  const eyeY = blink ? 118 : 112;
  const eyeHeight = blink ? 2 : 10;
  const mouthPath = (speaking || reacting) && mouthOpen
    ? 'M 130 145 Q 150 158 170 145'
    : 'M 130 145 Q 150 152 170 145';
  const eyebrowOffset = emotion === 'thinking' ? -4 : 0;

  return (
    <button
      type="button"
      aria-label="Interact with Chef Zara"
      title="Move your pointer or click Chef Zara"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setLook({ x: 0, y: 0 })}
      onClick={handleInteract}
      style={{
        animation: reacting ? 'chef-bounce 0.45s ease-in-out 2' : 'float 4s ease-in-out infinite',
        filter: 'drop-shadow(0 0 24px rgba(111, 143, 99, 0.32))',
        display: 'inline-block',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        lineHeight: 0,
      }}
    >
      <svg width={size} height={size * 1.35} viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chefCoat" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#829d75" />
            <stop offset="1" stopColor="#506f5a" />
          </linearGradient>
          <radialGradient id="chefFace" cx=".35" cy=".25">
            <stop stopColor="#f8d9b1" />
            <stop offset="1" stopColor="#dfae7f" />
          </radialGradient>
          <linearGradient id="chefHat" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#fffdf5" />
            <stop offset="1" stopColor="#eadfc8" />
          </linearGradient>
        </defs>

        <ellipse cx="150" cy="380" rx="70" ry="14" fill="#71866a" opacity=".16" />

        <path d="M223 244q27-5 41-24" fill="none" stroke="#829d75" strokeWidth="18" strokeLinecap="round" />
        <g style={{
          transformBox: 'view-box',
          transformOrigin: '62px 244px',
          transform: reacting ? 'rotate(-18deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
        }}>
          <path d="M78 242q-35-9-49-36" fill="none" stroke="#829d75" strokeWidth="18" strokeLinecap="round" />
          <circle cx="38" cy="209" r="15" fill="url(#chefFace)" />
          <path d="M21 199l-7-32" stroke="#a7784e" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="12" cy="163" rx="9" ry="6" fill="#c79b61" />
          <path d="M10 161q-8-10 0-17 8 7 0 17" fill="#7e9c72" />
        </g>

        <rect x="82" y="218" width="136" height="142" rx="38" fill="url(#chefCoat)" />
        <path d="M101 250q49-28 98 0v110h-98z" fill="#f3ead7" />
        <path d="M110 252q40-19 80 0v108h-80z" fill="#718b68" />
        <path d="M150 255v101" stroke="#f4ecd9" strokeWidth="5" strokeLinecap="round" />
        <circle cx="150" cy="276" r="5" fill="#d5b66d" />
        <circle cx="150" cy="300" r="5" fill="#d5b66d" />
        <circle cx="150" cy="324" r="5" fill="#d5b66d" />
        <path d="M127 226q-25 16-28 39 21 2 38-20z" fill="#91aa7f" />
        <path d="M128 231q-11 13-22 26m67-31q25 16 28 39-21 2-38-20z" fill="#91aa7f" />
        <path d="M172 234q11 13 22 26m-44-35v39" stroke="#dce4c8" strokeWidth="2" />

        <circle cx="263" cy="220" r="14" fill="url(#chefFace)" />
        <rect x="266" y="184" width="29" height="39" rx="5" fill="#fbf5e8" stroke="#a8ad84" strokeWidth="2" />
        <path d="M272 194h17m-17 7h17m-17 7h12" stroke="#849776" strokeWidth="2" strokeLinecap="round" />
        <path d="M130 198v28m40-28v28" fill="none" stroke="#dfae7f" strokeWidth="16" strokeLinecap="round" />

        <ellipse cx="150" cy="145" rx="68" ry="72" fill="url(#chefFace)" />
        <ellipse cx="108" cy="151" rx="15" ry="9" fill="#d99083" opacity=".38" />
        <ellipse cx="192" cy="151" rx="15" ry="9" fill="#d99083" opacity=".38" />

        <path d="M89 95q-9-18 7-26 7-22 26-15 17-17 32-2 17-14 31 5 19 1 17 22l13 12-10 8H94l-13-7z" fill="url(#chefHat)" />
        <path d="M104 84q14-14 28 0-14 13-28 0m47-7q13-15 27-3-13 15-27 3m-17-16q-4-18 12-26 9 16-12 26" fill="#8fa87d" />
        <path d="M116 81q8-11 12-17m43 10 9-9m-45-8 9-17" stroke="#617c5b" strokeWidth="2" fill="none" />
        <path d="M94 96q56 10 112 0v12H94z" fill="#8da17c" />
        <path d="M149 97q-5-8 0-14 7 7 0 14m0 0q-7 6-13 0 6-7 13 0m0 0q7 6 13 0-6-7-13 0" fill="#f0d47e" />

        <ellipse cx="125" cy={eyeY} rx="12" ry={eyeHeight} fill="#fffaf0" />
        <ellipse cx="175" cy={eyeY} rx="12" ry={eyeHeight} fill="#fffaf0" />
        {!blink && <>
          <circle cx={127 + look.x} cy={114 + look.y} r="6" fill="#425b45" />
          <circle cx={177 + look.x} cy={114 + look.y} r="6" fill="#425b45" />
          <circle cx={129 + look.x} cy={112 + look.y} r="2" fill="#fff" />
          <circle cx={179 + look.x} cy={112 + look.y} r="2" fill="#fff" />
        </>}

        <path
          d={`M 112 ${97 + eyebrowOffset} Q 125 ${90 + eyebrowOffset} 138 ${97 + eyebrowOffset}`}
          stroke="#80634b" strokeWidth="3" strokeLinecap="round" fill="none"
        />
        <path
          d={`M 162 ${97 + eyebrowOffset} Q 175 ${90 + eyebrowOffset} 188 ${97 + eyebrowOffset}`}
          stroke="#80634b" strokeWidth="3" strokeLinecap="round" fill="none"
        />
        <ellipse cx="150" cy="132" rx="6" ry="4" fill="#d39a70" />
        <path d={mouthPath} stroke="#8d594d" strokeWidth="3" strokeLinecap="round" fill="none" />
        {(speaking || reacting) && mouthOpen && (
          <ellipse cx="150" cy="150" rx="14" ry="8" fill="#a85f50" opacity=".7" />
        )}

        <g>
          <path d="M58 127q-14-12-27 0 12 13 27 0m-1 0q-7-12-4-22" fill="#91aa7f" />
          <path d="M30 127l25 1m188 35q15-13 28-1-12 14-28 1m0 0q8-12 5-23" fill="#91aa7f" />
          <path d="M28 127l23 1m194 33 23 0" stroke="#627e5c" strokeWidth="2" />
          <path d="M237 112l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#d9b866" />
          <circle cx="52" cy="101" r="3" fill="#d9b866" />
        </g>

        <rect x="105" y="350" width="38" height="40" rx="12" fill="#657f61" />
        <rect x="157" y="350" width="38" height="40" rx="12" fill="#657f61" />
        <ellipse cx="124" cy="390" rx="22" ry="10" fill="#51483e" />
        <ellipse cx="176" cy="390" rx="22" ry="10" fill="#51483e" />
      </svg>
    </button>
  );
}
