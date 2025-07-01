import spotipy
from spotipy.oauth2 import SpotifyOAuth
import sys

def get_current_playing():
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id="YOUR_SPOTIFY_CLIENT_ID",
        client_secret="YOUR_SPOTIFY_CLIENT_SECRET",
        redirect_uri="http://localhost:8888/callback",
        scope="user-read-playback-state"
    ))

    current = sp.current_playback()
    if current and current['is_playing']:
        track = current['item']
        print(f"{track['name']} by {track['artists'][0]['name']}")
    else:
        print("No music playing")

if __name__ == "__main__":
    get_current_playing()
