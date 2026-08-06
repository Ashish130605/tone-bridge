import asyncio
from pathlib import Path
from dotenv import load_dotenv
from pgvector.asyncpg import register_vector
import os
import joblib
import kaggle
import pandas as pd
from sklearn import preprocessing
import asyncpg

load_dotenv()

RAW_DIR = Path("../data/raw")
RAW_CSV = RAW_DIR / "songs.csv"
SCALER_PATH = Path("../data/processed/scaler.joblib")
FEATURE_COLS = ['danceability', 'energy', 'key',
       'loudness', 'speechiness', 'acousticness', 'instrumentalness',
       'liveness', 'valence', 'tempo']

ID_COLS = ['id', 'name', 'album_name', 'artists','year','genre']

DROP_COLS = ['lyrics', 'popularity', 'total_artist_followers', 'avg_artist_popularity',
             'artist_ids', 'niche_genres', 'duration_ms','mode']
def download():
       if RAW_CSV.exists():
              print("File already exists")
              return
       print("Downloading data...")
       kaggle.api.authenticate()
       kaggle.api.dataset_download_files('serkantysz/550k-spotify-songs-audio-lyrics-and-genres',path="../data/raw",unzip=True)

def load_csv():
       df = pd.read_csv(RAW_CSV, usecols=ID_COLS+FEATURE_COLS)
       return df.reset_index(drop=True)

def normalize(df: pd.DataFrame) -> pd.DataFrame:
       scaler = preprocessing.MinMaxScaler()
       df[FEATURE_COLS] = scaler.fit_transform(df[FEATURE_COLS])
       SCALER_PATH.parent.mkdir(parents=True, exist_ok=True)
       joblib.dump(scaler, SCALER_PATH)
       return df

async def load_to_db(df: pd.DataFrame):
       num = len(FEATURE_COLS)

       conn = await asyncpg.connect(user=os.getenv("POSTGRES_USER"),
                                    password=os.getenv("POSTGRES_PASSWORD"),
                                    host=os.getenv("POSTGRES_SERVER"),
                                    port=5432,
                                    database=os.getenv("POSTGRES_DB"))
       if conn:
              print("Connected to PostgreSQL")
              await register_vector(conn)

              print("Creating table...")
              await conn.execute("DROP TABLE IF EXISTS songs;")
              await conn.execute(f"""
                      CREATE TABLE songs (
                          song_id          SERIAL PRIMARY KEY,
                          spotify_id  TEXT,
                          name        TEXT,
                          album_name  TEXT,
                          artists     TEXT,
                          year        INTEGER,
                          genre       TEXT,
                          spotify_url TEXT,
                          embedding     vector({num})
                      );
                  """)

              records = []
              for _, r in df.iterrows():
                     embds = [float(r[c]) for c in FEATURE_COLS]
                     records.append((
                            r["id"],
                            str(r["name"]),
                            str(r["album_name"]),
                            r["artists"],
                            int(r["year"]),
                            r["genre"],
                            f"https://open.spotify.com/track/{r['id']}",
                            embds,
                     ))

              insert_sql = """
                     INSERT INTO songs (spotify_id, name, album_name, artists, year, genre, spotify_url, embedding)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 """

              batch = 5000
              for i in range(0, len(records), batch):
                     await conn.executemany(insert_sql, records[i:i + batch])
                     print(f"  {min(i + batch, len(records)):,} / {len(records):,}")

              await conn.execute(
                     "CREATE INDEX ON songs USING hnsw (embedding vector_cosine_ops);"
              )
       else:
              raise


       await conn.close()


async def main() -> None:
       download()
       df = load_csv()
       df = normalize(df)
       await load_to_db(df)


if __name__ == "__main__":
       asyncio.run(main())

