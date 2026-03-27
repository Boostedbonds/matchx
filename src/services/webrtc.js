import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
} from "firebase/firestore";

let peerConnection;
let localStream;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const startHost = async (videoRef) => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });

  videoRef.current.srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  const roomRef = doc(db, "rooms", "live");

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  await setDoc(roomRef, { offer });

  const answerRef = collection(roomRef, "answers");

  onSnapshot(answerRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data();
        peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    });
  });

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(collection(roomRef, "candidates"), event.candidate.toJSON());
    }
  };
};

export const joinViewer = async (videoRef) => {
  peerConnection = new RTCPeerConnection(servers);

  const roomRef = doc(db, "rooms", "live");
  const roomSnapshot = await getDoc(roomRef);

  const remoteStream = new MediaStream();
  videoRef.current.srcObject = remoteStream;

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  const offer = roomSnapshot.data().offer;
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  await addDoc(collection(roomRef, "answers"), { answer });

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(collection(roomRef, "candidates"), event.candidate.toJSON());
    }
  };

  onSnapshot(collection(roomRef, "candidates"), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        peerConnection.addIceCandidate(
          new RTCIceCandidate(change.doc.data())
        );
      }
    });
  });
};