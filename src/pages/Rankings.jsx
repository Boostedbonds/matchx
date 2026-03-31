import { useState } from "react";
import Sidebar from "../components/Sidebar";

const PLAYERS = [
  { name: "Rahul Sharma", club: "Eagles FC", rating: 2104, wins: 48, losses: 6, points: 8920, init: "RS", trend: "+12" },
  { name: "Arjun Mehta", club: "Smash FC", rating: 1980, wins: 41, losses: 9, points: 7840, init: "AM", trend: "+5" },
  { name: "Priya Kapoor", club: "Rally Club", rating: 1923, wins: 38, losses: 11, points: 7210, init: "PK", trend: "-3" },
  { name: "Dev Patel", club: "Court Kings", rating: 1847, wins: 34, losses: 8, points: 6540, init: "DP", trend: "+8" },
  { name: "Sneha Rao", club: "Smash FC", rating: 1790, wins: 30, losses: 14, points: 5980, init: "SR", trend: "+2" },
  { name: "Karan Tiwari", club: "Eagles FC", rating: 1724, wins: 27, losses: 17, points: 5320, init: "KT", trend: "-1" },
  { name: "Meera Singh", club: "Net Ninjas", rating: 1680, wins: 25, losses: 19, points: 4800, init: "MS", trend: "+15" },
  { name: "Rohan Das", club: "Court Kings", rating: 1635, wins: 22, losses: 20, points: 4350, init: "RD", trend: "-4" },
];

function Rankings({ onNav, onLogout, user }) {
  const [category, setCategory] = useState("singles");

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sidebar-wrapper { flex-shrink: 0; }

        .main { margin-left: 240px; flex: 1; width: calc(100% - 240px); padding: 32px; }

        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
          .main { margin-left: 0 !important; width: 100% !important; padding: 20px 16px 80px; }
          .cat-tabs { flex-wrap: wrap !important; }
          .cat-tab { flex: 1 1 calc(50% - 8px) !important; text-align: center; }
          .table-header { display: none !important; }
          .player-row {
            grid-template-columns: 40px 1fr 80px 60px !important;
          }
          .num-col.losses-col, .points-col, .trend-col { display: none !important; }
        }

        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 4px; color: #fff; margin-bottom: 8px; }
        .page-sub { font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 32px; }

        .cat-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .cat-tab { padding: 10px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); cursor: pointer; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s; }
        .cat-tab.active { background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.3); color: #00ffc8; }
        .cat-tab:hover:not(.active) { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.15); }

        .table-header { display: grid; grid-template-columns: 60px 1fr 120px 80px 80px 100px 80px; gap: 0; padding: 12px 20px; font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); }

        .player-row { display: grid; grid-template-columns: 60px 1fr 120px 80px 80px 100px 80px; gap: 0; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: background 0.2s; cursor: pointer; }
        .player-row:hover { background: rgba(255,255,255,0.02); }
        .player-row.top3 { background: rgba(0,255,200,0.02); }

        .rank-col { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: rgba(255,255,255,0.2); }
        .rank-col.gold { color: #ffb800; text-shadow: 0 0 15px rgba(255,184,0,0.4); }
        .rank-col.silver { color: #aaa; }
        .rank-col.bronze { color: #cd7f32; }

        .player-col { display: flex; align-items: center; gap: 14px; }
        .p-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #00ffc8, #0088ff); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: #000; flex-shrink: 0; }
        .p-name { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #fff; }
        .p-club { font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }

        .rating-col { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #00ffc8; letter-spacing: 1px; }
        .num-col { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.6); }
        .points-col { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #ffb800; }
        .trend-col { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; }
        .trend-up { color: #00ff64; }
        .trend-down { color: #ff3250; }
      `}</style>

      <div className="sidebar-wrapper">
        <Sidebar active="rankings" user={user} onNav={onNav} onLogout={onLogout} />
      </div>

      <div className="main">
        <div className="page-title">🏅 Rankings</div>
        <div className="page-sub">Global Leaderboard · Season 2026</div>

        <div className="cat-tabs">
          {["singles", "doubles", "mixed", "team"].map(c => (
            <button key={c} className={`cat-tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div style={{ background: "#0d0f15", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="table-header">
            <div>Rank</div><div>Player</div><div>Rating</div><div>Wins</div><div>Losses</div><div>Points</div><div>Trend</div>
          </div>
          {PLAYERS.map((p, i) => (
            <div key={i} className={`player-row ${i < 3 ? "top3" : ""}`}>
              <div className={`rank-col ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </div>
              <div className="player-col">
                <div className="p-avatar">{p.init}</div>
                <div><div className="p-name">{p.name}</div><div className="p-club">{p.club}</div></div>
              </div>
              <div className="rating-col">{p.rating}</div>
              <div className="num-col" style={{ color: "#00ff64" }}>{p.wins}</div>
              <div className="num-col losses-col" style={{ color: "#ff3250" }}>{p.losses}</div>
              <div className="points-col">{p.points.toLocaleString()}</div>
              <div className={`trend-col ${p.trend.startsWith("+") ? "trend-up" : "trend-down"}`}>
                {p.trend.startsWith("+") ? "▲" : "▼"} {p.trend.replace(/[+-]/, "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rankings;