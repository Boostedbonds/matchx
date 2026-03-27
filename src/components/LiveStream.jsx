import { useEffect, useRef } from "react";

function LiveStream() {
  const videoRef = useRef(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "200px",
        border: "2px solid #00ffe5",
      }}
    />
  );
}

export default LiveStream;