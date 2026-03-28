// src/hooks/useMatch.js
// Wraps Supabase real-time listeners into clean React state.
// Used by both MatchScorer (scorer writes) and SpectatorView (spectator reads).

import { useState, useEffect, useRef } from "react";
import {
  fetchMatch,
  fetchCommentary,
  fetchEvents,
  listenToMatch,
  listenToCommentary,
  unsubscribe,
} from "../utils/supabase";

// ─── useMatch ─────────────────────────────────────────────────────────────────
// matchId: string uuid from Supabase
// Returns { match, commentary, events, loading, error }

export function useMatch(matchId) {
  const [match,      setMatch]      = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const matchChannel      = useRef(null);
  const commentaryChannel = useRef(null);

  useEffect(() => {
    if (!matchId) return;

    setLoading(true);

    // ── Initial fetch ──────────────────────────────────────────────────────
    Promise.all([
      fetchMatch(matchId),
      fetchCommentary(matchId),
      fetchEvents(matchId),
    ])
      .then(([m, c, e]) => {
        setMatch(m);
        setCommentary(c);
        setEvents(e);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // ── Real-time: match state changes (scores, status, server) ───────────
    matchChannel.current = listenToMatch(matchId, (updated) => {
      setMatch(updated);
    });

    // ── Real-time: new commentary lines ───────────────────────────────────
    commentaryChannel.current = listenToCommentary(matchId, (line) => {
      setCommentary((prev) => [line, ...prev].slice(0, 50));
    });

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    return () => {
      unsubscribe(matchChannel.current);
      unsubscribe(commentaryChannel.current);
    };
  }, [matchId]);

  return { match, commentary, events, loading, error };
}

// ─── useLiveMatches ───────────────────────────────────────────────────────────
// For the spectator lobby / dashboard — shows all currently live matches.

import { useState as useStateAlias, useEffect as useEffectAlias, useRef as useRefAlias } from "react";
import { fetchLiveMatches, listenToLiveMatches, unsubscribe as unsub } from "../utils/supabase";

export function useLiveMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const channel               = useRef(null);

  useEffect(() => {
    fetchLiveMatches()
      .then((data) => { setMatches(data); setLoading(false); })
      .catch(() => setLoading(false));

    channel.current = listenToLiveMatches((data) => setMatches(data));

    return () => unsubscribe(channel.current);
  }, []);

  return { matches, loading };
}