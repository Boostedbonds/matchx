import { useState } from "react";
import Sidebar from "../components/Sidebar";

const ONLINE_PLAYERS = [
  { name: "Rahul Sharma", init: "RS", club: "Eagles FC", rating: 2104, status: "online", playing: false },
  { name: "Arjun Mehta",  init: "AM", club: "Smash FC",  rating: 1980, status: "online", playing: true  },
  { name: "Priya Kapoor", init: "PK", club: "Rally Club", rating: 1923, status: "online", playing: false },
  { name: "Dev Patel",    init: "DP", club: "Court Kings", rating: 1847, status: "online", playing: false },
  { name: "Sneha Rao",    init: "SR", club: "Smash FC",  rating: 1790, status: "away",   playing: false },
  { name: "Karan Tiwari", init: "KT", club: "Eagles FC", rating: 1724, status: "online", playing: true  },
];

function Dashboard({ user, onNav, onLogout, liveMatch, onWatchLive }) {
  const [statTab, setStatTab] = useState("performance");

  const w = user?.wins || 0;
  const l = user?.losses || 0;
  const total = w + l;
  const wr = user?.winRate || 0;
  const pts = user?.points || 0;
  const rating = user?.rating || 0;
  const streak = user?.streak || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .main { margin-left: 220px; flex: 1; padding: 32px; overflow-y: auto; min-height: 100vh; }

        @media (max-width: 768px) {
          .main { margin-left: 0; padding: 20px 16px 80px; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .quick-actions { grid-template-columns: 1fr 1fr 1fr !important; }
          .page-title { font-size: 32px !important; }
          .top-bar { flex-wrap: wrap; gap: 10px; }
        }

        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }

        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 44px; letter-spacing: 4px; color: #fff; }

        .live-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,50,80,0.1); border: 1px solid rgba(255,50,80,0.3);
          padding: 8px 16px; font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 3px; color: #ff3250; text-transform: uppercase;
        }

        .live-dot { width: 8px; height: 8px; background: #ff3250; border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }

        .stat-card {
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.06);
          padding: 20px; position: relative; overflow: hidden; transition: all 0.3s;
        }
        .stat-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--accent,#00ffc8); }
        .stat-card:hover { border-color: rgba(0,255,200,0.2); transform: translateY(-2px); }

        .stat-label { font-family:'Rajdhani',sans-serif; font-size:10px; letter-spacing:3px; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-bottom:8px; }
        .stat-value { font-family:'Bebas Neue',sans-serif; font-size:38px; line-height:1; color:var(--accent,#00ffc8); }
        .stat-sub   { font-family:'Rajdhani',sans-serif; font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px; }

        .win-rate-bar  { height:4px; background:rgba(255,255,255,0.06); border-radius:2px; margin-top:8px; overflow:hidden; }
        .win-rate-fill { height:100%; background:linear-gradient(90deg,#00ffc8,#0088ff); border-radius:2px; }

        .content-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; }

        .card { background:#0d0f15; border:1px solid rgba(255,255,255,0.06); padding:22px; margin-bottom:20px; }
        .card:last-child { margin-bottom:0; }

        .card-title {
          font-family:'Rajdhani',sans-serif; font-size:10px; letter-spacing:3px;
          color:rgba(255,255,255,0.3); text-transform:uppercase;
          margin-bottom:16px; padding-bottom:12px;
          border-bottom:1px solid rgba(255,255,255,0.05);
          display:flex; justify-content:space-between; align-items:center;
        }
        .card-title-action { font-size:10px; letter-spacing:2px; color:#00ffc8; cursor:pointer; }

        .match-item { display:flex; align-items:center; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04); gap:14px; }
        .match-item:last-child { border-bottom:none; }
        .match-teams { flex:1; font-family:'Rajdhani',sans-serif; }
        .match-vs   { font-size:14px; font-weight:700; color:#fff; margin-bottom:3px; }
        .match-meta { font-size:11px; letter-spacing:1px; color:rgba(255,255,255,0.3); }
        .match-score { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; color:#00ffc8; }
        .match-badge { font-family:'Rajdhani',sans-serif; font-size:10px; letter-spacing:2px; padding:3px 9px; font-weight:700; text-transform:uppercase; }
        .badge-win  { background:rgba(0,255,100,0.1); color:#00ff64; border:1px solid rgba(0,255,100,0.2); }
        .badge-loss { background:rgba(255,50,80,0.1); color:#ff3250; border:1px solid rgba(255,50,80,0.2); }
        .badge-live { background:rgba(255,50,80,0.15); color:#ff3250; border:1px solid rgba(255,50,80,0.3); animation:blink 1s infinite; }

        .start-match-btn {
          width:100%; padding:16px; background:#00ffc8; border:none; cursor:pointer;
          font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:4px; color:#000;
          transition:all 0.3s; margin-top:14px;
        }
        .start-match-btn:hover { background:#fff; box-shadow:0 0 40px rgba(0,255,200,0.5); }

        /* ── STATS SECTION ── */
        .stat-tabs { display:flex; gap:0; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .stat-tab {
          font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:2px;
          font-weight:700; text-transform:uppercase; padding:10px 18px;
          cursor:pointer; color:rgba(255,255,255,0.3);
          border-bottom:2px solid transparent; transition:all 0.2s;
        }
        .stat-tab:hover { color:rgba(255,255,255,0.7); }
        .stat-tab.active { color:#00ffc8; border-bottom-color:#00ffc8; }

        .stat-row-item {
          display:flex; justify-content:space-between; align-items:center;
          padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .stat-row-item:last-child { border-bottom:none; }
        .sri-label { font-family:'Rajdhani',sans-serif; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.35); }
        .sri-val   { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:1px; }

        .bar-row { margin-bottom:16px; }
        .bar-header { display:flex; justify-content:space-between; margin-bottom:6px; }
        .bar-label { font-family:'Rajdhani',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.3); }
        .bar-val   { font-family:'Bebas Neue',sans-serif; font-size:18px; }
        .bar-track { height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
        .bar-fill  { height:100%; border-radius:3px; transition:width 1s ease; }

        .two-col-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .mini-stat {
          background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);
          padding:14px; text-align:center;
        }
        .mini-stat-val   { font-family:'Bebas Neue',sans-serif; font-size:28px; line-height:1; }
        .mini-stat-label { font-family:'Rajdhani',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.25); margin-top:4px; }

        /* Quick actions */
        .quick-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .action-btn {
          padding:16px 12px; background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.08);
          cursor:pointer; text-align:center; transition:all 0.2s; color:#fff;
          font-family:'Rajdhani',sans-serif;
        }
        .action-btn:hover { background:rgba(0,255,200,0.06); border-color:rgba(0,255,200,0.25); transform:translateY(-2px); }
        .action-icon  { font-size:22px; margin-bottom:6px; }
        .action-label { font-size:11px; letter-spacing:2px; font-weight:700; text-transform:uppercase; color:rgba(255,255,255,0.6); }

        .op-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#00ffc8,#0088ff); display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:11px; color:#000; position:relative; flex-shrink:0; }
        .status-dot { position:absolute; bottom:0; right:0; width:8px; height:8px; border-radius:50%; border:2px solid #0d0f15; }
        .status-dot.online  { background:#00ff64; }
        .status-dot.away    { background:#ffb800; }
        .status-dot.playing { background:#ff3250; animation:blink 1s infinite; }

        .live-watch-banner {
          background:rgba(255,50,80,0.08); border:1px solid rgba(255,50,80,0.25);
          padding:16px 20px; margin-bottom:20px; cursor:pointer;
          display:flex; align-items:center; justify-content:space-between; transition:all 0.2s;
        }
        .live-watch-banner:hover { border-color:rgba(255,50,80,0.5); background:rgba(255,50,80,0.12); }
      `}</style>

      <Sidebar active="dashboard" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        <div className="top-bar">
          <h2 className="page-title">Dashboard</h2>
          <div className="live-badge">
            <div className="live-dot" />
            {ONLINE_PLAYERS.filter(p => p.playing).length} Live Matches
          </div>
        </div>

        {liveMatch && (
          <div className="live-watch-banner" onClick={onWatchLive}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:2, color:"#fff", marginBottom:4 }}>
                🔴 Live — {liveMatch.player1?.name} vs {liveMatch.player2?.name}
              </div>
              <div style={{ fontFamily:"Rajdhani", fontSize:11, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>
                Game {liveMatch.currentGame} · Tap to watch
              </div>
            </div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:44, color:"#ff3250", letterSpacing:4 }}>
              {liveMatch.scores?.[liveMatch.currentGame-1]?.p1} – {liveMatch.scores?.[liveMatch.currentGame-1]?.p2}
            </div>
          </div>
        )}

        {/* Top stat cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{"--accent":"#00ffc8"}}>
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{wr}%</div>
            <div className="win-rate-bar"><div className="win-rate-fill" style={{width:`${wr}%`}} /></div>
          </div>
          <div className="stat-card" style={{"--accent":"#0088ff"}}>
            <div className="stat-label">ELO Rating</div>
            <div className="stat-value">{rating}</div>
            <div className="stat-sub">+47 this month</div>
          </div>
          <div className="stat-card" style={{"--accent":"#ff3250"}}>
            <div className="stat-label">Win Streak</div>
            <div className="stat-value">{streak}🔥</div>
            <div className="stat-sub">Personal best: 8</div>
          </div>
          <div className="stat-card" style={{"--accent":"#ffb800"}}>
            <div className="stat-label">Points</div>
            <div className="stat-value">{pts.toLocaleString()}</div>
            <div className="stat-sub">Season total</div>
          </div>
        </div>

        <div className="content-grid">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* ── STATS SECTION ── */}
            <div className="card">
              <div className="card-title">My Stats</div>

              {/* Sub tabs */}
              <div className="stat-tabs">
                {["performance","game types","season"].map(t => (
                  <div key={t} className={`stat-tab ${statTab===t?"active":""}`} onClick={() => setStatTab(t)}>{t}</div>
                ))}
              </div>

              {statTab === "performance" && (
                <>
                  <div className="two-col-stats" style={{marginBottom:16}}>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#00ff64"}}>{w}</div><div className="mini-stat-label">Wins</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#ff3250"}}>{l}</div><div className="mini-stat-label">Losses</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#00ffc8"}}>{total}</div><div className="mini-stat-label">Matches</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#ffb800"}}>{streak}🔥</div><div className="mini-stat-label">Streak</div></div>
                  </div>
                  {[
                    { label:"Win Rate",   val:wr,     max:100,  color:"#00ffc8", display:`${wr}%` },
                    { label:"ELO Rating", val:rating, max:3000, color:"#0088ff", display:rating },
                    { label:"Points",     val:pts,    max:5000, color:"#ffb800", display:pts.toLocaleString() },
                  ].map((b,i) => (
                    <div className="bar-row" key={i}>
                      <div className="bar-header">
                        <div className="bar-label">{b.label}</div>
                        <div className="bar-val" style={{color:b.color}}>{b.display}</div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${Math.min(100,(b.val/b.max)*100)}%`, background:b.color}} />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {statTab === "game types" && (
                <>
                  {[
                    { label:"Singles",       w:0, l:0, color:"#00ffc8" },
                    { label:"Doubles",       w:0, l:0, color:"#0088ff" },
                    { label:"Mixed Doubles", w:0, l:0, color:"#ffb800" },
                    { label:"Team",          w:0, l:0, color:"#ff3250" },
                  ].map((g,i) => {
                    const gt = g.w + g.l || 1;
                    const gwr = Math.round((g.w/gt)*100);
                    return (
                      <div key={i} className="bar-row">
                        <div className="bar-header">
                          <div className="bar-label">{g.label}</div>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontFamily:"'Rajdhani'",fontSize:11,color:"#00ff64",letterSpacing:1}}>{g.w}W</span>
                            <span style={{fontFamily:"'Rajdhani'",fontSize:11,color:"#ff3250",letterSpacing:1}}>{g.l}L</span>
                            <div className="bar-val" style={{color:g.color}}>{gwr}%</div>
                          </div>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{width:`${gwr}%`,background:g.color}} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="stat-row-item" style={{marginTop:8}}>
                    <div className="sri-label">Best Format</div>
                    <div className="sri-val" style={{color:"#00ffc8"}}>—</div>
                  </div>
                  <div className="stat-row-item">
                    <div className="sri-label">Best Partner</div>
                    <div className="sri-val" style={{color:"#ffb800"}}>—</div>
                  </div>
                </>
              )}

              {statTab === "season" && (
                <>
                  {[
                    { label:"Season Points", val:pts,  max:5000, color:"#00ffc8", display:pts.toLocaleString() },
                    { label:"ELO Gained",    val:0,    max:1000, color:"#0088ff", display:"+0" },
                    { label:"Rank Progress", val:1,    max:100,  color:"#ffb800", display:`#${user?.rank || 99}` },
                    { label:"Tournaments",   val:0,    max:10,   color:"#ff3250", display:"0 played" },
                  ].map((b,i) => (
                    <div className="bar-row" key={i}>
                      <div className="bar-header">
                        <div className="bar-label">{b.label}</div>
                        <div className="bar-val" style={{color:b.color}}>{b.display}</div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${Math.min(100,(b.val/b.max)*100)}%`,background:b.color}} />
                      </div>
                    </div>
                  ))}
                  <div className="two-col-stats" style={{marginTop:8}}>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#00ffc8"}}>S4</div><div className="mini-stat-label">Season</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#ffb800"}}>Apr</div><div className="mini-stat-label">Ends</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#00ff64"}}>#{user?.rank||99}</div><div className="mini-stat-label">Rank</div></div>
                    <div className="mini-stat"><div className="mini-stat-val" style={{color:"#ff3250"}}>{wr}%</div><div className="mini-stat-label">Win Rate</div></div>
                  </div>
                </>
              )}
            </div>

            {/* Recent Matches */}
            <div className="card">
              <div className="card-title">
                Recent Matches
                <span className="card-title-action" onClick={() => onNav("profile")}>View All →</span>
              </div>
              {[
                { vs:"Rahul S. vs Arjun M.",    score:"21–15, 21–18",        result:"win",  time:"Today, 4:30 PM", type:"Singles" },
                { vs:"Priya K. vs Sneha R.",    score:"18–21, 21–19, 21–15", result:"live", time:"Live Now",       type:"Doubles" },
                { vs:"Dev P. vs Karan T.",      score:"21–17, 19–21, 21–23", result:"loss", time:"Yesterday",     type:"Singles" },
                { vs:"Team Alpha vs Team Beta", score:"2–1",                 result:"win",  time:"2 days ago",    type:"Team" },
              ].map((m,i) => (
                <div className="match-item" key={i}>
                  <div className="match-teams">
                    <div className="match-vs">{m.vs}</div>
                    <div className="match-meta">{m.type} · {m.time}</div>
                  </div>
                  <div className="match-score">{m.score}</div>
                  <div className={`match-badge badge-${m.result}`}>{m.result==="live" ? "● Live" : m.result}</div>
                </div>
              ))}
              <button className="start-match-btn" onClick={() => onNav("setup")}>+ Start New Match</button>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>
            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div className="quick-actions">
                {[
                  { icon:"🏸", label:"New Match",  nav:"setup" },
                  { icon:"🏆", label:"Tournament", nav:"tournament" },
                  { icon:"📡", label:"Watch Live", nav:"spectator" },
                  { icon:"📊", label:"Rankings",   nav:"rankings" },
                  { icon:"🎖️", label:"Badges",    nav:"badges" },
                  { icon:"👥", label:"Players",    nav:"players" },
                ].map((a,i) => (
                  <div key={i} className="action-btn" onClick={() => a.nav && onNav(a.nav)}>
                    <div className="action-icon">{a.icon}</div>
                    <div className="action-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                Top Players
                <span className="card-title-action" onClick={() => onNav("rankings")}>Full →</span>
              </div>
              {ONLINE_PLAYERS.slice(0,4).map((p,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:i<3?"#00ffc8":"rgba(255,255,255,0.2)",width:24,textAlign:"center"}}>{i+1}</div>
                  <div className="op-avatar">
                    {p.init}
                    <div className={`status-dot ${p.playing?"playing":p.status}`} />
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Rajdhani'",fontSize:13,fontWeight:700,color:"#fff"}}>{p.name}</div>
                    <div style={{fontFamily:"'Rajdhani'",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:1}}>{p.club}</div>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#00ffc8"}}>{p.rating}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{background:"linear-gradient(135deg,rgba(0,255,200,0.06),rgba(0,136,255,0.06))",border:"1px solid rgba(0,255,200,0.15)"}}>
              <div className="card-title" style={{color:"#00ffc8",borderColor:"rgba(0,255,200,0.1)"}}>🎖️ Next Badge</div>
              <div style={{textAlign:"center",padding:"8px 0"}}>
                <div style={{fontSize:40,marginBottom:8}}>🌟</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"#fff",letterSpacing:2,marginBottom:4}}>Rising Star</div>
                <div style={{fontFamily:"'Rajdhani'",fontSize:12,color:"rgba(255,255,255,0.4)",letterSpacing:1,marginBottom:14}}>Reach 5,000 points</div>
                <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,(pts/5000)*100)}%`,background:"linear-gradient(90deg,#00ffc8,#0088ff)",borderRadius:3,transition:"width 1s ease"}} />
                </div>
                <div style={{fontFamily:"'Rajdhani'",fontSize:11,color:"#00ffc8",marginTop:6,letterSpacing:1}}>
                  {pts.toLocaleString()} / 5,000 pts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;