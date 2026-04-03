import { useState, useEffect } from "react";
import { loginOrRegister } from "../services/supabase";

function Landing({ onStart }) {
  const [name,    setName]    = useState("");
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  async function handleEnter() {
    const trimName = name.trim();
    const trimCode = code.trim();

    if (!trimName) { setError("Please enter your name."); return; }
    if (!trimCode) { setError("Please enter your access code."); return; }

    setError("");
    setLoading(true);

    try {
      const { player, isNew } = await loginOrRegister(trimName, trimCode);
      // Pass the real player object up to App
      onStart(player, isNew);
    } catch (err) {
      setError(err.message || "Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleEnter();
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-bg { position: fixed; inset: 0; z-index: 0; background: #000; overflow: hidden; }

        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,255,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove { 0%{transform:translateY(0)} 100%{transform:translateY(60px)} }

        .glow-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: pulse 4s ease-in-out infinite; }
        .orb1 { width: 500px; height: 500px; background: rgba(0,255,200,0.08); top: -100px; left: -100px; }
        .orb2 { width: 400px; height: 400px; background: rgba(0,180,255,0.06); bottom: -50px; right: -50px; animation-delay: 2s; }

        @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }

        .shuttle { position: absolute; font-size: 40px; animation: shuttleFly 6s ease-in-out infinite; top: 30%; }

        @keyframes shuttleFly {
          0%  { left:-5%; transform:translateY(0px) rotate(-20deg); opacity:0; }
          10% { opacity:1; }
          50% { transform:translateY(-80px) rotate(10deg); }
          90% { opacity:1; }
          100%{ left:105%; transform:translateY(0px) rotate(-20deg); opacity:0; }
        }

        .content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; padding: 40px 20px;
          opacity: 0; transform: translateY(30px); transition: all 0.8s ease;
        }
        .content.loaded { opacity: 1; transform: translateY(0); }

        .badge {
          font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(0,255,200,0.7); border: 1px solid rgba(0,255,200,0.3);
          padding: 6px 16px; border-radius: 2px; margin-bottom: 24px;
          animation: fadeSlideDown 0.8s ease 0.2s both;
        }

        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-15px)} to{opacity:1;transform:translateY(0)} }

        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 15vw, 160px);
          color: #fff; letter-spacing: 8px; line-height: 0.9;
          text-align: center; position: relative;
          animation: fadeSlideDown 0.8s ease 0.4s both;
        }
        .logo span { color: #00ffc8; text-shadow: 0 0 40px rgba(0,255,200,0.8), 0 0 80px rgba(0,255,200,0.4); }

        .logo-sub {
          font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 8px; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-top: 8px;
          animation: fadeSlideDown 0.8s ease 0.5s both;
        }

        .divider {
          width: 120px; height: 1px;
          background: linear-gradient(90deg, transparent, #00ffc8, transparent);
          margin: 32px 0; animation: fadeSlideDown 0.8s ease 0.6s both;
        }

        /* ── Login box ── */
        .login-box {
          width: 100%; max-width: 380px;
          animation: fadeSlideDown 0.8s ease 0.8s both;
          display: flex; flex-direction: column; gap: 10px;
        }

        .input-group { display: flex; flex-direction: column; gap: 4px; }

        .input-label {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        .input-field {
          width: 100%; padding: 14px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,200,0.2);
          border-bottom: 1px solid rgba(0,255,200,0.35);
          color: #fff; font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 600; letter-spacing: 2px;
          outline: none; transition: all 0.3s;
        }
        .input-field:focus {
          border-color: rgba(0,255,200,0.5);
          background: rgba(0,255,200,0.03);
          box-shadow: 0 0 20px rgba(0,255,200,0.06);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.18); letter-spacing: 2px; }

        .enter-btn {
          width: 100%; padding: 16px; margin-top: 4px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif; font-size: 22px;
          letter-spacing: 4px; color: #000;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .enter-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.4s;
        }
        .enter-btn:hover::before { left: 100%; }
        .enter-btn:hover:not(:disabled) { background: #fff; box-shadow: 0 0 40px rgba(0,255,200,0.6); }
        .enter-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .enter-btn:active { transform: scale(0.98); }

        .error-msg {
          font-family: 'Rajdhani', sans-serif; color: #ff4466;
          font-size: 12px; letter-spacing: 2px; text-align: center;
          min-height: 20px; text-transform: uppercase;
        }

        /* New player hint */
        .new-hint {
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 2px; color: rgba(255,255,255,0.2);
          text-align: center; text-transform: uppercase;
          margin-top: 4px;
        }
        .new-hint span { color: rgba(0,255,200,0.5); }

        .features {
          display: flex; flex-wrap: wrap; gap: 20px; margin-top: 40px;
          justify-content: center;
          animation: fadeSlideDown 0.8s ease 1s both;
        }

        .feature {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 2px; color: rgba(255,255,255,0.25); text-transform: uppercase;
        }
        .feature-dot { width: 5px; height: 5px; border-radius: 50%; background: #00ffc8; opacity: 0.7; }

        .corner { position: fixed; width: 56px; height: 56px; border-color: rgba(0,255,200,0.15); border-style: solid; z-index: 10; }
        .c-tl { top: 22px; left: 22px; border-width: 2px 0 0 2px; }
        .c-tr { top: 22px; right: 22px; border-width: 2px 2px 0 0; }
        .c-bl { bottom: 22px; left: 22px; border-width: 0 0 2px 2px; }
        .c-br { bottom: 22px; right: 22px; border-width: 0 2px 2px 0; }

        .version {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.15); text-transform: uppercase; z-index: 10;
        }

        /* Racket background */
        .racket-bg {
          position: fixed; top: 50%; left: 54%;
          transform: translate(-50%, -50%) rotate(-22deg);
          width: min(90vw, 820px); pointer-events: none; z-index: 1;
          opacity: 0; transition: opacity 1.8s ease 0.3s;
        }
        .racket-bg.loaded { opacity: 1; }
      `}</style>

      {/* Racket SVG background */}
      <svg className={`racket-bg ${loaded ? "loaded" : ""}`} viewBox="0 0 500 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f0d080" stopOpacity="0.9"/>
            <stop offset="25%"  stopColor="#c49b3c" stopOpacity="1"/>
            <stop offset="50%"  stopColor="#ffe9a0" stopOpacity="0.95"/>
            <stop offset="75%"  stopColor="#a07828" stopOpacity="1"/>
            <stop offset="100%" stopColor="#e8c96a" stopOpacity="0.9"/>
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
        </defs>
        <ellipse cx="250" cy="270" rx="166" ry="224" fill="none" stroke="rgba(196,155,60,0.12)" strokeWidth="28"/>
        <ellipse cx="250" cy="270" rx="158" ry="216" fill="none" stroke="url(#goldFrame)" strokeWidth="9"/>
        <ellipse cx="250" cy="270" rx="149" ry="207" fill="none" stroke="rgba(60,40,10,0.6)" strokeWidth="2"/>
        {Array.from({length:36},(_,i)=>{const y=74+i*11.2;const hw=Math.sqrt(Math.max(0,1-Math.pow((y-270)/207,2)))*149;return(<line key={`h${i}`} x1={250-hw} y1={y} x2={250+hw} y2={y} stroke="#c49b3c" strokeWidth={i%3===0?"0.8":"0.5"} opacity={i%3===0?0.28:0.16}/>);})}
        {Array.from({length:22},(_,i)=>{const x=105+i*13.5;const dy=Math.sqrt(Math.max(0,1-Math.pow((x-250)/149,2)))*207;return(<line key={`v${i}`} x1={x} y1={270-dy} x2={x} y2={270+dy} stroke="#c49b3c" strokeWidth={i%3===0?"0.8":"0.5"} opacity={i%3===0?0.28:0.16}/>);})}
        <path d="M 220 475 Q 215 510 226 535 L 274 535 Q 285 510 280 475 Z" fill="none" stroke="url(#goldFrame)" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M 226 535 L 218 720" stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 274 535 L 282 720" stroke="url(#goldHandle)" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M 218 720 Q 214 740 216 780 L 284 780 Q 286 740 282 720 Z" fill="url(#goldHandle)" opacity="0.9"/>
        {[730,742,754,766,778].map(y=>(<line key={y} x1="216" y1={y} x2="284" y2={y} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"/>))}
        <ellipse cx="250" cy="781" rx="36" ry="8" fill="url(#goldHandle)"/>
        <ellipse cx="250" cy="781" rx="36" ry="8" fill="none" stroke="rgba(255,220,100,0.5)" strokeWidth="1.5"/>
        <g style={{animation:"shuttleFloat 4s ease-in-out infinite"}} transform="translate(378, 88)">
          <ellipse cx="0" cy="0" rx="13" ry="15" fill="url(#corkGrad)" stroke="rgba(180,140,60,0.8)" strokeWidth="1.5"/>
          {Array.from({length:8},(_,i)=>{const angle=-90+(i-3.5)*12;const rad=angle*Math.PI/180;const length=52+Math.abs(i-3.5)*2;const x2=Math.cos(rad)*length;const y2=Math.sin(rad)*length-14;const ctrlX=Math.cos(rad)*length*0.55;const ctrlY=Math.sin(rad)*length*0.55-14+Math.sin(rad)*8;return(<g key={i}><path d={`M ${Math.cos(rad)*10} ${Math.sin(rad)*10-5} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`} stroke="rgba(255,248,230,0.85)" strokeWidth="0.8" fill="none" strokeLinecap="round"/><path d={`M ${Math.cos(rad)*10} ${Math.sin(rad)*10-5} Q ${ctrlX-5} ${ctrlY-4} ${x2} ${y2}`} stroke="rgba(255,248,230,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"/></g>);})}
          <ellipse cx="0" cy="-13" rx="22" ry="4" fill="none" stroke="rgba(255,248,230,0.35)" strokeWidth="0.8"/>
        </g>
      </svg>

      {/* Background */}
      <div className="landing-bg">
        <div className="grid-lines"/>
        <div className="glow-orb orb1"/>
        <div className="glow-orb orb2"/>
        <div className="shuttle">🏸</div>
      </div>

      {/* Vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)", pointerEvents: "none" }}/>

      {/* Corner decorations */}
      <div className="corner c-tl"/><div className="corner c-tr"/>
      <div className="corner c-bl"/><div className="corner c-br"/>

      {/* Main content */}
      <div className={`content ${loaded ? "loaded" : ""}`}>
        <div className="badge">🏸 Badminton Live Scoring Platform</div>

        <h1 className="logo">Match<span>X</span></h1>
        <p className="logo-sub">Professional Match Management</p>

        <div className="divider"/>

        <div className="login-box">

          {/* Name input */}
          <div className="input-group">
            <div className="input-label">Your Name</div>
            <input
              className="input-field"
              placeholder="RAHUL SHARMA"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="name"
              style={{ letterSpacing: "2px" }}
            />
          </div>

          {/* Access code input */}
          <div className="input-group">
            <div className="input-label">Access Code</div>
            <input
              className="input-field"
              placeholder="ENTER CODE"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKey}
              type="password"
              autoComplete="off"
            />
          </div>

          <button
            className="enter-btn"
            onClick={handleEnter}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Enter Arena"}
          </button>

          <div className="error-msg">{error}</div>

          <div className="new-hint">
            New player? Enter your name + any code to <span>create your profile</span>
          </div>

        </div>

        <div className="features">
          {["Live Score", "Commentary", "Rankings", "Player Stats"].map(f => (
            <div className="feature" key={f}>
              <div className="feature-dot"/>{f}
            </div>
          ))}
        </div>
      </div>

      <div className="version">MatchX v2.0 · Season 2026</div>
    </div>
  );
}

const styles = { container: { minHeight: "100vh", background: "#000", overflow: "hidden" } };

export default Landing;