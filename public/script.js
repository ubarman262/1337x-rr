let movieList = null;

async function searchMovie() {
  const movieUrl = document.getElementById("movieUrl").value.trim();
  if (!movieUrl) {
    alert("Please enter 1337x url.");
    return;
  }

  try {
    const urlResponse = await fetch("/extract-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieUrl: movieUrl,
      }),
    });

    const extractedData = await urlResponse.json();
    const extractedDataJson = await JSON.parse(extractedData);
    const response = await fetch(`/search?name=${extractedDataJson.name}`);
    const data = await response.json();
    if (data.length === 0) {
      document.getElementById("searchResults").innerHTML =
        "<p>No movies found.</p>";
      return;
    }
    movieList = data;
    const resultsHtml = data
      .map((movie) => {
        // Check if movie.remotePoster exists (and if movie.id exists for tick and button)
        if (!movie.remotePoster) {
          return ""; // Skip the movie if remotePoster is not present
        }

        const imdbDiv = movie?.ratings?.imdb?.value
          ? ` <div class="imdb-rating">
            <img src="./imdb.png" alt="imdb">
            <span>${movie?.ratings?.imdb?.value}</span>
          </div>`
          : "";

        // Check if movie.id exists before rendering the tick div
        const tickDiv = movie.id
          ? `<div class="tick"><img src="./tick.webp" alt="Available"></div>`
          : "";

        // Conditionally disable the Add button if movie.id exists
        const disabledButton = movie.id ? "disabled" : "";
        const disabledClass = movie.id ? "class='not-allowed'" : "";

        return `
      <div class="movie-card">
        ${tickDiv}
        <img src="${movie.remotePoster}" alt="${movie.title}">
        <h3>${movie.title} (${movie.year})</h3>
        <div class="ratings">
         ${imdbDiv}
        </div>
        <div class="add-movie">
          <button ${disabledButton} ${disabledClass} onclick="addMovie(${movie.tmdbId})">Add Movie</button>
        </div>
      </div>
    `;
      })
      .join("");

    document.getElementById("searchResults").innerHTML = resultsHtml;
  } catch (error) {
    console.error("Error fetching movie data:", error);
    alert("Failed to fetch movie data.");
  }
}

async function addMovie(tmdbId) {
  let selectedMovie = movieList.find((movie) => tmdbId === movie.tmdbId);
  const payload = {
    addOptions: {
      monitor: "movieOnly",
      searchForMovie: true,
    },
    ...selectedMovie,
  };
  try {
    const response = await fetch("/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    alert(data.message || "Movie added successfully!");
  } catch (error) {
    console.error("Error adding movie:", error);
    alert("Failed to add movie to Radarr.");
  }
}
