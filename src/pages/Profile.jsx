import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/supabase";
import Cropper from "react-easy-crop";

function Profile({ user, onNav, onLogout }) {
  const [playerData, setPlayerData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);

  const [uploading, setUploading] = useState(false);

  // camera + crop
  const [showCamera, setShowCamera] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    fetchPlayer();
    fetchHistory();
  }, [user]);

  // 🔥 GET OR CREATE PLAYER (AUTH BASED)
  async function fetchPlayer() {
    let { data } = await supabase
      .from("players")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    // create player if first time
    if (!data) {
      const { data: newPlayer } = await supabase
        .from("players")
        .insert({
          name: user.email.split("@")[0],
          auth_id: user.id,
          elo: 1500,
          wins: 0,
          losses: 0,
          avatar_url: null
        })
        .select()
        .single();

      setPlayerData(newPlayer);
    } else {
      setPlayerData(data);
    }
  }

  async function fetchHistory() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${playerData?.id},player2_id.eq.${playerData?.id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    setMatchHistory(data || []);
  }

  // 🎥 OPEN CAMERA
  async function startCamera() {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  }

  // 📸 CAPTURE
  function capturePhoto() {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    setImageSrc(canvas.toDataURL("image/png"));

    video.srcObject.getTracks().forEach(t => t.stop());
  }

  const onCropComplete = (_, pixels) => {
    setCroppedAreaPixels(pixels);
  };

  async function getCroppedImage() {
    const image = new Image();
    image.src = imageSrc;

    await new Promise(r => (image.onload = r));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise(resolve =>
      canvas.toBlob(blob => resolve(blob), "image/png")
    );
  }

  // 🔥 UPLOAD AVATAR (ONLY OWNER)
  async function uploadCropped() {
    if (!playerData || playerData.auth_id !== user.id) return;

    const blob = await getCroppedImage();
    setUploading(true);

    const path = `players/${playerData.id}_${Date.now()}.png`;

    await supabase.storage.from("avatars").upload(path, blob, {
      upsert: true
    });

    const publicUrl =
      supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;

    await supabase
      .from("players")
      .update({ avatar_url: publicUrl })
      .eq("id", playerData.id);

    setUploading(false);
    setShowCamera(false);
    setImageSrc(null);

    fetchPlayer();
  }

  const isOwner = playerData?.auth_id === user.id;

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <Sidebar active="profile" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">

        {/* PROFILE HEADER */}
        <div className="profile-header">

          <img
            src={playerData?.avatar_url || "https://via.placeholder.com/80"}
            style={{ width: 80, height: 80, borderRadius: "50%" }}
          />

          {isOwner && (
            <button onClick={startCamera}>📸 Change Avatar</button>
          )}

          {uploading && <p>Uploading...</p>}
        </div>

        {/* CAMERA */}
        {showCamera && !imageSrc && (
          <div>
            <video ref={videoRef} autoPlay style={{ width: 300 }} />
            <button onClick={capturePhoto}>Capture</button>
          </div>
        )}

        {/* CROPPER */}
        {imageSrc && (
          <div style={{ position: "relative", width: 300, height: 300 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <button onClick={uploadCropped}>Save Avatar</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;