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
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-bg {
          position: fixed; inset: 0; z-index: 0;
          background: #000;
          overflow: hidden;
        }

        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,255,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }

        .court-lines {
          position: absolute;
          bottom: -10%; left: 50%; transform: translateX(-50%);
          width: 900px; height: 500px;
          border: 1px solid rgba(0,255,200,0.12);
          perspective: 800px;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: pulse 4s ease-in-out infinite;
        }
        .orb1 { width: 500px; height: 500px; background: rgba(0,255,200,0.08); top: -100px; left: -100px; }
        .orb2 { width: 400px; height: 400px; background: rgba(0,180,255,0.06); bottom: -50px; right: -50px; animation-delay: 2s; }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .shuttle {
          position: absolute;
          font-size: 40px;
          animation: shuttleFly 6s ease-in-out infinite;
          top: 30%;
        }

        @keyframes shuttleFly {
          0% { left: -5%; transform: translateY(0px) rotate(-20deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-80px) rotate(10deg); }
          90% { opacity: 1; }
          100% { left: 105%; transform: translateY(0px) rotate(-20deg); opacity: 0; }
        }

        .content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh;
          padding: 40px 20px;
          opacity: 0; transform: translateY(30px);
          transition: all 0.8s ease;
        }
        .content.loaded { opacity: 1; transform: translateY(0); }

        .badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(0,255,200,0.7);
          border: 1px solid rgba(0,255,200,0.3);
          padding: 6px 16px; border-radius: 2px;
          margin-bottom: 24px;
          animation: fadeSlideDown 0.8s ease 0.2s both;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 15vw, 160px);
          color: #fff;
          letter-spacing: 8px;
          line-height: 0.9;
          text-align: center;
          position: relative;
          animation: fadeSlideDown 0.8s ease 0.4s both;
        }

        .logo span {
          color: #00ffc8;
          text-shadow: 0 0 40px rgba(0,255,200,0.8), 0 0 80px rgba(0,255,200,0.4);
        }

        .logo-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 500;
          letter-spacing: 8px; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
          animation: fadeSlideDown 0.8s ease 0.5s both;
        }

        .divider {
          width: 120px; height: 1px;
          background: linear-gradient(90deg, transparent, #00ffc8, transparent);
          margin: 40px 0;
          animation: fadeSlideDown 0.8s ease 0.6s both;
        }

        .stats-row {
          display: flex; gap: 48px;
          margin-bottom: 48px;
          animation: fadeSlideDown 0.8s ease 0.7s both;
        }

        .stat {
          text-align: center;
        }

        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; color: #00ffc8;
          text-shadow: 0 0 20px rgba(0,255,200,0.5);
          line-height: 1;
        }

        .stat-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-top: 4px;
        }

        .login-box {
          width: 100%; max-width: 360px;
          animation: fadeSlideDown 0.8s ease 0.8s both;
        }

        .input-wrap {
          position: relative; margin-bottom: 12px;
        }

        .input-wrap input {
          width: 100%; padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,200,0.25);
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px; font-weight: 500;
          letter-spacing: 3px;
          outline: none;
          transition: all 0.3s;
        }

        .input-wrap input:focus {
          border-color: #00ffc8;
          background: rgba(0,255,200,0.04);
          box-shadow: 0 0 20px rgba(0,255,200,0.1), inset 0 0 20px rgba(0,255,200,0.02);
        }

        .input-wrap input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 2px; }

        .enter-btn {
          width: 100%; padding: 16px;
          background: #00ffc8;
          border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 4px;
          color: #000;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }

        .enter-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.4s;
        }

        .enter-btn:hover::before { left: 100%; }
        .enter-btn:hover { background: #fff; box-shadow: 0 0 40px rgba(0,255,200,0.6); }
        .enter-btn:active { transform: scale(0.98); }

        .error-msg {
          font-family: 'Rajdhani', sans-serif;
          color: #ff4466; font-size: 13px;
          letter-spacing: 2px; text-align: center;
          margin-top: 10px; height: 20px;
          transition: opacity 0.3s;
        }

        .features {
          display: flex; gap: 24px;
          margin-top: 56px;
          animation: fadeSlideDown 0.8s ease 1s both;
        }

        .feature {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        .feature-dot {
          width: 6px; height: 6px;
          background: #00ffc8;
          border-radius: 50%;
          box-shadow: 0 0 8px #00ffc8;
        }

        .corner-deco {
          position: fixed;
          width: 60px; height: 60px;
          border-color: rgba(0,255,200,0.2);
          border-style: solid;
          z-index: 5;
        }
        .corner-tl { top: 24px; left: 24px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 24px; right: 24px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 24px; left: 24px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 24px; right: 24px; border-width: 0 2px 2px 0; }

        .version {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase; z-index: 10;
        }
      `}</style>

      {/* Background */}
      <div className="landing-bg">
        <div className="grid-lines" />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />
        <div className="shuttle">🏸</div>
      </div>

      {/* Corner decorations */}
      <div className="corner-deco corner-tl" />
      <div className="corner-deco corner-tr" />
      <div className="corner-deco corner-bl" />
      <div className="corner-deco corner-br" />

      {/* Main Content */}
      <div className={`content ${loaded ? "loaded" : ""}`}>
        <div className="badge">🏸 Badminton Live Scoring Platform</div>

        <h1 className="logo">Match<span>X</span></h1>
        <p className="logo-sub">Professional Match Management</p>

        <div className="divider" />

        <div className="stats-row">
          <div className="stat">
            <div className="stat-num">21</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat">
            <div className="stat-num">3</div>
            <div className="stat-label">Games</div>
          </div>
          <div className="stat">
            <div className="stat-num">Live</div>
            <div className="stat-label">Stream</div>
          </div>
        </div>

        <div className="login-box">
          <div className="input-wrap">
            <input
              placeholder="ENTER ACCESS CODE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              type="password"
            />
          </div>
          <button className="enter-btn" onClick={handleEnter}>
            Enter Arena
          </button>
          <div className="error-msg">{error}</div>
        </div>

        <div className="features">
          <div className="feature"><div className="feature-dot" />Live Score</div>
          <div className="feature"><div className="feature-dot" />Streaming</div>
          <div className="feature"><div className="feature-dot" />Commentary</div>
          <div className="feature"><div className="feature-dot" />Rankings</div>
        </div>
      </div>

      <div className="version">MatchX v2.0 · Powered by Firebase</div>
    </div>
  );
}

const styles = { container: { minHeight: "100vh", background: "#000", overflow: "hidden" } };

export default Landing;