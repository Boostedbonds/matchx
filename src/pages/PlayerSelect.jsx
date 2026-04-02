// src/pages/PlayerSelect.jsx
// Shown after RoleSelect (scorer only) — pick P1 and P2 before match starts.
// Fetches players from Supabase. Falls back to hardcoded list if offline.

import { useState, useEffect } from "react";
import { fetchPlayers } from "../services/supabase";

const FALLBACK_PLAYERS = [
  { id: null, name: "Rahul Sharma", init: "RS", club: "Eagles FC",   rating: 2104 },
  { id: null, name: "Arjun Mehta",  init: "AM", club: "Smash FC",    rating: 1980 },
  { id: null, name: "Priya Kapoor", init: "PK", club: "Rally Club",  rating: 1923 },
  { id: null, name: "Dev Patel",    init: "DP", club: "Court Kings", rating: 1847 },
  { id: null, name: "Sneha Rao",    init: "SR", club: "Smash FC",    rating: 1790 },
  { id: null, name: "Karan Tiwari", init: "KT", club: "Eagles FC",   rating: 1724 },
  { id: null, name: "Meera Singh",  init: "MS", club: "Net Ninjas",  rating: 1680 },
  { id: null, name: "Rohan Das",    init: "RD", club: "Court Kings", rating: 1635 },
];

export default function PlayerSelect({ onStart, onCancel }) {
  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [p1,       setP1]       = useState(null);
  const [p2,       setP2]       = useState(null);
  const [search,   setSearch]   = useState("");
  const [picking,  setPicking]  = useState("p1"); // which slot we are currently filling
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    fetchPlayers()
      .then(data => setPlayers(data && data.length ? data : FALLBACK_PLAYERS))
      .catch(() => setPlayers(FALLBACK_PLAYERS))
      .finally(() => { setLoading(false); setTimeout(() => setLoaded(true), 60); });
  }, []);

  const filtered = players.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.club || "").toLowerCase().includes(q)
    );
  });

  function selectPlayer(player) {
    if (picking === "p1") {
      setP1(player);
      // If p2 already set and it's the same player, clear p2
      if (p2?.id && p2.id === player.id) setP2(null);
      setPicking("p2");
      setSearch("");
    } else {
      if (p1?.id && p1.id === player.id) return; // can't pick same player twice
      setP2(player);
      setSearch("");
    }
  }

  function swap() {
    const tmp = p1;
    setP1(p2);
    setP2(tmp);
  }

  const canStart = p1 && p2;

  return (
    <div style={{ minHeight: "100vh", background: "#04060a", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ps-wrap {
          flex: 1; display: flex; flex-direction: column;
          max-width: 680px; width: 100%; margin: 0 auto;
          padding: 32px 20px 24px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ps-wrap.loaded { opacity: 1; transform: translateY(0); }

        /* ── Header ── */
        .ps-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 6px; color: #fff; margin-bottom: 24px; }
        .ps-logo span { color: #00ffc8; }

        .ps-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(28px,6vw,44px); letter-spacing: 3px; color: #fff; margin-bottom: 4px; }
        .ps-sub   { font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 28px; }

        /* ── Selected players row ── */
        .ps-selected {
          display: grid; grid-template-columns: 1fr 44px 1fr;
          gap: 10px; margin-bottom: 24px; align-items: center;
        }

        .ps-slot {
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.07);
          padding: 16px; min-height: 88px;
          display: flex; flex-direction: column; justify-content: center;
          cursor: pointer; transition: all 0.2s; position: relative;
        }

        .ps-slot.active {
          border-color: rgba(0,255,200,0.4);
          background: rgba(0,255,200,0.04);
          box-shadow: 0 0 0 1px rgba(0,255,200,0.2);
        }

        .ps-slot.filled { border-color: rgba(0,255,200,0.2); }
        .ps-slot:hover  { border-color: rgba(0,255,200,0.25); }

        .ps-slot-label {
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.25); margin-bottom: 8px;
        }

        .ps-slot-label.active { color: #00ffc8; }

        .ps-slot-player {
          display: flex; align-items: center; gap: 10px;
        }

        .ps-slot-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          color: #000; flex-shrink: 0;
        }

        .ps-slot-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #fff; line-height: 1; }
        .ps-slot-club { font-family: 'Rajdhani', sans-serif; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .ps-slot-elo  { font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: rgba(0,255,200,0.6); margin-top: 2px; }

        .ps-slot-empty {
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.2); letter-spacing: 1px;
        }

        .ps-slot-tap {
          position: absolute; bottom: 8px; right: 10px;
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          letter-spacing: 2px; color: rgba(0,255,200,0.4); text-transform: uppercase;
        }

        /* Swap button */
        .ps-swap {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4); cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          margin: 0 auto; transition: all 0.2s;
        }
        .ps-swap:hover { background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.3); color: #00ffc8; }
        .ps-swap:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── Picking label ── */
        .ps-picking-label {
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase;
          color: #00ffc8; margin-bottom: 12px;
        }

        /* ── Search ── */
        .ps-search {
          width: 100%; padding: 13px 16px;
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.08);
          color: #fff; font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: 1px;
          outline: none; transition: border 0.2s; margin-bottom: 12px;
        }
        .ps-search:focus { border-color: rgba(0,255,200,0.35); }
        .ps-search::placeholder { color: rgba(255,255,255,0.2); }

        /* ── Player list ── */
        .ps-list {
          flex: 1; overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.06);
          background: #0d0f15;
          max-height: 340px;
        }

        .ps-player-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer; transition: background 0.15s;
        }

        .ps-player-row:last-child { border-bottom: none; }

        .ps-player-row:hover:not(.disabled) { background: rgba(0,255,200,0.05); }

        .ps-player-row.disabled { opacity: 0.3; cursor: not-allowed; }

        .ps-player-row.selected-p1 { background: rgba(0,255,200,0.07); border-left: 3px solid #00ffc8; }
        .ps-player-row.selected-p2 { background: rgba(0,136,255,0.07); border-left: 3px solid #0088ff; }

        .ps-p-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 15px;
          color: #000; flex-shrink: 0;
        }

        .ps-p-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #fff; line-height: 1; }
        .ps-p-club { font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-top: 2px; }
        .ps-p-elo  { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #00ffc8; margin-left: auto; flex-shrink: 0; }

        .ps-p-tag {
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          padding: 3px 8px; flex-shrink: 0;
        }

        .ps-p-tag.p1 { background: rgba(0,255,200,0.1); color: #00ffc8; border: 1px solid rgba(0,255,200,0.25); }
        .ps-p-tag.p2 { background: rgba(0,136,255,0.1); color: #0088ff; border: 1px solid rgba(0,136,255,0.25); }

        /* ── Start button ── */
        .ps-actions { display: flex; gap: 10px; margin-top: 16px; }

        .ps-start {
          flex: 1; padding: 16px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif; font-size: 22px;
          letter-spacing: 4px; color: #000; transition: all 0.3s;
        }
        .ps-start:hover:not(:disabled) { background: #fff; box-shadow: 0 0 30px rgba(0,255,200,0.4); }
        .ps-start:disabled { opacity: 0.3; cursor: not-allowed; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }

        .ps-cancel {
          padding: 16px 24px; background: none;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .ps-cancel:hover { color: #fff; border-color: rgba(255,255,255,0.25); }

        .ps-empty {
          padding: 32px; text-align: center;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.2); letter-spacing: 2px;
        }

        /* ── Corner deco ── */
        .ps-corner { position: fixed; width: 44px; height: 44px; border-color: rgba(0,255,200,0.08); border-style: solid; z-index: 5; }
        .ps-tl { top: 18px; left: 18px; border-width: 1px 0 0 1px; }
        .ps-tr { top: 18px; right: 18px; border-width: 1px 1px 0 0; }
        .ps-bl { bottom: 18px; left: 18px; border-width: 0 0 1px 1px; }
        .ps-br { bottom: 18px; right: 18px; border-width: 0 1px 1px 0; }
      `}</style>

      <div className="ps-corner ps-tl"/>
      <div className="ps-corner ps-tr"/>
      <div className="ps-corner ps-bl"/>
      <div className="ps-corner ps-br"/>

      <div className={`ps-wrap ${loaded ? "loaded" : ""}`}>

        <div className="ps-logo">Match<span>X</span></div>
        <div className="ps-title">Select Players</div>
        <div className="ps-sub">Choose who is playing this match</div>

        {/* Selected players slots */}
        <div className="ps-selected">

          {/* P1 slot */}
          <div
            className={`ps-slot ${picking === "p1" ? "active" : ""} ${p1 ? "filled" : ""}`}
            onClick={() => { setPicking("p1"); setSearch(""); }}
          >
            <div className={`ps-slot-label ${picking === "p1" ? "active" : ""}`}>
              {picking === "p1" ? "▶ Selecting Player 1" : "Player 1"}
            </div>
            {p1 ? (
              <div className="ps-slot-player">
                <div className="ps-slot-avatar">{p1.init}</div>
                <div>
                  <div className="ps-slot-name">{p1.name}</div>
                  <div className="ps-slot-club">{p1.club}</div>
                  <div className="ps-slot-elo">ELO {p1.rating}</div>
                </div>
              </div>
            ) : (
              <div className="ps-slot-empty">Tap to select</div>
            )}
            {picking !== "p1" && <div className="ps-slot-tap">change</div>}
          </div>

          {/* Swap */}
          <button
            className="ps-swap"
            onClick={swap}
            disabled={!p1 || !p2}
            title="Swap players"
          >
            ⇄
          </button>

          {/* P2 slot */}
          <div
            className={`ps-slot ${picking === "p2" ? "active" : ""} ${p2 ? "filled" : ""}`}
            onClick={() => { setPicking("p2"); setSearch(""); }}
          >
            <div className={`ps-slot-label ${picking === "p2" ? "active" : ""}`}>
              {picking === "p2" ? "▶ Selecting Player 2" : "Player 2"}
            </div>
            {p2 ? (
              <div className="ps-slot-player">
                <div className="ps-slot-avatar" style={{ background: "linear-gradient(135deg,#0088ff,#00ffc8)" }}>{p2.init}</div>
                <div>
                  <div className="ps-slot-name">{p2.name}</div>
                  <div className="ps-slot-club">{p2.club}</div>
                  <div className="ps-slot-elo">ELO {p2.rating}</div>
                </div>
              </div>
            ) : (
              <div className="ps-slot-empty">Tap to select</div>
            )}
            {picking !== "p2" && p2 && <div className="ps-slot-tap">change</div>}
          </div>
        </div>

        {/* Picking label */}
        <div className="ps-picking-label">
          {picking === "p1" ? "🟢 Pick Player 1 from the list below" : "🔵 Pick Player 2 from the list below"}
        </div>

        {/* Search */}
        <input
          className="ps-search"
          placeholder="🔍  Search by name or club..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Player list */}
        <div className="ps-list">
          {loading && <div className="ps-empty">Loading players...</div>}
          {!loading && filtered.length === 0 && <div className="ps-empty">No players found.</div>}
          {!loading && filtered.map((player, i) => {
            const isP1       = p1?.name === player.name;
            const isP2       = p2?.name === player.name;
            const isDisabled = picking === "p2" && isP1;

            return (
              <div
                key={player.id || i}
                className={`ps-player-row ${isDisabled ? "disabled" : ""} ${isP1 ? "selected-p1" : ""} ${isP2 ? "selected-p2" : ""}`}
                onClick={() => !isDisabled && selectPlayer(player)}
              >
                <div className="ps-p-avatar">{player.init}</div>
                <div style={{ flex: 1 }}>
                  <div className="ps-p-name">{player.name}</div>
                  <div className="ps-p-club">{player.club}</div>
                </div>
                {isP1 && <div className="ps-p-tag p1">P1</div>}
                {isP2 && <div className="ps-p-tag p2">P2</div>}
                <div className="ps-p-elo">{player.rating}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="ps-actions">
          <button className="ps-cancel" onClick={onCancel}>← Back</button>
          <button
            className="ps-start"
            disabled={!canStart}
            onClick={() => onStart(p1, p2)}
          >
            {canStart
              ? `⚡ Start — ${p1.name.split(" ")[0]} vs ${p2.name.split(" ")[0]}`
              : "Select Both Players to Start"
            }
          </button>
        </div>

      </div>
    </div>
  );
}