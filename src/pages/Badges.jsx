import Sidebar from "../components/Sidebar";

const ALL_BADGES = [
  // Beginner
  { icon: "🏅", name: "First Blood", desc: "Win your first match", req: "1 win", pointsReq: 0, winsReq: 1, tier: "bronze" },
  { icon: "🎯", name: "On Target", desc: "Win 3 matches", req: "3 wins", pointsReq: 0, winsReq: 3, tier: "bronze" },
  { icon: "💪", name: "Grinder", desc: "Play 10 matches", req: "10 matches played", pointsReq: 0, winsReq: 0, matchesReq: 10, tier: "bronze" },

  // Intermediate
  { icon: "🔥", name: "Hot Streak", desc: "Win 3 in a row", req: "3-win streak", pointsReq: 0, streakReq: 3, tier: "silver" },
  { icon: "⚡", name: "Speed Demon", desc: "Win 10 matches", req: "10 wins", pointsReq: 0, winsReq: 10, tier: "silver" },
  { icon: "🎖️", name: "Veteran", desc: "Earn 1,000 points", req: "1,000 pts", pointsReq: 1000, tier: "silver" },
  { icon: "🤝", name: "Team Player", desc: "Win 5 doubles matches", req: "5 doubles wins", pointsReq: 0, winsReq: 5, tier: "silver" },

  // Advanced
  { icon: "🎯", name: "Sharpshooter", desc: "Win 25 matches", req: "25 wins", pointsReq: 0, winsReq: 25, tier: "gold" },
  { icon: "🛡️", name: "Iron Wall", desc: "Earn 2,500 points", req: "2,500 pts", pointsReq: 2500, tier: "gold" },
  { icon: "🏆", name: "Champion", desc: "Win a tournament", req: "Tournament win", pointsReq: 0, winsReq: 1, tier: "gold" },
  { icon: "🔥", name: "Inferno", desc: "Win 5 in a row", req: "5-win streak", pointsReq: 0, streakReq: 5, tier: "gold" },

  // Elite
  { icon: "👑", name: "Top 10", desc: "Reach global rank #10", req: "Rank ≤ 10", pointsReq: 0, rankReq: 10, tier: "platinum" },
  { icon: "🌟", name: "Rising Star", desc: "Earn 5,000 points", req: "5,000 pts", pointsReq: 5000, tier: "platinum" },
  { icon: "💎", name: "Diamond", desc: "Reach 2000 ELO", req: "2000 ELO rating", pointsReq: 0, ratingReq: 2000, tier: "platinum" },
  { icon: "🚀", name: "Legend", desc: "Win 50 matches", req: "50 wins", pointsReq: 0, winsReq: 50, tier: "platinum" },
];

const TIER_COLORS = {
  bronze: { color: "#cd7f32", bg: "rgba(205,127,50,0.08)", border: "rgba(205,127,50,0.25)" },
  silver: { color: "#aaa", bg: "rgba(170,170,170,0.08)", border: "rgba(170,170,170,0.2)" },
  gold: { color: "#ffb800", bg: "rgba(255,184,0,0.08)", border: "rgba(255,184,0,0.25)" },
  platinum: { color: "#00ffc8", bg: "rgba(0,255,200,0.08)", border: "rgba(0,255,200,0.25)" },
};

function isUnlocked(badge, user) {
  if (badge.winsReq && user.wins < badge.winsReq) return false;
  if (badge.pointsReq && user.points < badge.pointsReq) return false;
  if (badge.streakReq && user.streak < badge.streakReq) return false;
  if (badge.ratingReq && user.rating < badge.ratingReq) return false;
  if (badge.rankReq && user.rank > badge.rankReq) return false;
  return true;
}

function getProgress(badge, user) {
  if (badge.pointsReq) return { val: user.points, max: badge.pointsReq, label: `${user.points.toLocaleString()} / ${badge.pointsReq.toLocaleString()} pts` };
  if (badge.winsReq) return { val: user.wins, max: badge.winsReq, label: `${user.wins} / ${badge.winsReq} wins` };
  if (badge.streakReq) return { val: user.streak, max: badge.streakReq, label: `${user.streak} / ${badge.streakReq} streak` };
  if (badge.ratingReq) return { val: user.rating, max: badge.ratingReq, label: `${user.rating} / ${badge.ratingReq} ELO` };
  if (badge.rankReq) return { val: Math.max(0, badge.rankReq - user.rank + badge.rankReq), max: badge.rankReq * 2, label: `Rank #${user.rank}` };
  return null;
}

function Badges({ user, onNav, onLogout }) {
  const tiers = ["bronze", "silver", "gold", "platinum"];
  const unlocked = ALL_BADGES.filter(b => isUnlocked(b, user));

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        .main { margin-left: 220px; flex: 1; padding: 32px; overflow-y: auto; }

        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 44px; letter-spacing: 4px; color: #fff; margin-bottom: 4px;
        }

        .page-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; letter-spacing: 3px; color: rgba(255,255,255,0.25);
          text-transform: uppercase; margin-bottom: 32px;
        }

        .progress-summary {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 32px;
        }

        .tier-summary {
          padding: 18px 20px;
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }

        .tier-summary::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--tc);
        }

        .tier-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--tc); margin-bottom: 6px;
        }

        .tier-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 34px; color: #fff; line-height: 1;
        }

        .tier-total {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px;
        }

        .tier-section { margin-bottom: 36px; }

        .tier-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .tier-icon { font-size: 20px; }

        .tier-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 3px;
        }

        .tier-bar {
          flex: 1; height: 3px; background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }

        .tier-bar-fill { height: 100%; border-radius: 2px; }

        .badges-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }

        .badge-card {
          padding: 20px 16px; text-align: center;
          border: 1px solid;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }

        .badge-card.locked {
          filter: grayscale(1);
          opacity: 0.35;
        }

        .badge-card.unlocked:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .badge-card-icon { font-size: 36px; margin-bottom: 10px; }

        .badge-card-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 2px; margin-bottom: 4px;
        }

        .badge-card-desc {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px; margin-bottom: 12px;
        }

        .badge-req {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 2px; font-weight: 700;
          text-transform: uppercase; padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          display: inline-block; margin-bottom: 10px;
        }

        .badge-progress-bar {
          height: 4px; background: rgba(255,255,255,0.08);
          border-radius: 2px; overflow: hidden;
        }

        .badge-progress-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }

        .badge-progress-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; color: rgba(255,255,255,0.3);
          margin-top: 5px; letter-spacing: 1px;
        }

        .unlocked-stamp {
          position: absolute; top: 8px; right: 8px;
          font-size: 10px; font-family: 'Rajdhani', sans-serif;
          font-weight: 700; letter-spacing: 1px;
          color: #00ff64; background: rgba(0,255,100,0.1);
          border: 1px solid rgba(0,255,100,0.2);
          padding: 2px 7px;
        }
      `}</style>

      <Sidebar active="badges" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        <div className="page-title">🎖️ Badges</div>
        <div className="page-sub">{unlocked.length} / {ALL_BADGES.length} Unlocked · Keep playing to earn more</div>

        {/* Tier Summary */}
        <div className="progress-summary">
          {tiers.map(tier => {
            const tc = TIER_COLORS[tier];
            const total = ALL_BADGES.filter(b => b.tier === tier);
            const done = total.filter(b => isUnlocked(b, user));
            return (
              <div className="tier-summary" key={tier} style={{ "--tc": tc.color }}>
                <div className="tier-name">{tier}</div>
                <div className="tier-count">{done.length}<span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>/{total.length}</span></div>
                <div className="tier-total">{Math.round((done.length / total.length) * 100)}% complete</div>
              </div>
            );
          })}
        </div>

        {/* Badges by Tier */}
        {tiers.map(tier => {
          const tc = TIER_COLORS[tier];
          const tierBadges = ALL_BADGES.filter(b => b.tier === tier);
          const done = tierBadges.filter(b => isUnlocked(b, user));

          return (
            <div className="tier-section" key={tier}>
              <div className="tier-header">
                <div className="tier-label" style={{ color: tc.color, textTransform: "capitalize" }}>{tier}</div>
                <div className="tier-bar">
                  <div className="tier-bar-fill" style={{ width: `${(done.length / tierBadges.length) * 100}%`, background: tc.color }} />
                </div>
                <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: tc.color, letterSpacing: 1 }}>{done.length}/{tierBadges.length}</div>
              </div>

              <div className="badges-grid">
                {tierBadges.map((b, i) => {
                  const unlocked = isUnlocked(b, user);
                  const prog = getProgress(b, user);
                  return (
                    <div
                      key={i}
                      className={`badge-card ${unlocked ? "unlocked" : "locked"}`}
                      style={{ background: unlocked ? tc.bg : "rgba(255,255,255,0.02)", borderColor: unlocked ? tc.border : "rgba(255,255,255,0.06)" }}
                    >
                      {unlocked && <div className="unlocked-stamp">✓ Unlocked</div>}
                      <div className="badge-card-icon">{b.icon}</div>
                      <div className="badge-card-name" style={{ color: unlocked ? tc.color : "rgba(255,255,255,0.4)" }}>{b.name}</div>
                      <div className="badge-card-desc">{b.desc}</div>
                      <div className="badge-req">{b.req}</div>
                      {!unlocked && prog && (
                        <>
                          <div className="badge-progress-bar">
                            <div className="badge-progress-fill" style={{ width: `${Math.min(100, (prog.val / prog.max) * 100)}%`, background: tc.color }} />
                          </div>
                          <div className="badge-progress-label">{prog.label}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Badges;