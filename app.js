const express = require("express");
const app = express();
const cors = require("cors");
require("express-async-errors");
const mongoose = require("mongoose");

// routers
const filmsRouter = require("./controllers/films");
const loginRouter = require("./controllers/login");
const personsRouter = require("./controllers/persons");
const closeupsRouter = require("./controllers/closeups");
const usersRouter = require("./controllers/users");
const listsRouter = require("./controllers/lists");

// utils
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");

// connect to database
logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((err) => {
    logger.error("error connecting to MongoDB", err.message);
  });

// connect to middlewares and routers
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/films", filmsRouter);
app.use("/api/login", loginRouter);
app.use("/api/persons", personsRouter);
app.use("/api/closeups", closeupsRouter);
app.use("/api/lists", listsRouter);
app.use("api/users", usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
