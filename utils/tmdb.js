/* eslint-disable no-undef */
require("dotenv").config();

const fetch = require("node-fetch");

const TMDB_APIKEY = process.env.TMDB_APIKEY;
const URL = process.env.TMDB_URL;
const IMG_PATH = process.env.TMDB_IMG;

const getFilmToPost = async (request, response, next) => {
  const id = request.body._id;
  const filmFetched = await fetch(
    `${URL}/movie/${id}?api_key=${TMDB_APIKEY}&append_to_response=credits`
  );
  const filmJSON = await filmFetched.json();
  const film = {
    title: filmJSON.title || null,
    director: filmJSON.credits.crew
      .filter((crew) => crew.job === "Director")
      .map((dir) => ({
        _id: dir.id,
        name: dir.name,
        profilePicture: dir.profile_path
          ? `${IMG_PATH}${dir.profile_path}`
          : null,
      })),
    year: filmJSON.release_date.substring(0, 4) || null,
    countries: filmJSON.production_countries.map((c) => c.name) || [],
    duration: filmJSON.runtime || null,
    genres: filmJSON.genres.map((g) => g.name) || [],
    averageRating: filmJSON.vote_average,
    backdrop: filmJSON.backdrop_path
      ? `${IMG_PATH}${filmJSON.backdrop_path}`
      : null,
  };

  response.film = film;

  next();
};

const searchFilms = async (request, response, next) => {
  const text = request.query.text;
  const page = request.query.page || 1;
  const resultFetched = await fetch(
    `${URL}/search/movie?api_key=${TMDB_APIKEY}&query=${text}&page=${page}`
  );
  const resultJSON = await resultFetched.json();
  response.result = resultJSON;

  next();
};

const getFilmMeta = async (request, response, next) => {
  const id = request.params.id;

  const filmFetched = await fetch(
    `${URL}/movie/${id}?api_key=${TMDB_APIKEY}&append_to_response=credits,recommendations`
  );
  const filmJSON = await filmFetched.json();
  const director =
    filmJSON.credits.crew.filter((c) => c.job === "Director") || [];

  const film = {
    title: filmJSON.title || null,
    originalTitle: filmJSON.original_title || null,
    director: director.map((dir) => ({
      _id: dir.id,
      name: dir.name,
    })),
    year: filmJSON.release_date.substring(0, 4) || null,
    countries: filmJSON.production_countries.map((c) => c.name) || [],
    duration: filmJSON.runtime || null,
    languages: filmJSON.spoken_languages.map((l) => l.english_name) || [],
    genres: filmJSON.genres.map((g) => g.name) || [],
    synopsis: filmJSON.overview || null,
    tagline: filmJSON.tagline,
    ratings: filmJSON.vote_average,
    voteCount: filmJSON.vote_count,
    backdrop: filmJSON.backdrop_path
      ? `${IMG_PATH}${filmJSON.backdrop_path}`
      : null,
    poster: filmJSON.backdrop_path
      ? `${IMG_PATH}${filmJSON.poster_path}`
      : null,
    // cast: getCast(filmJSON.credits.cast, IMG_PATH),
    // crew: getCrew(filmJSON.credits.crew, IMG_PATH),
    relatedFilms:
      filmJSON.recommendations.results.length > 15
        ? filmJSON.recommendations.results.slice(0, 15)
        : filmJSON.recommendations.results,
  };

  request.img = IMG_PATH;
  response.cast = filmJSON.credits.cast;
  response.crew = filmJSON.credits.crew;
  response.result = film;

  next();
};

const getFilmCredit = async (request, response, next) => {
  const id = request.params.id;

  const filmFetched = await fetch(
    `${URL}/movie/${id}/credits?api_key=${TMDB_APIKEY}`
  );
  const filmJSON = await filmFetched.json();

  request.img = IMG_PATH;
  response.cast = filmJSON.cast;
  response.crew = filmJSON.crew;

  next();
};

module.exports = { getFilmToPost, searchFilms, getFilmMeta, getFilmCredit };
