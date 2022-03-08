const personsRouter = require("express").Router();

// middlewares
const tmdb = require("../utils/tmdb");
const middleware = require("../utils/middleware");

//search for persons
personsRouter.get(
  "/search",
  tmdb.searchTMDB("person"),
  async (request, response) => {
    const resultFetched = response.result;
    const newResult = resultFetched.results.map((r) => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      profilePicture: `${request.img}${r.poster_path}`,
    }));
    resultFetched.results = newResult;
    response.json(resultFetched);
  }
);

personsRouter.get(
  "/:id",
  tmdb.getPersonMeta,
  middleware.getCredits,
  async (request, response) => {
    const result = response.result;
    const credits = response.credits;

    const finalResult = {
      ...result,
      credits: credits,
    };

    response.json(finalResult);
  }
);

module.exports = personsRouter;
