/*
/   AudD API SERVICE DOWN. DUMMY object used
/   TODO: uncomment after AudD is live
*/

import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { SongCard, Button} from "../../../components";
import styles from "./HomePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
//import { apiFetch } from "../../../lib/api-client";

//DUMMY DATA FOR TESTING ONLY - TO BE REMOVED AFTER API SERVICE IS UP
const data = {
  title: "OGsongtitle1",
  artist: "OGsongartist1",
  album: "OGsongAlbum1",
  apple_link: "OGapple.com/songtrack123",
  spotify_link: "OGspotify.com/songid12234456",
  suggestions: [
    {
      title: "songtitle1",
      artist: "songartist1",
      album: "songAlbum1",
      apple_link: "apple.com/songtrack123",
      spotify_link: "spotify.com/songid12234456",
    },
    {
      title: "songtitle2",
      artist: "songartist2",
      album: "songAlbum2",
      apple_link: "apple.com/songtrack1234",
      spotify_link: "spotify.com/songid2214456",
    },
    {
      title: "songtitle3",
      artist: "songartist3",
      album: "songAlbum3",
      apple_link: "apple.com/songtrack12345",
      spotify_link: "spotify.com/songid112434t556",
    },
  ],
};

export function HomePage() {
  const { auth } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [url, setUrl] = useState(null);
  //const [audioFormData, setAudioFormData] = useState(null);
  //const [data, setData] = useState({});
  const [success, setSuccess] = useState(false);
  //const [error, setError] = useState("");

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
            // const formData = new FormData();
            // formData.append("file",b,"recording");
            //setAudioFormData(formData);
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

  const stopRecodingAndFetchData = /*async*/ () => {
    mediaRecorder.stop();
    setIsRecording(false);
    // try {
    //     const response = await apiFetch("api/recognise", {
    //     method : "POST",
    //     headers: {
    //         "Content-Type" : "multipart/form-data"
    //     },
    //     body: audioFormData
    // })
    // setData(response)
    // console.log(data);
    setSuccess(true);
    // } catch (error) {
    //     console.log(error.message);
    // }
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
