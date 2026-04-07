import MatchScorer from "./MatchScorer";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import OverlayUI from "../components/OverlayUI";
import LiveStream from "../components/LiveStream";
import useMatchStore from "../store/matchStore";
import { supabase } from "../services/supabase";
import { useState } from "react";

function MatchScene({ matchData, onBack, onMatchComplete }) {
  const mountRef = useRef(null);
  const init = useMatchStore((s) => s.init);

  const [cameraOn, setCameraOn] = useState(false);

  // INIT TEAMS
  useEffect(() => {
    init(
      matchData?.teamA || "Team A",
      matchData?.teamB || "Team B"
    );
  }, []);

  // 🎮 THREE SCENE
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 30);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    camera.position.set(0, 6, 10);

    const court = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 7),
      new THREE.MeshStandardMaterial({ color: 0x050505 })
    );
    court.rotation.x = -Math.PI / 2;
    scene.add(court);

    const light = new THREE.PointLight(0x00ffe5, 2, 20);
    light.position.set(0, 8, 0);
    scene.add(light);

    const shuttle = new THREE.Mesh(
      new THREE.SphereGeometry(0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    scene.add(shuttle);

    let t = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      shuttle.position.x = -3 + t * 6;
      shuttle.position.y = Math.sin(t * Math.PI) * 3;

      t += 0.01;
      if (t > 1) t = 0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 🏆 UPDATE PLAYER STATS (CRITICAL LOGIC)
  async function updateLeaderboard(winnerId, loserId) {
    const { data: winner } = await supabase
      .from("players")
      .select("*")
      .eq("id", winnerId)
      .single();

    const { data: loser } = await supabase
      .from("players")
      .select("*")
      .eq("id", loserId)
      .single();

    if (!winner || !loser) return;

    await supabase.from("players").update({
      wins: (winner.wins || 0) + 1,
      elo: (winner.elo || 1500) + 25,
    }).eq("id", winnerId);

    await supabase.from("players").update({
      losses: (loser.losses || 0) + 1,
      elo: (loser.elo || 1500) - 15,
    }).eq("id", loserId);
  }

  // 🎯 HANDLE MATCH END
  async function handleMatchEnd(result) {
    // result = "A" or "B"
    const winnerId =
      result === "A" ? matchData.player1_id : matchData.player2_id;

    const loserId =
      result === "A" ? matchData.player2_id : matchData.player1_id;

    await updateLeaderboard(winnerId, loserId);

    onMatchComplete(result === "A" ? "win" : "loss");
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      
      {/* 🎮 BACKGROUND */}
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* UI */}
      <OverlayUI
        matchData={matchData}
        onBack={onBack}
        onMatchComplete={handleMatchEnd}
      />

      {/* 🎮 SCORER */}
      <MatchScorer
        matchData={matchData}
        onMatchEnd={handleMatchEnd}
      />

      {/* 🎥 CAMERA BUTTON */}
      <button
        onClick={() => setCameraOn(!cameraOn)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 999,
          background: "#111",
          color: "#00ffc8",
          padding: "10px 14px",
          border: "1px solid #00ffc8",
          cursor: "pointer"
        }}
      >
        {cameraOn ? "Stop Camera" : "Start Camera"}
      </button>

      {/* 🎥 FLOATING CAMERA */}
      {cameraOn && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 220,
            height: 140,
            border: "2px solid #00ffc8",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 999
          }}
        >
          <LiveStream />
        </div>
      )}

    </div>
  );
}

export default MatchScene;