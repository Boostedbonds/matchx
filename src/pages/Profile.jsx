import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .prof-root {
    min-height: 100vh; background: #030508; color: #e8e0d0;
    font-family: 'Rajdhani', sans-serif;
    position: relative; overflow-x: hidden;
  }
  .prof-root::before {
    content: ''; position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,200,0.06) 0%, transparent 60%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,255,200,0.015) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,200,0.015) 40px);
    pointer-events: none; z-index: 0;
  }
  .prof-inner {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 48px 32px 80px;
  }

  /* Hero */
  .prof-hero {
    display: grid; grid-template-columns: auto 1fr auto;
    gap: 32px; align-items: center;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 36px 40px; margin-bottom: 32px;
    position: relative; overflow: hidden;
  }
  .prof-hero::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 4px; height: 100%;
    background: linear-gradient(to bottom, #00ffc8, rgba(0,255,200,0.1));
  }

  /* Avatar */
  .prof-avatar-wrap { position: relative; width: 100px; height: 100px; }
  .prof-avatar {
    width: 100px; height: 100px; border-radius: 50%;
    object-fit: cover; border: 2px solid rgba(0,255,200,0.3);
    background: #1a1f2e;
  }
  .prof-avatar-fallback {
    width: 100px; height: 100px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(0,255,200,0.15), rgba(0,136,255,0.15));
    border: 2px solid rgba(0,255,200,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #00ffc8;
  }
  .prof-avatar-emoji {
    width: 100px; height: 100px; border-radius: 50%;
    background: rgba(0,255,200,0.05);
    border: 2px solid rgba(0,255,200,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
  }
  .prof-avatar-edit {
    position: absolute; bottom: 2px; right: 2px;
    width: 28px; height: 28px; border-radius: 50%;
    background: #00ffc8; border: 2px solid #030508;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 13px; transition: transform 0.2s;
  }
  .prof-avatar-edit:hover { transform: scale(1.1); }

  .prof-hero-info { min-width: 0; }
  .prof-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(32px, 4vw, 52px); letter-spacing: 0.05em;
    line-height: 1; color: #fff; margin: 0 0 6px;
  }
  .prof-username {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: rgba(255,255,255,0.3); letter-spacing: 0.12em; margin-bottom: 12px;
  }
  .prof-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .prof-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; padding: 3px 10px; text-transform: uppercase;
    border: 1px solid; border-radius: 0;
  }
  .prof-tag.elo   { color: #00ffc8; border-color: rgba(0,255,200,0.3); background: rgba(0,255,200,0.06); }
  .prof-tag.style { color: #ffb800; border-color: rgba(255,184,0,0.3); background: rgba(255,184,0,0.06); }
  .prof-tag.level { color: #a78bfa; border-color: rgba(167,139,250,0.3); background: rgba(167,139,250,0.06); }

  .prof-elo-block { text-align: right; }
  .prof-elo-num {
    font-family: 'Bebas Neue', sans-serif; font-size: 64px;
    letter-spacing: 0.03em; line-height: 1;
    background: linear-gradient(135deg, #00ffc8, #00c87a);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .prof-elo-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.2em; color: rgba(0,255,200,0.4); text-transform: uppercase;
  }

  /* Stats */
  .prof-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 32px;
  }
  .prof-stat {
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 20px 24px; position: relative;
  }
  .prof-stat::before {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: linear-gradient(to right, rgba(0,255,200,0.3), transparent);
  }
  .prof-stat-val {
    font-family: 'Bebas Neue', sans-serif; font-size: 40px;
    letter-spacing: 0.04em; line-height: 1; color: #fff; margin-bottom: 4px;
  }
  .prof-stat-val.green { color: #00ffc8; }
  .prof-stat-val.red   { color: #ff6060; }
  .prof-stat-val.gold  { color: #ffd700; }
  .prof-stat-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.18em; color: rgba(255,255,255,0.3); text-transform: uppercase;
  }

  /* Playstyle */
  .playstyle-card {
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 28px 32px; margin-bottom: 32px;
  }
  .section-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px;
    letter-spacing: 0.08em; color: #e8e0d0; margin: 0 0 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-title::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
  }
  .ps-bars { display: flex; flex-direction: column; gap: 14px; }
  .ps-bar-row { display: grid; grid-template-columns: 110px 1fr 36px; gap: 12px; align-items: center; }
  .ps-bar-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: rgba(255,255,255,0.4); text-transform: uppercase;
  }
  .ps-bar-track { height: 6px; background: rgba(255,255,255,0.06); position: relative; }
  .ps-bar-fill {
    height: 100%; transition: width 0.8s cubic-bezier(0.25,1,0.5,1); position: relative;
  }
  .ps-bar-fill::after {
    content: ''; position: absolute; right: 0; top: -3px;
    width: 12px; height: 12px; border-radius: 50%;
    background: inherit; box-shadow: 0 0 8px currentColor;
  }
  .ps-bar-val {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: rgba(255,255,255,0.5); text-align: right; letter-spacing: 0.1em;
  }

  /* Badges */
  .badges-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px; margin-bottom: 32px;
  }
  .badge-card {
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 18px 16px; text-align: center;
    transition: all 0.2s; position: relative;
  }
  .badge-card.earned { border-color: rgba(0,255,200,0.2); background: rgba(0,255,200,0.04); }
  .badge-card.locked { opacity: 0.35; }
  .badge-icon { font-size: 28px; margin-bottom: 8px; }
  .badge-label {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    color: #e8e0d0; margin-bottom: 4px; letter-spacing: 0.03em;
  }
  .badge-desc {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: rgba(255,255,255,0.3); letter-spacing: 0.08em; line-height: 1.4;
  }
  .badge-lock { position: absolute; top: 8px; right: 8px; font-size: 10px; opacity: 0.4; }

  /* Match history */
  .match-row {
    display: grid; grid-template-columns: auto 1fr auto auto;
    gap: 16px; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    padding: 14px 0; cursor: default;
  }
  .match-result-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .match-result-dot.win  { background: #00ffc8; box-shadow: 0 0 8px #00ffc8; }
  .match-result-dot.loss { background: #ff6060; box-shadow: 0 0 8px #ff6060; }
  .match-opponent { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 600; color: #e8e0d0; }
  .match-score { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4); }
  .match-elo-delta { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .match-elo-delta.pos { color: #00ffc8; }
  .match-elo-delta.neg { color: #ff6060; }

  /* Avatar modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(3,5,8,0.92); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal-box {
    background: #0d1018; border: 1px solid rgba(0,255,200,0.15);
    width: 100%; max-width: 640px; max-height: 90vh;
    overflow-y: auto; padding: 32px; position: relative;
  }
  .modal-close {
    position: absolute; top: 16px; right: 16px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4); font-size: 18px; width: 32px; height: 32px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .modal-close:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
  .modal-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.08em;
    color: #fff; margin: 0 0 24px;
  }

  .avatar-preset-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px;
  }
  .avatar-preset-fb {
    aspect-ratio: 1; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.08); cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    font-size: 28px;
  }
  .avatar-preset-fb:hover { border-color: rgba(0,255,200,0.5); transform: scale(1.05); }
  .avatar-preset-fb.selected { border-color: #00ffc8; box-shadow: 0 0 16px rgba(0,255,200,0.3); }

  .modal-divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0;
  }
  .modal-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .modal-divider-text {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.2em; color: rgba(255,255,255,0.2); text-transform: uppercase;
  }

  .camera-section { display: flex; flex-direction: column; gap: 12px; }
  .modal-action-btn {
    padding: 12px 20px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6);
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600;
    letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; text-align: left;
  }
  .modal-action-btn:hover { border-color: rgba(0,255,200,0.3); color: #00ffc8; background: rgba(0,255,200,0.04); }
  .camera-preview { width: 100%; border-radius: 2px; border: 1px solid rgba(255,255,255,0.1); }
  .capture-preview { width: 100%; border-radius: 50%; max-width: 180px; display: block; margin: 0 auto 16px; border: 2px solid #00ffc8; }

  .modal-confirm-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #00ffc8, #00c87a);
    color: #020905; border: none; cursor: pointer;
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.1em;
    transition: all 0.2s; margin-top: 12px;
  }
  .modal-confirm-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,255,200,0.3); }
  .modal-confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .hidden-upload { display: none; }

  @media (max-width: 640px) {
    .prof-hero { grid-template-columns: 1fr; gap: 20px; padding: 24px; }
    .prof-elo-block { text-align: left; }
    .prof-stats { grid-template-columns: repeat(2, 1fr); }
    .prof-inner { padding: 24px 16px 60px; }
    .avatar-preset-grid { grid-template-columns: repeat(4, 1fr); }
  }
`;

const BADGES = [
  { id: "first_match",  icon: "🏸", label: "First Match",  desc: "Played your first match",     threshold: 1,    stat: "total_matches" },
  { id: "ten_matches",  icon: "🔟", label: "Ten Played",   desc: "Completed 10 matches",         threshold: 10,   stat: "total_matches" },
  { id: "first_win",    icon: "🥇", label: "First Win",    desc: "Won your first match",         threshold: 1,    stat: "wins" },
  { id: "five_wins",    icon: "🔥", label: "On Fire",      desc: "5 wins achieved",              threshold: 5,    stat: "wins" },
  { id: "twenty_wins",  icon: "⚡", label: "Lightning",    desc: "20 wins — you're a beast",     threshold: 20,   stat: "wins" },
  { id: "elo_1600",     icon: "📈", label: "Rising Star",  desc: "ELO reached 1600",             threshold: 1600, stat: "elo" },
  { id: "elo_1800",     icon: "💎", label: "Diamond",      desc: "ELO reached 1800",             threshold: 1800, stat: "elo" },
  { id: "elo_2000",     icon: "👑", label: "Champion",     desc: "ELO reached 2000",             threshold: 2000, stat: "elo" },
];

const EMOJI_AVATARS = ["🦅","🐯","🦁","🐉","🦊","🐺","🦈","🐻","🦋","🎯","⚡","🔥","💎","🏆","🌟"];

function computePlaystyle(p) {
  if (!p) return { attack: 0, defense: 0, stamina: 0, technique: 0, experience: 0 };
  const total   = (p.wins || 0) + (p.losses || 0);
  const elo     = p.elo || 1500;
  const winRate = total > 0 ? p.wins / total : 0.5;
  return {
    attack:     Math.min(100, Math.round(50 + winRate * 40 + (elo - 1500) / 30)),
    defense:    Math.min(100, Math.round(40 + (1 - winRate) * 30 + total * 0.5)),
    stamina:    Math.min(100, Math.round(30 + total * 1.2)),
    technique:  Math.min(100, Math.round(40 + (elo - 1500) / 20)),
    experience: Math.min(100, Math.round(total * 3)),
  };
}

function getSkillLevel(elo) {
  if (elo >= 2000) return "Champion";
  if (elo >= 1800) return "Advanced";
  if (elo >= 1600) return "Intermediate";
  if (elo >= 1500) return "Beginner+";
  return "Beginner";
}

function getPlaystyleLabel(style) {
  if (style.attack > 70)    return "Attacker";
  if (style.defense > 70)   return "Defender";
  if (style.technique > 65) return "Technician";
  return "All-Rounder";
}

// Render avatar from avatar_url — handles emoji:🦅, URLs, and null
function AvatarDisplay({ avatarUrl, name, className = "prof-avatar", size = 100 }) {
  if (avatarUrl?.startsWith("emoji:")) {
    const emoji = avatarUrl.replace("emoji:", "");
    return (
      <div className="prof-avatar-emoji" style={{ width: size, height: size, fontSize: size * 0.48 }}>
        {emoji}
      </div>
    );
  }
  if (avatarUrl) {
    return <img src={avatarUrl} className={className} alt="avatar" style={{ width: size, height: size }} />;
  }
  return (
    <div className="prof-avatar-fallback" style={{ width: size, height: size }}>
      {name?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}

export default function Profile({ user, player: playerProp, onNav }) {
  const [playerData,      setPlayerData]      = useState(null);
  const [matchHistory,    setMatchHistory]    = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedPreset,  setSelectedPreset]  = useState(null);
  const [showCamera,      setShowCamera]      = useState(false);
  const [capturedImage,   setCapturedImage]   = useState(null);
  const [uploading,       setUploading]       = useState(false);
  const [fetchError,      setFetchError]      = useState(null);

  const videoRef = useRef(null);
  const fileRef  = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchPlayer();
    return () => stopCamera();
  }, [user, playerProp]);

  // ── Fetch player data ────────────────────────────────────────────────────
  async function fetchPlayer() {
    setFetchError(null);
    try {
      const authId  = user?.id;                           // Supabase magic-link user
      const localId = playerProp?.id || localStorage.getItem("player_id"); // access-code user

      let data = null;

      if (authId) {
        // Magic-link: look up by auth_id column
        const { data: d } = await supabase
          .from("players").select("*").eq("auth_id", authId).maybeSingle();
        data = d;

        // Auto-create profile if first login
        if (!data && user?.email) {
          const { data: np } = await supabase.from("players").insert({
            name:      user.email.split("@")[0],
            auth_id:   authId,
            elo:       1500, wins: 0, losses: 0,
            avatar_url: `emoji:${EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]}`,
          }).select().single();
          data = np;
        }
      } else if (localId) {
        // Access-code: look up by id column
        const { data: d } = await supabase
          .from("players").select("*").eq("id", localId).maybeSingle();
        data = d;
      }

      if (data) {
        setPlayerData(data);
        fetchMatchHistory(data.id);
      } else {
        setFetchError("Could not load profile. Please log in again.");
      }
    } catch (err) {
      console.error("fetchPlayer error:", err);
      setFetchError("Failed to load profile.");
    }
  }

  async function fetchMatchHistory(playerId) {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);
    setMatchHistory(data || []);
  }

  // ── Camera ───────────────────────────────────────────────────────────────
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setShowCamera(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
      setShowCamera(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/png"));
    stopCamera();
    setShowCamera(false);
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result);
    reader.readAsDataURL(file);
  }

  // ── Save avatar ──────────────────────────────────────────────────────────
  async function saveEmojiAvatar() {
    if (!selectedPreset || !playerData) return;
    setUploading(true);
    await supabase.from("players")
      .update({ avatar_url: selectedPreset })
      .eq("id", playerData.id);
    setUploading(false);
    closeModal();
    fetchPlayer();
  }

  async function saveCapturedAvatar() {
    if (!capturedImage || !playerData) return;
    setUploading(true);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const path = `players/${playerData.id}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars").getPublicUrl(path);

      await supabase.from("players")
        .update({ avatar_url: publicUrl })
        .eq("id", playerData.id);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
    closeModal();
    fetchPlayer();
  }

  function closeModal() {
    setShowAvatarModal(false);
    setShowCamera(false);
    setCapturedImage(null);
    setSelectedPreset(null);
    stopCamera();
  }

  // ── Loading / error states ────────────────────────────────────────────────
  if (!playerData && !fetchError) {
    return (
      <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLES}</style>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(0,255,200,0.5)" }}>
          LOADING PROFILE...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLES}</style>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,96,96,0.7)", textAlign: "center" }}>
          {fetchError}
        </div>
      </div>
    );
  }

  const style          = computePlaystyle(playerData);
  const skillLevel     = getSkillLevel(playerData.elo || 1500);
  const playstyleLabel = getPlaystyleLabel(style);
  const total          = (playerData.wins || 0) + (playerData.losses || 0);
  const winRate        = total > 0 ? Math.round((playerData.wins / total) * 100) : 0;

  const earnedBadges = BADGES.filter(b => {
    const val = b.stat === "total_matches" ? total : (playerData[b.stat] || 0);
    return val >= b.threshold;
  });

  return (
    <>
      <style>{STYLES}</style>
      <div className="prof-root">
        <div className="prof-inner">

          {/* Hero */}
          <div className="prof-hero">
            <div className="prof-avatar-wrap">
              <AvatarDisplay avatarUrl={playerData.avatar_url} name={playerData.name} />
              <button className="prof-avatar-edit" onClick={() => setShowAvatarModal(true)} title="Change avatar">✏️</button>
            </div>

            <div className="prof-hero-info">
              <div className="prof-name">{playerData.name || "Player"}</div>
              <div className="prof-username">@{playerData.username || playerData.name?.toLowerCase().replace(/\s/g, "") || "player"}</div>
              <div className="prof-tags">
                <span className="prof-tag elo">ELO {playerData.elo || 1500}</span>
                <span className="prof-tag style">{playstyleLabel}</span>
                <span className="prof-tag level">{skillLevel}</span>
              </div>
            </div>

            <div className="prof-elo-block">
              <div className="prof-elo-num">{playerData.elo || 1500}</div>
              <div className="prof-elo-label">Rating</div>
            </div>
          </div>

          {/* Stats */}
          <div className="prof-stats">
            <div className="prof-stat">
              <div className="prof-stat-val">{total}</div>
              <div className="prof-stat-label">Matches</div>
            </div>
            <div className="prof-stat">
              <div className="prof-stat-val green">{playerData.wins || 0}</div>
              <div className="prof-stat-label">Wins</div>
            </div>
            <div className="prof-stat">
              <div className="prof-stat-val red">{playerData.losses || 0}</div>
              <div className="prof-stat-label">Losses</div>
            </div>
            <div className="prof-stat">
              <div className="prof-stat-val gold">{winRate}%</div>
              <div className="prof-stat-label">Win Rate</div>
            </div>
          </div>

          {/* Playstyle */}
          <div className="playstyle-card">
            <div className="section-title">Playstyle Analysis</div>
            <div className="ps-bars">
              {[
                { label: "Attack",     val: style.attack,     color: "#ff6060" },
                { label: "Defense",    val: style.defense,    color: "#00ffc8" },
                { label: "Stamina",    val: style.stamina,    color: "#ffb800" },
                { label: "Technique",  val: style.technique,  color: "#a78bfa" },
                { label: "Experience", val: style.experience, color: "#60a5fa" },
              ].map(({ label, val, color }) => (
                <div key={label} className="ps-bar-row">
                  <div className="ps-bar-label">{label}</div>
                  <div className="ps-bar-track">
                    <div className="ps-bar-fill" style={{ width: `${val}%`, background: `linear-gradient(to right, ${color}80, ${color})`, color }} />
                  </div>
                  <div className="ps-bar-val">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="section-title" style={{ marginBottom: 16 }}>Achievements</div>
          <div className="badges-grid">
            {BADGES.map(b => {
              const earned = earnedBadges.find(e => e.id === b.id);
              return (
                <div key={b.id} className={`badge-card ${earned ? "earned" : "locked"}`}>
                  {!earned && <span className="badge-lock">🔒</span>}
                  <div className="badge-icon">{b.icon}</div>
                  <div className="badge-label">{b.label}</div>
                  <div className="badge-desc">{b.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Match History */}
          {matchHistory.length > 0 && (
            <>
              <div className="section-title">Match History</div>
              <div>
                {matchHistory.map((m, i) => {
                  const isP1      = m.player1_id === playerData.id;
                  const opponent  = isP1 ? m.player2_name : m.player1_name;
                  const myScore   = isP1 ? m.score_a : m.score_b;
                  const oppScore  = isP1 ? m.score_b : m.score_a;
                  const won       = myScore > oppScore;
                  return (
                    <div key={m.id || i} className="match-row">
                      <div className={`match-result-dot ${won ? "win" : "loss"}`} />
                      <div className="match-opponent">{opponent || "Unknown"}</div>
                      <div className="match-score">{myScore} – {oppScore}</div>
                      <div className={`match-elo-delta ${won ? "pos" : "neg"}`}>
                        {won ? "+" : "-"}{Math.abs(m.elo_delta || 25)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-title">Change Avatar</div>

            <div className="modal-divider">
              <div className="modal-divider-line" />
              <div className="modal-divider-text">Choose an emoji avatar</div>
              <div className="modal-divider-line" />
            </div>

            <div className="avatar-preset-grid">
              {EMOJI_AVATARS.map((emoji, i) => (
                <div
                  key={i}
                  className={`avatar-preset-fb ${selectedPreset === `emoji:${emoji}` ? "selected" : ""}`}
                  style={{
                    background: selectedPreset === `emoji:${emoji}`
                      ? "rgba(0,255,200,0.1)"
                      : `hsl(${i * 24}, 50%, 12%)`,
                    border: selectedPreset === `emoji:${emoji}`
                      ? "2px solid #00ffc8"
                      : "2px solid rgba(255,255,255,0.08)"
                  }}
                  onClick={() => setSelectedPreset(`emoji:${emoji}`)}
                >
                  {emoji}
                </div>
              ))}
            </div>

            {selectedPreset && !capturedImage && (
              <button className="modal-confirm-btn" onClick={saveEmojiAvatar} disabled={uploading}>
                {uploading ? "Saving..." : "✓ Use This Avatar"}
              </button>
            )}

            <div className="modal-divider">
              <div className="modal-divider-line" />
              <div className="modal-divider-text">Or upload your own photo</div>
              <div className="modal-divider-line" />
            </div>

            <div className="camera-section">
              <button className="modal-action-btn" onClick={() => fileRef.current?.click()}>
                📁 Upload from device
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden-upload" onChange={handleFileUpload} />

              <button className="modal-action-btn" onClick={startCamera}>
                📷 Take a selfie
              </button>

              {showCamera && !capturedImage && (
                <>
                  <video ref={videoRef} autoPlay playsInline className="camera-preview" />
                  <button className="modal-confirm-btn" onClick={capturePhoto}>● Capture Photo</button>
                </>
              )}

              {capturedImage && (
                <>
                  <img src={capturedImage} className="capture-preview" alt="preview" />
                  <button className="modal-confirm-btn" onClick={saveCapturedAvatar} disabled={uploading}>
                    {uploading ? "Uploading..." : "✓ Save This Photo"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}