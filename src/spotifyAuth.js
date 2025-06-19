const clientId = "2a5e6401522d48c7bf60a17b0afeb915";
const redirectUri = "http://localhost:3000/callback";
const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-private",
  "playlist-read-private",
  "user-library-read",
  "user-library-modify"
];

export const getSpotifyAuthUrl = () => {
  const authEndpoint = "https://accounts.spotify.com/authorize";
  const scope = scopes.join("%20");

  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&show_dialog=true`;
};
