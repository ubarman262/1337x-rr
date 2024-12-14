const express = require("express");
const axios = require("axios");
const path = require("path");
const { extractName } = require("./groq");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Radarr API configuration
const radarrApiKey = process.env.RADARR_API_KEY;
const radarrUrl = process.env.RADARR_URL;

// Middleware to parse JSON request body
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Search movies by name
app.get("/search", async (req, res) => {
  const movieName = req.query.name;

  if (!movieName) {
    return res.status(400).json({ error: "Movie name is required" });
  }

  try {
    const response = await axios.get(`${radarrUrl}/api/v3/movie/lookup`, {
      params: { term: movieName },
      headers: { "X-Api-Key": radarrApiKey },
    });

    if (response.data.length === 0) {
      return res.status(404).json({ message: "No movies found" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from Radarr:", error.message);
    res.status(500).json({ error: "Failed to fetch movies from Radarr" });
  }
});

// Add movie to Radarr
app.post("/add", async (req, res) => {
  const movie = req.body;

  if (!movie || !movie.tmdbId) {
    return res.status(400).json({ error: "Movie data or tmdbId is required" });
  }

  let movieData = {
    ...movie,
    qualityProfileId: 4,
    monitored: true,
    rootFolderPath: "/local",
  };

  try {
    const response = await axios.post(`${radarrUrl}/api/v3/movie`, movieData, {
      headers: { "X-Api-Key": radarrApiKey },
    });

    res
      .status(201)
      .json({ message: "Movie added successfully", movie: response.data });
  } catch (error) {
    console.error("Error adding movie to Radarr:", error.message);
    res.status(500).json({ error: "Failed to add movie to Radarr" });
  }
});

app.post("/extract-name", async (req, res) => {
  const movieUrl = req.body.movieUrl;
  const response = await extractName(movieUrl);
  res.status(201).json(response);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
