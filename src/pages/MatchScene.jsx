import { useEffect, useRef } from "react";
import * as THREE from "three";
import OverlayUI from "../components/OverlayUI";
import LiveStream from "../components/LiveStream";

function MatchScene({ matchData }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 30);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    camera.position.set(0, 6, 10);

    // COURT
    const court = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 7),
      new THREE.MeshStandardMaterial({ color: 0x050505 })
    );
    court.rotation.x = -Math.PI / 2;
    scene.add(court);

    // LIGHT
    const light = new THREE.PointLight(0x00ffe5, 2, 20);
    light.position.set(0, 8, 0);
    scene.add(light);

    // SHUTTLE
    const shuttle = new THREE.Mesh(
      new THREE.SphereGeometry(0.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    scene.add(shuttle);

    let t = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      shuttle.position.x = -3 + t * 6;
      shuttle.position.y = Math.sin(t * Math.PI) * 3;

      t += 0.01;
      if (t > 1) t = 0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} />
      <OverlayUI matchData={matchData} />
      <LiveStream />
    </div>
  );
}

export default MatchScene;