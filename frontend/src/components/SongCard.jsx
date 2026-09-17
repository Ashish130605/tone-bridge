import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SongCard.module.css";
import { faApple, faSpotify } from "@fortawesome/free-brands-svg-icons";
export function SongCard({variant , data}) {
    const className = `${styles.baseCard} ${styles[variant]}`
    return(
        <article className={className}>
                <div className={styles.albumCover}>
                    <img src={data?.album_cover_url} alt="Album Cover"/>
                </div>
                
                <div className={styles.cardContent}>
                    <h4 className={styles.title}>{data?.title}</h4>
                    <p className={styles.artist}>{data?.artist}</p>
                    <p className={styles.album}>{data?.album}</p>
                </div>
                <div className={styles.cardLinks}>
                    <a className ={styles.spotifylink} href={data?.spotify_link} aria-label="Listen on Spotify">
                        <FontAwesomeIcon icon={faSpotify} />
                    </a>
                    <a className ={styles.applelink} href={data?.apple_link} aria-label="Listen on Apple Music">
                        <FontAwesomeIcon icon={faApple} />
                    </a>
                </div>
        </article>
    );   
}``