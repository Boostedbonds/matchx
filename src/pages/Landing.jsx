import { useState, useEffect } from "react";

function Landing({ onStart }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleEnter = () => {
    if (code === "1234") {
      onStart();
    } else {
      setError("Invalid access code");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04060a", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Background racket SVG ── */
        .racket-bg {
          position: fixed;
          top: 50%; left: 54%;
          transform: translate(-50%, -50%) rotate(-22deg);
          width: min(90vw, 820px);
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 1.8s ease 0.3s;
        }
        .racket-bg.loaded { opacity: 1; }

        /* ── Grid overlay ── */
        .grid-overlay {
          position: fixed; inset: 0; z-index: 2;
          background-image:
            linear-gradient(rgba(0,255,200,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.025) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }

        /* ── Vignette ── */
        .vignette {
          position: fixed; inset: 0; z-index: 3;
          background: radial-gradient(ellipse 70% 70% at 30% 50%, transparent 40%, rgba(4,6,10,0.92) 100%);
          pointer-events: none;
        }

        /* ── Corner decorations ── */
        .corner { position: fixed; width: 56px; height: 56px; border-color: rgba(196,155,60,0.35); border-style: solid; z-index: 10; transition: border-color 0.4s; }
        .corner:hover { border-color: rgba(196,155,60,0.7); }
        .c-tl { top: 22px; left: 22px; border-width: 2px 0 0 2px; }
        .c-tr { top: 22px; right: 22px; border-width: 2px 2px 0 0; }
        .c-bl { bottom: 22px; left: 22px; border-width: 0 0 2px 2px; }
        .c-br { bottom: 22px; right: 22px; border-width: 0 2px 2px 0; }

        /* ── Content ── */
        .content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: center;
          min-height: 100vh;
          padding: 60px 72px;
          max-width: 560px;
          opacity: 0; transform: translateX(-20px);
          transition: opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s;
        }
        .content.loaded { opacity: 1; transform: translateX(0); }

        /* ── Badge ── */
        .badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(196,155,60,0.8);
          border: 1px solid rgba(196,155,60,0.3);
          padding: 6px 14px; margin-bottom: 28px;
          display: inline-flex; align-items: center; gap: 8px;
          animation: fadeUp 0.7s ease 0.7s both;
        }
        .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #c49b3c; box-shadow: 0 0 8px #c49b3c; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* ── Logo ── */
        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 13vw, 140px);
          color: #fff;
          letter-spacing: 6px;
          line-height: 0.88;
          margin-bottom: 14px;
          animation: fadeUp 0.7s ease 0.85s both;
        }
        .logo span {
          color: #c49b3c;
          text-shadow: 0 0 40px rgba(196,155,60,0.6), 0 0 80px rgba(196,155,60,0.25);
        }

        .logo-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 7px; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 40px;
          animation: fadeUp 0.7s ease 1s both;
        }

        /* ── Divider ── */
        .divider {
          width: 100px; height: 1px;
          background: linear-gradient(90deg, #c49b3c, transparent);
          margin-bottom: 40px;
          animation: fadeUp 0.7s ease 1.1s both;
        }

        /* ── Stats ── */
        .stats-row {
          display: flex; gap: 36px; margin-bottom: 44px;
          animation: fadeUp 0.7s ease 1.2s both;
        }
        .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 34px; color: #c49b3c; line-height: 1; text-shadow: 0 0 20px rgba(196,155,60,0.4); }
        .stat-sep { width: 1px; background: rgba(255,255,255,0.07); }
        .stat-label { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 4px; }

        /* ── Input ── */
        .login-box {
          width: 100%; max-width: 340px;
          animation: fadeUp 0.7s ease 1.35s both;
        }

        .input-field {
          width: 100%; padding: 15px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(196,155,60,0.2);
          border-bottom: 1px solid rgba(196,155,60,0.4);
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 500;
          letter-spacing: 4px;
          outline: none; transition: all 0.3s;
          margin-bottom: 10px;
        }
        .input-field:focus {
          border-color: rgba(196,155,60,0.6);
          background: rgba(196,155,60,0.04);
          box-shadow: 0 0 24px rgba(196,155,60,0.08);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.18); letter-spacing: 3px; }

        .enter-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #c49b3c, #a07a28);
          border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 5px;
          color: #04060a;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .enter-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s;
        }
        .enter-btn:hover::before { left: 100%; }
        .enter-btn:hover { background: linear-gradient(135deg, #ddb84d, #c49b3c); box-shadow: 0 0 40px rgba(196,155,60,0.4); }
        .enter-btn:active { transform: scale(0.98); }

        .error-msg {
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          color: #ff4466; letter-spacing: 2px; margin-top: 10px;
          text-transform: uppercase; height: 18px;
        }

        /* ── Features ── */
        .features {
          display: flex; flex-wrap: wrap; gap: 20px;
          margin-top: 44px;
          animation: fadeUp 0.7s ease 1.5s both;
        }
        .feature {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 2px; color: rgba(255,255,255,0.25);
          text-transform: uppercase;
        }
        .feature-dot { width: 5px; height: 5px; border-radius: 50%; background: #c49b3c; opacity: 0.7; }

        /* ── Version ── */
        .version {
          position: fixed; bottom: 20px; right: 28px;
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; color: rgba(255,255,255,0.12);
          text-transform: uppercase; z-index: 10;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Shuttle float animation ── */
        @keyframes shuttleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(4deg); }
        }
        .shuttle-float { animation: shuttleFloat 4s ease-in-out infinite; }
      `}</style>

      {/* ── Full-page racket SVG background ── */}
      <svg
        className={`racket-bg ${loaded ? "loaded" : ""}`}
        viewBox="0 0 500 900"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gold frame gradient */}
          <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f0d080" stopOpacity="0.9"/>
            <stop offset="25%"  stopColor="#c49b3c" stopOpacity="1"/>
            <stop offset="50%"  stopColor="#ffe9a0" stopOpacity="0.95"/>
            <stop offset="75%"  stopColor="#a07828" stopOpacity="1"/>
            <stop offset="100%" stopColor="#e8c96a" stopOpacity="0.9"/>
          </linearGradient>
          {/* Gold handle gradient */}
          <linearGradient id="goldHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8a6520"/>
            <stop offset="20%"  stopColor="#c49b3c"/>
            <stop offset="45%"  stopColor="#f0d080"/>
            <stop offset="70%"  stopColor="#c49b3c"/>
            <stop offset="100%" stopColor="#8a6520"/>
          </linearGradient>
          {/* Glow filter */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          {/* String grid clip */}
          <clipPath id="headClip">
            <ellipse cx="250" cy="270" rx="155" ry="210"/>
          </clipPath>
          {/* Shuttle cork gradient */}
          <radialGradient id="corkGrad" cx="40%" cy="35%">
            <stop offset="0%"  stopColor="#f5e6c0"/>
            <stop offset="100%" stopColor="#c4a060"/>
          </radialGradient>
        </defs>

        {/* ═══ RACKET HEAD — outer glow ring ═══ */}
        <ellipse cx="250" cy="270" rx="166" ry="224"
          fill="none" stroke="rgba(196,155,60,0.12)" strokeWidth="28"/>

        {/* ═══ RACKET HEAD — main gold frame ═══ */}
        <ellipse cx="250" cy="270" rx="158" ry="216"
          fill="none"
          stroke="url(#goldFrame)"
          strokeWidth="9"
          filter="url(#goldGlow)"/>

        {/* Inner frame edge (thin dark line for depth) */}
        <ellipse cx="250" cy="270" rx="149" ry="207"
          fill="none" stroke="rgba(60,40,10,0.6)" strokeWidth="2"/>

        {/* ═══ STRINGS — horizontal ═══ */}
        {Array.from({ length: 36 }, (_, i) => {
          const y = 74 + i * 11.2;
          const halfW = Math.sqrt(Math.max(0, 1 - Math.pow((y - 270) / 207, 2))) * 149;
          const x1 = 250 - halfW;
          const x2 = 250 + halfW;
          const opacity = i % 3 === 0 ? 0.28 : 0.16;
          return (
            <line key={`h${i}`}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke="#c49b3c" strokeWidth={i % 3 === 0 ? "0.8" : "0.5"}
              opacity={opacity}/>
          );
        })}

        {/* ═══ STRINGS — vertical ═══ */}
        {Array.from({ length: 22 }, (_, i) => {
          const x = 105 + i * 13.5;
          const dy = Math.sqrt(Math.max(0, 1 - Math.pow((x - 250) / 149, 2))) * 207;
          const y1 = 270 - dy;
          const y2 = 270 + dy;
          const opacity = i % 3 === 0 ? 0.28 : 0.16;
          return (
            <line key={`v${i}`}
              x1={x} y1={y1} x2={x} y2={y2}
              stroke="#c49b3c" strokeWidth={i % 3 === 0 ? "0.8" : "0.5"}
              opacity={opacity}/>
          );
        })}

        {/* String cross-highlight dots at intersections (sparse) */}
        {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(row =>
          [4, 7, 10, 13, 16, 18].map(col => {
            const y = 74 + row * 11.2;
            const x = 105 + col * 13.5;
            const dx = (x - 250) / 149;
            const dy2 = (y - 270) / 207;
            if (dx * dx + dy2 * dy2 > 0.75) return null;
            return (
              <circle key={`d${row}-${col}`}
                cx={x} cy={y} r="0.8"
                fill="#e8c878" opacity="0.3"/>
            );
          })
        )}

        {/* ═══ SHAFT — throat piece ═══ */}
        {/* Throat T-shape */}
        <path d="M 220 475 Q 215 510 226 535 L 274 535 Q 285 510 280 475 Z"
          fill="none" stroke="url(#goldFrame)" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M 224 490 Q 215 510 228 530 L 272 530 Q 285 510 276 490"
          fill="none" stroke="rgba(196,155,60,0.25)" strokeWidth="2"/>

        {/* ═══ SHAFT — main rod ═══ */}
        {/* Left rail */}
        <path d="M 226 535 L 218 720"
          stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" fill="none"/>
        {/* Right rail */}
        <path d="M 274 535 L 282 720"
          stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" fill="none"/>
        {/* Center highlight */}
        <path d="M 250 535 L 250 718"
          stroke="rgba(255,240,180,0.15)" strokeWidth="3" strokeLinecap="round" fill="none"/>

        {/* ═══ HANDLE ═══ */}
        {/* Handle body */}
        <path d="M 218 720 Q 214 740 216 780 L 284 780 Q 286 740 282 720 Z"
          fill="url(#goldHandle)" opacity="0.9"/>
        {/* Grip wrap texture lines */}
        {[730, 742, 754, 766, 778].map(y => (
          <line key={y} x1="216" y1={y} x2="284" y2={y}
            stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"/>
        ))}
        {/* Handle highlight */}
        <path d="M 225 722 Q 223 750 224 778"
          stroke="rgba(255,240,160,0.3)" strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* Handle end cap */}
        <ellipse cx="250" cy="781" rx="36" ry="8"
          fill="url(#goldHandle)"/>
        <ellipse cx="250" cy="781" rx="36" ry="8"
          fill="none" stroke="rgba(255,220,100,0.5)" strokeWidth="1.5"/>

        {/* ═══ SHUTTLE — top right of racket ═══ */}
        <g className="shuttle-float" transform="translate(378, 88)">
          {/* Cork base */}
          <ellipse cx="0" cy="0" rx="13" ry="15"
            fill="url(#corkGrad)" stroke="rgba(180,140,60,0.8)" strokeWidth="1.5"/>
          {/* Cork top ring */}
          <ellipse cx="0" cy="-13" rx="13" ry="3"
            fill="none" stroke="rgba(200,160,80,0.6)" strokeWidth="1"/>

          {/* Feathers — 8 feathers fanning out */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = -90 + (i - 3.5) * 12;
            const rad = angle * Math.PI / 180;
            const length = 52 + Math.abs(i - 3.5) * 2;
            const x2 = Math.cos(rad) * length;
            const y2 = Math.sin(rad) * length - 14;
            const ctrlX = Math.cos(rad) * length * 0.55;
            const ctrlY = Math.sin(rad) * length * 0.55 - 14 + Math.sin(rad) * 8;
            return (
              <g key={i}>
                {/* Feather quill */}
                <path
                  d={`M ${Math.cos(rad) * 10} ${Math.sin(rad) * 10 - 5} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`}
                  stroke="rgba(255,248,230,0.85)"
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"/>
                {/* Feather vane — left */}
                <path
                  d={`M ${Math.cos(rad) * 10} ${Math.sin(rad) * 10 - 5} Q ${ctrlX - 5} ${ctrlY - 4} ${x2} ${y2}`}
                  stroke="rgba(255,248,230,0.3)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"/>
                {/* Feather tip dot */}
                <circle cx={x2} cy={y2} r="1.2"
                  fill="rgba(255,248,230,0.7)"/>
              </g>
            );
          })}

          {/* Feather ring connector */}
          <ellipse cx="0" cy="-13" rx="22" ry="4"
            fill="none" stroke="rgba(255,248,230,0.35)" strokeWidth="0.8"/>

          {/* Gold glow ring around shuttle */}
          <ellipse cx="0" cy="0" rx="16" ry="18"
            fill="none" stroke="rgba(196,155,60,0.4)" strokeWidth="6" opacity="0.5"/>
        </g>

        {/* ═══ Subtle glow aura behind head ═══ */}
        <ellipse cx="250" cy="270" rx="130" ry="180"
          fill="rgba(196,155,60,0.03)" stroke="none"/>
      </svg>

      {/* Background layers */}
      <div className="grid-overlay"/>
      <div className="vignette"/>

      {/* Corner decorations */}
      <div className="corner c-tl"/>
      <div className="corner c-tr"/>
      <div className="corner c-bl"/>
      <div className="corner c-br"/>

      {/* ── Main Content ── */}
      <div className={`content ${loaded ? "loaded" : ""}`}>

        <div className="badge">
          <div className="badge-dot"/>
          Badminton Live Scoring Platform
        </div>

        <h1 className="logo">Match<span>X</span></h1>
        <p className="logo-sub">Professional Match Management</p>

        <div className="divider"/>

        <div className="stats-row">
          <div className="stat">
            <div className="stat-num">21</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-sep"/>
          <div className="stat">
            <div className="stat-num">3</div>
            <div className="stat-label">Games</div>
          </div>
          <div className="stat-sep"/>
          <div className="stat">
            <div className="stat-num">Live</div>
            <div className="stat-label">Stream</div>
          </div>
        </div>

        <div className="login-box">
          <input
            className="input-field"
            placeholder="ENTER ACCESS CODE"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleEnter()}
            type="password"
          />
          <button className="enter-btn" onClick={handleEnter}>
            Enter Arena
          </button>
          <div className="error-msg">{error}</div>
        </div>

        <div className="features">
          {["Live Score", "Commentary", "Rankings", "Streaming"].map(f => (
            <div className="feature" key={f}>
              <div className="feature-dot"/>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="version">MatchX v2.0 · Season 2026</div>
    </div>
  );
}

export default Landing;