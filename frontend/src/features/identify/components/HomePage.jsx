import { useState } from "react";
import { SongCard, Button, Loading } from "../../../components";
import styles from "./HomePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { apiFetch } from "../../../lib/api-client";
import { useRecorder } from "../../../hooks/useRecorder";

export function HomePage() {
  const { isRecording, error: recorderError, start, stop } = useRecorder();
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecord = async () => {
    setError("");
    await start();
  };

  const handleStopAndIdentify = async () => {
    setIsLoading(true);
    setError("");
    try {
      const blob = await stop();
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");
      const response = await apiFetch("/api/recognise", {
        method: "POST",
        body: formData,
      });
      setData(response);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetStates = () => {
    setSuccess(false);
    setData(null);
    setError("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {success ? (
        <section>
          <h3>Song identified</h3>

          <SongCard data={data} />

          <hr />

          <p>You might also like.</p>
          <ul className={styles["suggestions-list"]}>
            {data?.suggestions?.map((suggestion) => (
              <li key={suggestion.title}>
                <SongCard variant="listCard" data={suggestion} />
                <hr />
              </li>
            ))}
          </ul>
          <Button onClick={resetStates}>Guess Again</Button>
        </section>
      ) : (
        <section>
          {(error || recorderError) && (
            <p role="alert" className={styles.error}>
              {error || recorderError}
            </p>
          )}
          <Button
            variant={isRecording ? "mainPageButtonActive" : "mainPageButton"}
            onClick={!isRecording ? handleRecord : handleStopAndIdentify}
          >
            <FontAwesomeIcon icon={faMusic} size="2x" />
          </Button>
        </section>
      )}
    </>
  );
}
