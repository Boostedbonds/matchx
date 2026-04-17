import { useState, useEffect } from "react";
import LoginCard from "../components/LoginCard";
import "./Landing.css";

function Landing() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="landing-container">
      {/* Racket SVG background */}
      <svg
        className={`racket-bg ${loaded ? "loaded" : ""}`}
        viewBox="0 0 500 900"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#d4af37" stopOpacity="0.85"/>
            <stop offset="25%"  stopColor="#ffd700" stopOpacity="0.95"/>
            <stop offset="50%"  stopColor="#ffed4e" stopOpacity="0.9"/>
            <stop offset="75%"  stopColor="#ffd700" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.85"/>
          </linearGradient>
          <linearGradient id="goldHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8a6520"/>
            <stop offset="20%"  stopColor="#c49b3c"/>
            <stop offset="45%"  stopColor="#f0d080"/>
            <stop offset="70%"  stopColor="#c49b3c"/>
            <stop offset="100%" stopColor="#8a6520"/>
          </linearGradient>
          <radialGradient id="corkGrad" cx="40%" cy="35%">
            <stop offset="0%"  stopColor="#f5e6c0"/>
            <stop offset="100%" stopColor="#c4a060"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="250" cy="270" rx="166" ry="224" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="32" filter="url(#glow)"/>
        <ellipse cx="250" cy="270" rx="158" ry="216" fill="none" stroke="url(#goldFrame)" strokeWidth="11" filter="url(#glow)"/>
        <ellipse cx="250" cy="270" rx="149" ry="207" fill="none" stroke="rgba(60,40,10,0.4)" strokeWidth="1.5" opacity="0.8"/>

        {Array.from({ length: 36 }, (_, i) => {
          const y = 74 + i * 11.2;
          const hw = Math.sqrt(Math.max(0, 1 - Math.pow((y - 270) / 207, 2))) * 149;
          return <line key={`h${i}`} x1={250 - hw} y1={y} x2={250 + hw} y2={y} stroke="#d4af37" strokeWidth={i % 3 === 0 ? "0.9" : "0.5"} opacity={i % 3 === 0 ? 0.35 : 0.18}/>;
        })}

        {Array.from({ length: 22 }, (_, i) => {
          const x = 105 + i * 13.5;
          const dy = Math.sqrt(Math.max(0, 1 - Math.pow((x - 250) / 149, 2))) * 207;
          return <line key={`v${i}`} x1={x} y1={270 - dy} x2={x} y2={270 + dy} stroke="#d4af37" strokeWidth={i % 3 === 0 ? "0.9" : "0.5"} opacity={i % 3 === 0 ? 0.35 : 0.18}/>;
        })}

        <path d="M 220 475 Q 215 510 226 535 L 274 535 Q 285 510 280 475 Z" fill="none" stroke="url(#goldFrame)" strokeWidth="5.5" strokeLinejoin="round" filter="url(#glow)"/>
        <path d="M 226 535 L 218 720" stroke="url(#goldHandle)" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#glow)"/>
        <path d="M 274 535 L 282 720" stroke="url(#goldHandle)" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#glow)"/>
        <path d="M 218 720 Q 214 740 216 780 L 284 780 Q 286 740 282 720 Z" fill="url(#goldHandle)" opacity="0.85" filter="url(#glow)"/>
        {[730, 742, 754, 766, 778].map(y => <line key={y} x1="216" y1={y} x2="284" y2={y} stroke="rgba(0,0,0,0.4)" strokeWidth="1.8"/>)}
        <ellipse cx="250" cy="781" rx="36" ry="8" fill="url(#goldHandle)" filter="url(#glow)"/>
        <ellipse cx="250" cy="781" rx="36" ry="8" fill="none" stroke="rgba(255,220,100,0.6)" strokeWidth="1.5"/>

        <g style={{ animation: "shuttleFloat 6s ease-in-out infinite" }} transform="translate(378, 88)">
          <ellipse cx="0" cy="0" rx="14" ry="16" fill="url(#corkGrad)" stroke="rgba(180,140,60,0.9)" strokeWidth="1.8" filter="url(#glow)"/>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = -90 + (i - 3.5) * 12;
            const rad = angle * Math.PI / 180;
            const length = 54 + Math.abs(i - 3.5) * 2;
            const x2 = Math.cos(rad) * length;
            const y2 = Math.sin(rad) * length - 14;
            const ctrlX = Math.cos(rad) * length * 0.55;
            const ctrlY = Math.sin(rad) * length * 0.55 - 14 + Math.sin(rad) * 8;
            return (
              <g key={i}>
                <path d={`M ${Math.cos(rad)*10} ${Math.sin(rad)*10-5} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`} stroke="rgba(255,248,230,0.9)" strokeWidth="0.9" fill="none" strokeLinecap="round" filter="url(#glow)"/>
                <path d={`M ${Math.cos(rad)*10} ${Math.sin(rad)*10-5} Q ${ctrlX-5} ${ctrlY-4} ${x2} ${y2}`} stroke="rgba(255,248,230,0.35)" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </g>
            );
          })}
          <ellipse cx="0" cy="-13" rx="22" ry="4" fill="none" stroke="rgba(255,248,230,0.4)" strokeWidth="0.9"/>
        </g>
      </svg>

      {/* Background */}
      <div className="landing-bg">
        <div className="racket-fade"></div>
        <div className="grid-lines"/>
        <div className="glow-orb orb1"/>
        <div className="glow-orb orb2"/>
      </div>
      <div className="vignette"/>

      {/* Corners */}
      <div className="corner c-tl"/>
      <div className="corner c-tr"/>
      <div className="corner c-bl"/>
      <div className="corner c-br"/>

      {/* Split layout */}
      <div className={`content ${loaded ? "loaded" : ""}`}>

        {/* LEFT — Branding */}
        <div className="brand-panel">
          <div className="badge">🏸 Badminton Live Scoring Platform</div>
          <h1 className="logo">
            Match<span>X</span>
          </h1>
          <p className="logo-sub">Professional Match Management</p>
          <div className="divider"/>
          <div className="features">
            {["Live Score", "Commentary", "Rankings", "Player Stats"].map(f => (
              <div className="feature" key={f}>
                <div className="feature-dot"/>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Login */}
        <div className="login-panel">
          <LoginCard />
        </div>

      </div>

      <div className="version">MatchX v2.0 · Season 2026</div>
    </div>
  );
}

export default Landing;