import React, { useState, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import songs from "./songs";
import "./Home.css";
import { FaSearch, FaCamera, FaHeart, FaRegHeart } from "react-icons/fa";
import Webcam from "react-webcam";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const [detectedMood, setDetectedMood] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("Home"); // NEW: track which sidebar tab is active
  const webcamRef = useRef(null);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/")).catch((error) => alert(error.message));
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    try {
      const formData = new FormData();
      const blob = await fetch(imageSrc).then(res => res.blob());
      formData.append('image', blob, 'emotion.jpg');

      const response = await axios.post('http://localhost:5000/detect_emotion', formData);
      setDetectedMood(response.data.mood);
      setShowCamera(false);
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  const toggleFavorite = (song) => {
    const isFav = favorites.some(fav => fav.title === song.title);
    if (isFav) {
      setFavorites(favorites.filter(fav => fav.title !== song.title));
    } else {
      setFavorites([...favorites, song]);
    }
  };

  const filteredSongs = detectedMood
    ? songs.filter(song => song.mood.toLowerCase() === detectedMood.toLowerCase())
    : songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.mood.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const songsToShow = activeTab === "Favorites" ? favorites : filteredSongs;

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>🎵 MoodVibe</h2>
        <ul>
          <li onClick={() => setActiveTab("Home")} className={activeTab === "Home" ? "active-tab" : ""}>Home</li>
          <li onClick={() => setActiveTab("Playlists")} className={activeTab === "Playlists" ? "active-tab" : ""}>Playlists</li>
          <li onClick={() => setActiveTab("Favorites")} className={activeTab === "Favorites" ? "active-tab" : ""}>Favorites</li>
          <li onClick={() => setActiveTab("Settings")} className={activeTab === "Settings" ? "active-tab" : ""}>Settings</li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>🎶FeelBeats</h2>
          <div className="search-container">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search songs or moods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaCamera
                className="camera-icon"
                onClick={() => setShowCamera(!showCamera)}
                title="Detect emotion"
              />
            </div>
          </div>
        </div>

        {showCamera && (
          <div className="camera-modal">
            <div className="camera-content">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
              />
              <div className="camera-buttons">
                <button onClick={() => setShowCamera(false)}>Cancel</button>
                <button onClick={handleCapture}>Capture</button>
              </div>
            </div>
          </div>
        )}

        {detectedMood && activeTab === "Home" && (
          <div className="mood-display">
            Showing songs for: <span>{detectedMood}</span>
            <button onClick={() => setDetectedMood(null)}>Clear</button>
          </div>
        )}

        <div className="songs-grid">
          {songsToShow.map((song, index) => {
            const isFav = favorites.some(fav => fav.title === song.title);
            return (
              <div className="song-card" key={index}>
                <img src={song.cover} alt={song.title} />
                <h4>{song.title}</h4>
                <p>{song.mood}</p>
                <audio controls className="audio-player">
                  <source src={song.file} type="audio/mp3" />
                </audio>
                <div
                  onClick={() => toggleFavorite(song)}
                  style={{
                    cursor: 'pointer',
                    marginTop: '10px',
                    fontSize: '20px',
                    color: isFav ? '#f45218' : '#ffffff'
                  }}
                >
                  {isFav ? <FaHeart /> : <FaRegHeart />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
