# Cadence Architecture

## Overview

Cadence is a full-stack playlist analytics and Spotify integration platform.

The application connects to Spotify, retrieves user playlist data, normalizes Spotify API responses, and renders playlist and track information through a Next.js frontend.

Cadence is currently focused on playlist exploration, playlist metadata, track retrieval, and future playlist intelligence features.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Flask
- SQLAlchemy
- MySQL
- Spotify Web API

### Tooling

- Git
- GitHub
- REST APIs

---

## High-Level System Flow

User  
→ Next.js Frontend  
→ Flask Backend  
→ Spotify Web API  
→ Flask Normalization Layer  
→ JSON API Response  
→ Next.js UI Rendering

---

## Core Frontend Areas

### App Routes

The Next.js app contains routes for:

- Home
- Search
- Library
- Spotify playlist detail pages
- Local playlist detail pages

### Components

Reusable UI components include:

- Sidebar
- PlaylistCard
- TrackRow
- TrackTable
- GlobalPlayer
- EnergyFlowChart

### Contexts

Cadence separates playback responsibilities across React contexts:

- PlaybackContext owns playlist navigation and track selection.
- AudioPlayerContext owns audio transport behavior such as play, pause, seek, volume, and playback state.

This separation prevents one oversized state layer from owning both playlist logic and audio transport logic.

---

## Core Backend Areas

### Flask Routes

Backend route modules are separated by domain:

- artists.py
- albums.py
- tracks.py
- playlists.py
- search.py
- spotify.py
- sections.py
- cadence.py
- events.py

### Spotify Integration

The Spotify integration handles:

- OAuth login
- OAuth callback
- Access token storage
- Refresh token handling
- Authenticated Spotify API requests
- Playlist retrieval
- Playlist metadata retrieval
- Playlist track retrieval

### Normalization Layer

Spotify API responses are deeply nested and not always shaped for direct frontend use.

Cadence normalizes Spotify responses into frontend-friendly objects for:

- Playlists
- Tracks
- Albums
- Artists
- Images
- Track counts

This keeps Spotify-specific response complexity out of the frontend.

---

## OAuth Flow

1. User clicks "Connect Spotify."
2. Frontend sends the user to the backend Spotify login route.
3. Backend redirects the user to Spotify's authorization endpoint.
4. User authenticates with Spotify.
5. Spotify redirects back with an authorization code.
6. Backend exchanges the code for an access token and refresh token.
7. Flask session stores authentication state.
8. Future Spotify requests use the authenticated session.

---

## Playlist Retrieval Flow

1. Authenticated user opens the Library page.
2. Frontend requests playlists from the Flask backend.
3. Backend verifies Spotify authentication state.
4. Backend calls Spotify playlist endpoints.
5. Backend normalizes playlist metadata.
6. Frontend receives playlist JSON.
7. Frontend renders playlist cards.

---

## Track Retrieval Flow

1. User opens a Spotify playlist detail page.
2. Frontend requests playlist metadata and track data.
3. Backend checks session authentication.
4. Backend calls Spotify playlist and playlist item endpoints.
5. Backend normalizes track data.
6. Frontend receives normalized tracks.
7. Frontend renders the playlist detail table.

---

## Playlist Count Issue

Spotify's playlist list response did not reliably include usable track count data.

Cadence resolves this by requesting playlist item pagination metadata for each playlist and reading the returned total value.

This allows playlist cards to show real track counts instead of misleading zero-count values.

---

## Playback Limitation

Cadence originally supported preview playback through Spotify's `preview_url` field.

Spotify preview URLs are now unreliable and often return null, which limits playback functionality for many tracks.

Because of this platform limitation, Cadence is being repositioned away from Spotify-clone behavior and toward playlist analytics and intelligence.

---

## Current Product Direction

Cadence is no longer treated primarily as a music player.

The current direction is:

Playlist exploration  
→ Playlist analytics  
→ Playlist intelligence  
→ Playlist optimization

---

## Future Architecture Direction

Future Cadence phases may include:

### Phase 1: Playlist Intelligence

- Flow Score
- Energy Curve
- Variety Score
- Artist concentration
- Playlist diagnostics

### Phase 2: Music Analytics

- Genre distribution
- Mood breakdown
- Discovery analysis
- Playlist health dashboard

### Phase 3: Playlist Optimization

- Track reordering
- Playlist repair
- AI-assisted sequencing
- Recommendation explanations

### Phase 4: Playlist Infrastructure

- Flow scoring API
- Playlist optimization API
- Music sequencing services

---

## Key Engineering Lessons

Cadence demonstrates:

- OAuth integration
- Third-party API orchestration
- Session-based authentication
- Response normalization
- Frontend/backend boundary design
- React context-based state management
- Debugging external API behavior
- Product repositioning when platform constraints change
