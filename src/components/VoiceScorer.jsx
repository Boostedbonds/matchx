import { useState, useEffect, useRef, useCallback } from "react";

// ─── HINGLISH COMMAND MAP ───────────────────────────────────────────────────
// Each entry: { patterns: [regex/string], action, commentary }
// Patterns are matched against lowercase transcript

const buildCommandMap = (matchData) => {
  const tA = (matchData?.teamA || "team a").toLowerCase();
  const tB = (matchData?.teamB || "team b").toLowerCase();
  const pA1 = (matchData?.players?.A1 || "player a").toLowerCase();
  const pA2 = (matchData?.players?.A2 || "").toLowerCase();
  const pB1 = (matchData?.players?.B1 || "player b").toLowerCase();
  const pB2 = (matchData?.players?.B2 || "").toLowerCase();

  return [
    // ── POINT → TEAM A ──
    {
      patterns: [
        /\b(team\s*a|a\s*ka\s*point|a\s*ne\s*maara|a\s*score|point\s*a|score\s*karo\s*a|ek\s*point\s*a|point\s*team\s*a)\b/,
        new RegExp(`\\b(${tA.replace(/\s/g, "\\s*")}\\s*(ka\\s*point|ne\\s*maara|score|wins?|jeeta|point))\\b`),
        new RegExp(`\\b(${pA1.replace(/\s/g, "\\s*")}|${pA2.replace(/\s/g, "\\s*")})\\s*(ne\\s*maara|scores?|wins?|ka\\s*point|point)\\b`),
      ],
      action: "SCORE_A",
      getCommentary: (t) => `🏸 Point to ${matchData?.teamA || "Team A"}! ${t}`,
    },
    // ── POINT → TEAM B ──
    {
      patterns: [
        /\b(team\s*b|b\s*ka\s*point|b\s*ne\s*maara|b\s*score|point\s*b|score\s*karo\s*b|ek\s*point\s*b|point\s*team\s*b)\b/,
        new RegExp(`\\b(${tB.replace(/\s/g, "\\s*")}\\s*(ka\\s*point|ne\\s*maara|score|wins?|jeeta|point))\\b`),
        new RegExp(`\\b(${pB1.replace(/\s/g, "\\s*")}|${pB2.replace(/\s/g, "\\s*")})\\s*(ne\\s*maara|scores?|wins?|ka\\s*point|point)\\b`),
      ],
      action: "SCORE_B",
      getCommentary: (t) => `🏸 Point to ${matchData?.teamB || "Team B"}! ${t}`,
    },
    // ── SMASH ──
    {
      patterns: [/\b(smash|smash\s*maara|powerful\s*smash|jump\s*smash|smash\s*kiya)\b/],
      action: "COMMENTARY",
      getCommentary: (t) => `💥 SMASH! ${t}`,
    },
    // ── NET SHOT ──
    {
      patterns: [/\b(net|net\s*shot|net\s*pe|drop|drop\s*shot|net\s*point|net\s*se)\b/],
      action: "COMMENTARY",
      getCommentary: (t) => `🕸️ Brilliant net shot! ${t}`,
    },
    // ── FAULT ──
    {
      patterns: [/\b(fault|service\s*fault|serv(ice)?\s*fault|foul|out|bahar|let)\b/],
      action: "COMMENTARY",
      getCommentary: (t) => `⚠️ Fault! ${t}`,
    },
    // ── DEUCE ──
    {
      patterns: [/\b(deuce|duce|barabar|20\s*all|equal|draw)\b/],
      action: "COMMENTARY",
      getCommentary: () => `⚡ DEUCE! The tension is building — this is incredible!`,
    },
    // ── RALLY ──
    {
      patterns: [/\b(rally|lamba\s*rally|long\s*rally|achi\s*rally|acha\s*khela|what\s*a\s*rally)\b/],
      action: "COMMENTARY",
      getCommentary: (t) => `🔥 What a rally! ${t}`,
    },
    // ── NEXT GAME ──
    {
      patterns: [/\b(next\s*game|agla\s*game|game\s*start|new\s*game|dusra\s*game|second\s*game|third\s*game)\b/],
      action: "NEXT_GAME",
      getCommentary: () => `🎮 Next game starting! Players reset positions.`,
    },
    // ── RESET ──
    {
      patterns: [/\b(reset|dobara|restart|phir\s*se|score\s*reset|zero|shuru\s*se)\b/],
      action: "RESET",
      getCommentary: () => `🔄 Score has been reset.`,
    },
    // ── MATCH OVER ──
    {
      patterns: [/\b(match\s*(over|khatam|finish|end|jeeta|jeet|won)|game\s*over|khatam|winner)\b/],
      action: "MATCH_OVER",
      getCommentary: (t) => `🏆 Match Over! ${t}`,
    },
    // ── GENERIC COMMENTARY (catch-all) ──
    {
      patterns: [/.+/],
      action: "COMMENTARY",
      getCommentary: (t) => `🎙️ ${t}`,
    },
  ];
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

function VoiceScorer({ matchData, onScoreA, onScoreB, onReset, onCommentary, onNextGame }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [log, setLog] = useState([]);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const [pulseLevel, setPulseLevel] = useState(0);
  const recogRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.lang = "en-IN"; // Indian English — best for Hinglish
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(interim || final);
      if (final.trim()) processCommand(final.trim());
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech") setError(`Mic error: ${e.error}`);
    };

    recognition.onend = () => {
      if (listening) recognition.start(); // keep alive
    };

    recogRef.current = recognition;
    return () => recognition.abort();
  }, [listening, matchData]);

  // Animate pulse bar while listening
  useEffect(() => {
    if (listening) {
      pulseRef.current = setInterval(() => {
        setPulseLevel(Math.random());
      }, 150);
    } else {
      clearInterval(pulseRef.current);
      setPulseLevel(0);
    }
    return () => clearInterval(pulseRef.current);
  }, [listening]);

  const processCommand = useCallback((text) => {
    const lower = text.toLowerCase().trim();
    const commands = buildCommandMap(matchData);

    for (const cmd of commands) {
      const matched = cmd.patterns.some(p => {
        if (p instanceof RegExp) return p.test(lower);
        return lower.includes(p);
      });

      if (matched) {
        const commentary = cmd.getCommentary(text);
        const entry = { text, action: cmd.action, commentary, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) };

        setLog(prev => [entry, ...prev].slice(0, 30));
        setLastAction(cmd.action);
        onCommentary?.(commentary);

        switch (cmd.action) {
          case "SCORE_A": onScoreA?.(); break;
          case "SCORE_B": onScoreB?.(); break;
          case "RESET": onReset?.(); break;
          case "NEXT_GAME": onNextGame?.(); break;
          case "MATCH_OVER": break;
          default: break;
        }

        setTimeout(() => setLastAction(null), 1500);
        break;
      }
    }
    setTranscript("");
  }, [matchData, onScoreA, onScoreB, onReset, onCommentary, onNextGame]);

  const toggleListening = () => {
    if (!recogRef.current) return;
    if (listening) {
      recogRef.current.abort();
      setListening(false);
      setTranscript("");
      setError("");
    } else {
      setError("");
      recogRef.current.start();
      setListening(true);
    }
  };

  const ACTION_COLORS = {
    SCORE_A: "#00ffc8",
    SCORE_B: "#ff3250",
    COMMENTARY: "rgba(255,255,255,0.5)",
    RESET: "#ffb800",
    NEXT_GAME: "#0088ff",
    MATCH_OVER: "#ffb800",
  };

  const ACTION_LABELS = {
    SCORE_A: `+1 ${matchData?.teamA || "Team A"}`,
    SCORE_B: `+1 ${matchData?.teamB || "Team B"}`,
    COMMENTARY: "Commentary",
    RESET: "Reset",
    NEXT_GAME: "Next Game",
    MATCH_OVER: "Match Over",
  };

  if (!supported) return (
    <div style={styles.unsupported}>
      ⚠️ Voice scoring requires Chrome or Edge browser
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');

        .vs-mic-btn {
          width: 72px; height: 72px; border-radius: 50%;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; transition: all 0.2s;
          position: relative; flex-shrink: 0;
        }

        .vs-mic-btn.off {
          background: rgba(255,255,255,0.06);
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow: none;
        }

        .vs-mic-btn.on {
          background: #ff3250;
          border: 2px solid #ff3250;
          box-shadow: 0 0 0 8px rgba(255,50,80,0.15), 0 0 30px rgba(255,50,80,0.4);
          animation: micPulse 1s ease infinite;
        }

        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(255,50,80,0.15), 0 0 30px rgba(255,50,80,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(255,50,80,0.08), 0 0 40px rgba(255,50,80,0.5); }
        }

        .vs-pulse-bar {
          display: flex; align-items: flex-end; gap: 3px;
          height: 32px; padding: 0 4px;
        }

        .vs-pulse-bar span {
          width: 4px; border-radius: 2px;
          background: #ff3250;
          transition: height 0.1s ease;
        }

        .vs-log-item {
          display: flex; gap: 10px; padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          animation: fadeIn 0.3s ease;
        }

        .vs-log-item:last-child { border-bottom: none; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .action-flash {
          animation: flash 0.4s ease;
        }

        @keyframes flash {
          0% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        .cmd-chip {
          display: inline-block; padding: 2px 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          border-radius: 2px;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.title}>🎙 Voice Scorer</div>
          <div style={styles.subtitle}>Speaks Hinglish · Auto Commentary</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {listening && (
            <div className="vs-pulse-bar">
              {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5].map((base, i) => (
                <span key={i} style={{ height: `${Math.max(4, (base + pulseLevel * 0.7) * 28)}px` }} />
              ))}
            </div>
          )}
          <button className={`vs-mic-btn ${listening ? "on" : "off"}`} onClick={toggleListening}>
            {listening ? "🎙" : "🎤"}
          </button>
        </div>
      </div>

      {/* Status */}
      {listening && (
        <div style={styles.statusBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3250", animation: "micPulse 1s infinite" }} />
            <span style={styles.statusText}>Listening... speak a command</span>
          </div>
          {transcript && (
            <div style={styles.transcript}>"{transcript}"</div>
          )}
        </div>
      )}

      {/* Last Action Flash */}
      {lastAction && (
        <div className="action-flash" style={{ ...styles.actionFlash, background: `${ACTION_COLORS[lastAction]}20`, border: `1px solid ${ACTION_COLORS[lastAction]}40`, color: ACTION_COLORS[lastAction] }}>
          {ACTION_LABELS[lastAction]}
        </div>
      )}

      {error && <div style={styles.errorBar}>⚠️ {error}</div>}

      {/* Commands Reference */}
      <div style={styles.cmdRef}>
        <div style={styles.cmdRefTitle}>Commands</div>
        <div style={styles.cmdGrid}>
          {[
            { label: "Team A Point", examples: ["Point A", "Team A ka point", "A ne maara", matchData?.players?.A1?.split(" ")[0] + " scores"].filter(Boolean) },
            { label: "Team B Point", examples: ["Point B", "Team B ka point", "B ne maara", matchData?.players?.B1?.split(" ")[0] + " scores"].filter(Boolean) },
            { label: "Events", examples: ["Smash", "Net shot", "Fault", "Deuce", "Rally"] },
            { label: "Control", examples: ["Reset", "Next game", "Match khatam", "Dobara"] },
          ].map((group, i) => (
            <div key={i} style={styles.cmdGroup}>
              <div style={styles.cmdGroupLabel}>{group.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {group.examples.map((ex, j) => (
                  <span key={j} className="cmd-chip" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={styles.logSection}>
          <div style={styles.cmdRefTitle}>Voice Log</div>
          <div style={styles.logList}>
            {log.slice(0, 8).map((entry, i) => (
              <div key={i} className="vs-log-item">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: "rgba(255,255,255,0.2)", letterSpacing: 1, flexShrink: 0, width: 56 }}>{entry.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic", marginBottom: 2 }}>"{entry.text}"</div>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, fontWeight: 700, color: ACTION_COLORS[entry.action] || "rgba(255,255,255,0.5)" }}>
                    → {entry.commentary}
                  </div>
                </div>
                <span className="cmd-chip" style={{ background: `${ACTION_COLORS[entry.action]}15`, border: `1px solid ${ACTION_COLORS[entry.action]}30`, color: ACTION_COLORS[entry.action], alignSelf: "flex-start" }}>
                  {ACTION_LABELS[entry.action]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not listening placeholder */}
      {!listening && log.length === 0 && (
        <div style={styles.placeholder}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎤</div>
          <div style={styles.placeholderText}>Tap the mic to start voice scoring</div>
          <div style={styles.placeholderSub}>Supports English + Hinglish commands</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0d0f15",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
    fontFamily: "'Rajdhani', sans-serif",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(255,50,80,0.03)",
  },
  headerLeft: {},
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22, letterSpacing: 3, color: "#fff",
  },
  subtitle: {
    fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)", marginTop: 2,
  },
  statusBar: {
    padding: "12px 20px",
    background: "rgba(255,50,80,0.06)",
    borderBottom: "1px solid rgba(255,50,80,0.1)",
  },
  statusText: {
    fontSize: 12, letterSpacing: 2, color: "#ff3250",
    fontWeight: 700, textTransform: "uppercase",
  },
  transcript: {
    marginTop: 6, fontSize: 14, fontWeight: 600,
    color: "rgba(255,255,255,0.6)", fontStyle: "italic",
  },
  actionFlash: {
    margin: "12px 20px",
    padding: "12px 16px",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24, letterSpacing: 4,
    textAlign: "center",
  },
  errorBar: {
    padding: "8px 20px",
    background: "rgba(255,50,80,0.08)",
    borderTop: "1px solid rgba(255,50,80,0.15)",
    fontSize: 12, color: "#ff3250", letterSpacing: 1,
  },
  cmdRef: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  cmdRefTitle: {
    fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
    color: "rgba(255,255,255,0.2)", marginBottom: 10,
  },
  cmdGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  cmdGroup: {},
  cmdGroupLabel: {
    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 6,
  },
  logSection: {
    padding: "16px 20px",
  },
  logList: {},
  placeholder: {
    padding: "32px 20px",
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
  },
  placeholderSub: {
    fontSize: 11, color: "rgba(255,255,255,0.12)",
    letterSpacing: 1, marginTop: 4,
  },
  unsupported: {
    padding: 20, background: "rgba(255,184,0,0.08)",
    border: "1px solid rgba(255,184,0,0.2)",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13, color: "#ffb800", letterSpacing: 1,
  },
};

export default VoiceScorer;