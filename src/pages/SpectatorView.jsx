/**
 * SpectatorView.jsx
 * src/pages/SpectatorView.jsx
 *
 * Lightweight read-only match view. Reuses MatchScorer with role="spectator".
 */

import MatchScorer from "./MatchScorer";

export default function SpectatorView({ matchData, onBack, onNav, onLogout }) {
  return (
    <MatchScorer
      matchData={matchData}
      role="spectator"
      onNav={onNav}
      onLogout={onLogout}
      onMatchEnd={onBack}
    />
  );
}