from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import base64
from deepface import DeepFace  # New import
import cv2  # New import
import numpy as np  # New import

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load environment variables
load_dotenv()

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI')

# Local songs list
songs = [
    {"title": "Happy Song 1", "mood": "Happy", "file": "/music/happy1.mp3", "cover": "/covers/Happy.jpg"},
    {"title": "Happy Song 2", "mood": "Happy", "file": "/music/happy2.mp3", "cover": "/covers/Happy.jpg"},
    {"title": "Happy Song 3", "mood": "Happy", "file": "/music/happy3.mp3", "cover": "/covers/Happy.jpg"},
    {"title": "Happy Song 4", "mood": "Happy", "file": "/music/happy4.mp3", "cover": "/covers/Happy.jpg"},
    {"title": "Sad Song 1", "mood": "Sad", "file": "/music/sad 1.mp3", "cover": "/covers/Sad.jpg"},
    {"title": "Sad Song 2", "mood": "Sad", "file": "/music/sad 2.mp3", "cover": "/covers/Sad.jpg"},
    {"title": "Sad Song 3", "mood": "Sad", "file": "/music/sad 3.mp3", "cover": "/covers/Sad.jpg"},
    {"title": "Sad Song 4", "mood": "Sad", "file": "/music/sad 4.mp3", "cover": "/covers/Sad.jpg"},
    {"title": "Romantic Song 1", "mood": "Romantic", "file": "/music/rom 1.mp3", "cover": "/covers/Romantic.jpg"},
    {"title": "Romantic Song 2", "mood": "Romantic", "file": "/music/rom 2.mp3", "cover": "/covers/Romantic.jpg"},
    {"title": "Romantic Song 3", "mood": "Romantic", "file": "/music/rom 3.mp3", "cover": "/covers/Romantic.jpg"},
    {"title": "Romantic Song 4", "mood": "Romantic", "file": "/music/rom 4.mp3", "cover": "/covers/Romantic.jpg"},
]


# ==============================================
# New Emotion Detection Functionality
# ==============================================

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    """Detects emotion from uploaded image and returns matching mood"""
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    try:
        # Read image file
        file = request.files['image']
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        
        # Analyze emotion
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        dominant_emotion = result[0]['dominant_emotion']
        
        # Map to existing mood categories
        mood_map = {
            'happy': 'Happy',
            'sad': 'Sad',
            'angry': 'Energetic',
            'surprise': 'Happy',
            'fear': 'Sad',
            'disgust': 'Sad',
            'neutral': 'Chill'
        }
        
        mood = mood_map.get(dominant_emotion.lower(), 'Neutral')
        
        return jsonify({
            "status": "success",
            "emotion": dominant_emotion,
            "mood": mood,
            "suggested_playlist": get_playlist_by_mood(mood)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_playlist_by_mood(mood):
    """Helper function to get songs by mood"""
    return [song for song in songs if song["mood"].lower() == mood.lower()]


@app.route("/")
def home():
    return "🎵 Mood Vibe Backend is running!"

# Route to fetch all songs (for testing)
@app.route("/songs")
def get_all_songs():
    return jsonify(songs)

# New route to fetch songs by mood
@app.route("/get_playlist")
def get_playlist():
    mood = request.args.get("mood")
    if not mood:
        return jsonify({"error": "Mood parameter is missing."}), 400
    
    playlist = [song for song in songs if song["mood"].lower() == mood.lower()]
    if not playlist:
        return jsonify({"message": f"No songs found for mood: {mood}."}), 404
    
    return jsonify(playlist)

# Spotify login route
@app.route("/login")
def login():
    scopes = "user-library-read user-read-playback-state user-read-currently-playing"
    auth_url = (
        "https://accounts.spotify.com/authorize"
        f"?response_type=code"
        f"&client_id={SPOTIFY_CLIENT_ID}"
        f"&scope={scopes}"
        f"&redirect_uri={SPOTIFY_REDIRECT_URI}"
    )
    return redirect(auth_url)

# Spotify callback route
@app.route("/callback")
def callback():
    code = request.args.get('code')

    token_url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode()
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI
    }

    response = requests.post(token_url, data=data, headers=headers)
    if response.status_code != 200:
        print("Failed to fetch token:", response.json())
        return redirect("/#/error/invalid_token")

    tokens = response.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    return redirect(f"http://localhost:3000/#/loggedIn?access_token={access_token}&refresh_token={refresh_token}")

# Refresh access token using refresh token
@app.route("/refresh_token")
def refresh_access_token():
    refresh_token = request.args.get('refresh_token')

    token_url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode(),
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }

    response = requests.post(token_url, data=data, headers=headers)
    if response.status_code != 200:
        print("Failed to refresh token:", response.json())
        return jsonify({"error": "Failed to refresh token"}), 400

    tokens = response.json()
    new_access_token = tokens.get("access_token")

    return jsonify({"access_token": new_access_token})

# Get the currently playing track from Spotify
@app.route("/currently_playing")
def currently_playing():
    access_token = request.args.get('access_token')

    if not access_token:
        return jsonify({"error": "Missing access token"}), 400

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get("https://api.spotify.com/v1/me/player/currently-playing", headers=headers)

    if response.status_code == 204:
        return jsonify({"message": "No track is currently playing."}), 200
    elif response.status_code != 200:
        return jsonify({"error": "Unable to fetch currently playing track"}), 400

    track_data = response.json()
    track = {
        "name": track_data["item"]["name"],
        "artists": [artist["name"] for artist in track_data["item"]["artists"]],
        "album": track_data["item"]["album"]["name"],
        "image_url": track_data["item"]["album"]["images"][0]["url"] if track_data["item"]["album"]["images"] else None
    }

    return jsonify(track)


if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        debug=True, 
        port=5000)
