import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { SongCard, Button} from "../../../components";
import styles from "./HomePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";


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
            formData.append("file",b,"recording");
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
  };

  const resetStates = ()=>{
    setSuccess(false);
    setAudioStream(null);
    setAudioBlob(null);
  }

  return (
    <>
      {success ? (
        <section>
          <h3>Song identified</h3>

          <SongCard data={data}/>

          <hr />

          <p>You might also like.</p>
          <ul className={styles["suggestions-list"]}>
            {data?.suggestions.map((suggestions) => (
              <li key={suggestions.title}>
                  <SongCard variant="listCard" data={suggestions} />
                  <hr />
              </li>

            ))}

          </ul>
          <Button onClick= {resetStates}>Guess Again</Button>
        </section>
      
      ) : (
        <section>
          <Button
            variant = {isRecording ? 'mainPageButtonActive': 'mainPageButton'} onClick={!isRecording ? startRecording : stopRecodingAndFetchData}
          >
            <FontAwesomeIcon icon={faMusic} size="2x"/>
          </Button>
        </section>
      )}
    </>
  );
}
