import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

client_id = "your_client_id"
client_secret = "your_client_secret"

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=client_id,
    client_secret=client_secret
))

def get_trending_tracks():
    results = sp.playlist_items("37i9dQZF1DXcBWIGoYBM5M", limit=5)
    return [item['track']['name'] for item in results['items']]

if __name__ == "__main__":
    print("Trending Tracks:")
    for name in get_trending_tracks():
        print(name)
