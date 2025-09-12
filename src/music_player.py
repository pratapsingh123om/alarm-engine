import sys
import os
import subprocess

def play_local_file(file_path):
    """Play a local audio file using available players"""
    try:
        # Convert file URL to path if needed
        if file_path.startswith('file://'):
            file_path = file_path[7:]
            
        if sys.platform == "win32":
            os.startfile(file_path)
        elif sys.platform == "darwin":  # macOS
            subprocess.call(("open", file_path))
        else:  # Linux
            subprocess.call(("xdg-open", file_path))
        return True
    except Exception as e:
        print(f"Error playing local file: {e}")
        return False

def play_spotify(spotify_uri):
    """Play a Spotify URI (requires Spotify app to be installed and running)"""
    try:
        if sys.platform == "win32":
            # On Windows, we can use the spotify: protocol
            os.startfile(spotify_uri)
        elif sys.platform == "darwin":  # macOS
            subprocess.call(["open", spotify_uri])
        else:  # Linux
            subprocess.call(["xdg-open", spotify_uri])
        return True
    except Exception as e:
        print(f"Error playing Spotify: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python music_player.py <local|spotify> <path_or_uri>")
        sys.exit(1)
    
    player_type = sys.argv[1]
    source = sys.argv[2]
    
    if player_type == "local":
        success = play_local_file(source)
    elif player_type == "spotify":
        success = play_spotify(source)
    else:
        print("Invalid player type. Use 'local' or 'spotify'")
        sys.exit(1)
    
    # Return success status
    sys.exit(0 if success else 1)