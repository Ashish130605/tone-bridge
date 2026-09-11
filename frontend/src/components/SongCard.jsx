import styles from "./SongCard.module.css";
export function SongCard({variant , data}) {
    const className = `${styles.baseCard} ${styles[variant]}`
    return(
        <article className={className}>
                <div className={styles.albumCover}>

                </div>
                
                <div className={styles.cardContent}>
                    <h4 className={styles.title}>{data?.title}</h4>
                    <p className={styles.artist}>{data?.artist}</p>
                    <p className={styles.album}>{data?.album}</p>
                </div>
                <div className={styles.cardLinks}>
                    <a href={data.spotify_link} aria-label="Listen on Spotify">S</a>
                    <a href={data.apple_link} aria-label="Listen on Apple Music">A</a>
                </div>
        </article>
    );   
}``