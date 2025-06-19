require('dotenv').config();
const express = require("express");
const cors = require("cors");
const request = require("request");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🎵 Mood Vibe Backend is running!");
});

// Songs route
app.get("/songs", (req, res) => {
  res.json([
    { title: "Song 1", mood: "Happy" },
    { title: "Song 2", mood: "Sad" }
  ]);
});

// Spotify login route
app.get("/login", (req, res) => {
  const scopes = 'user-library-read user-read-playback-state user-read-currently-playing';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(authUrl);
});

// Spotify callback route
app.get("/callback", (req, res) => {
  const code = req.query.code;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error("Error fetching token: ", error || body);
      return res.redirect('/#/error/invalid_token');
    }

    const access_token = body.access_token;
    const refresh_token = body.refresh_token;

    res.redirect(`${process.env.SPOTIFY_REDIRECT_URI.replace('/callback', '')}/#/loggedIn?access_token=${access_token}&refresh_token=${refresh_token}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
