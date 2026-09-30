import { useCallback, useEffect, useRef, useState } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError(e?.message ?? "Could not access the microphone");
    }
  }, []);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        recorderRef.current = null;
        releaseStream();
        setIsRecording(false);
        resolve(blob);
      };
      recorder.stop();
    });
  }, [releaseStream]);

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => releaseStream, [releaseStream]);

  return { isRecording, error, start, stop };
}
