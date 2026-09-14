import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { apiFetch } from "../../../lib/api-client";

export function HomePage() {
  const { auth } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [audioFormData, setAudioFormData] = useState(null);
  const [data, setData] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!audioStream) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setAudioStream(stream);
          const mediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorder);
          let audio;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audio = [event.data];
            }
          };

          mediaRecorder.onstop = () => {
            const b = new Blob(audio, { type: "audio/wav" });
            setAudioBlob(b);
            const audioUrl = URL.createObjectURL(b);
            setUrl(audioUrl);
            const formData = new FormData();
            formData.append("file", b, "recording");
            setAudioFormData(formData);
          };
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  }, [audioStream]);

  const startRecording = () => {
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecodingAndFetchData = async () => {
    mediaRecorder.stop();
    setIsRecording(false);
    try {
      const response = await apiFetch("/api/recognise", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: audioFormData,
      });
      setData(response);
      console.log(data);
      setSuccess(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <h1>Hello {auth?.email}!</h1>
      <p>Click on the button to record and identify the song.</p>
      <button
        onClick={!isRecording ? startRecording : stopRecodingAndFetchData}
      >
        {isRecording ? "recording..." : "record"}
      </button>

      {success ? (
        <section>
          <audio src={url} controls></audio>
          <h3>Song identified</h3>
          <ul className="song-list">
            <li className="song-title">name: {data?.title}</li>
            <li className="song-artist">artist: {data?.artist}</li>
            <li className="song-album">album: {data?.album}</li>
            <li className="apple-link">
              <a href={data?.apple_link}>Apple</a>
            </li>
            <li className="spotify-link">
              <a href={data?.spotify_link}>Spotify</a>
            </li>
          </ul>

          <p>You might also like.</p>
          <ul className="suggestions-list">
            {data?.suggestions.map((suggestions) => (
              <li key={`${suggestions.artist}-${suggestions.album}`}>
                <p>{suggestions.title}</p>
                <p>{suggestions.artist}</p>
                <p>{suggestions.album}</p>
                <a href={suggestions.apple_link}></a>
                <a href={suggestions.spotify_link}></a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
