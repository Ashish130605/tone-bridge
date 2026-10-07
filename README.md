# ToneBridge - Music Discovery

## Description

ToneBridge identifies the song playing around you and then recommends music that
expands your music taste — suggestions that are different enough to be a
genuine discovery, but connected enough to feel intentional rather than random.

Most recommendation engines (Spotify, etc.) optimise for *similarity* — they show you
more of what you already like. ToneBridge takes a different approach: it uses **cosine
distance** between songs' audio-feature vectors to find music that sits at a deliberate
remove from what you just heard — close enough to stay relevant, far enough to broaden
your listening rather than echo it.
 
This project was built to explore recommendation-system design, audio identification, and
a full-stack workflow (FastAPI, PostgreSQL with pgvector, React); it is not a commercial
product (yet 😜).

Click [here](https://tone-bridge.onrender.com) to view the demo

### How it works, end to end:
 
1. The browser captures a short audio clip from your microphone.
2. The backend sends it to [AudD](https://audd.io/) for identification and gets back the
   song's title, artist, and streaming links.
3. The identified song is matched to a catalogue of tracks described by audio features
   (danceability, energy, valence, tempo, and more).
4. A **cosine-distance** search over the audio-feature vectors selects three songs that sit
   at a deliberate distance from the identified track — not too similar, not too far.
5. You get the identified song plus three suggestions to explore, each with a link out.

### Features
 
- Live in-browser microphone capture and song identification
- Content-based music recommendations using audio-feature vectors
- Cosine-distance selection: suggestions tuned for discovery, not similarity
- User accounts with JWT authentication
- Listening history (planned - implementation remaining)

## Visuals

<img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/26760ae8-5680-4ff2-951e-4171af706697" />
<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/aef2d16a-2871-4bbe-b5a7-efb43853e37a" />
<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/1bc3f9c2-57a2-428a-97de-f72bcfb52f0d" />
<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/d703c631-986e-4a9e-89c6-bea5b193200b" />

## Installation

ToneBridge has two parts that run separately: a **backend** (FastAPI + PostgreSQL) and a
**frontend** (React + Vite). You'll run both.

### Requirements

- Python 3.13.3 
- Node.js 22.14 and npm 10.9+ 
- PostgreSQL 16+ with the [pgvector](https://github.com/pgvector/pgvector) extension
- [uv](https://github.com/astral-sh/uv) for Python dependency management
- An [AudD](https://dashboard.audd.io/) API token (free tier available for a 100 requests for 3 weeks)
- A Kaggle account + API token (to download the song dataset)

### 1. Clone the repository

```bash
git clone https://github.com/Ashish130605/tone-bridge
cd tonebridge
```

### 2. Set up the database

Create a PostgreSQL database, then enable the pgvector extension (in psql or pgAdmin):

```sql
CREATE DATABASE tonebridge;
\c tonebridge
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Set up the backend

```bash
cd backend
uv sync                      # installs dependencies from the lockfile
```

Create a `.env` file in `backend/` with:

```
PYTHON_VERSION=3.13.3
AUDD_API_TOKEN=<--your API token-->
AUDD_API_URL=<--check AudD docs-->
POSTGRES_USER=<--username-->
POSTGRES_PASSWORD=<--your password-->
POSTGRES_SERVER=ep
POSTGRES_DB=<--your db name of your choice-->
POSTGRES_PORT=5432
COOKIE_SECURE=true
COOKIE_MAXAGE=3600
JWT_SECRET=<--your JWT secret-->
FRONTEND_URL=http://localhost:5173
```

### 4. Build the recommendation catalogue

This downloads the dataset, cleans it, normalises the audio features, and loads the
vectors into PostgreSQL. Run once:

```bash
uv run python scripts/kaggle_setup.py
```


### 5. Run the backend

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

### 6. Set up and run the frontend

```bash
cd ../frontend
npm install
```

Create a `.env.development` file in `frontend/` with:

```
VITE_API_URL=http://localhost:8000
```

Then start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Usage

Once both servers are running:

1. Open `http://localhost:5173` in your browser.
2. Create an account (Sign Up), or log in.
3. On the main screen, click the microphone button to capture audio while a song is playing.
4. ToneBridge identifies the song and shows it, along with three suggestions to explore.

### Identifying a song via the API directly

You can also call the backend without the frontend. With the backend running, visit
`http://localhost:8000/docs` for an interactive interface, or use curl:

```bash
curl -X POST http://localhost:8000/api/recognise \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@path/to/clip.webm"
```


Expected response (shape):

```json
{
  "title": "...",
  "artist": "...",
  "album": "...",
  "release_year": 9999,
  "other_links": "...",
  "apple_link": "...",
  "spotify_link": "...",
  "album_cover_url": "...",
  "suggestions": [
    {
      "title": "..."
      "artist": "..."
      "album": "..."
      "spotify_link": "..."
    },
    {
      "title": "..."
      "artist": "..."
      "album": "..."
      "spotify_link": "..."
    },
    {
      "title": "..."
      "artist": "..."
      "album": "..."
      "spotify_link": "..."
    }
  ]
}
```


## Roadmap

Planned work and deliberate future improvements, roughly in priority order:

### Recommendation quality
- **Feature engineering** — the current audio-feature space is too compressed to separate
  songs well (distances cluster tightly). Planned.
- **Empirically tune the distance thresholds** — set the cosine-distance range for suggestions
  from the real distribution once the feature space discriminates properly.
- **Weighted-random selection** within the chosen distance range (bias toward its sweet spot).

### Data & identification
- **AcoustID + MusicBrainz** as an open alternative to AudD for identification and more
  consistent metadata.
- **Album artwork enrichment** for suggestions via the official Spotify API (by track ID),
  as a one-time batch job.

### Infrastructure & deployment
- **Alembic** migrations once the schema stabilises.
- **Caching & rate limiting** (Redis, API gateway) if usage grows. 

### Features
- Listening history page
- Feedback loop (engaged/skipped) to adapt the novelty band per user

<!-- TODO: add a License section, and a Contributing section if you want one -->
