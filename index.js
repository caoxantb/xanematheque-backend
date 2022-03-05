const app = require("./app");
const http = require("http");

// utils
const config = require("./utils/config");
const logger = require("./utils/logger");

// connect to server
const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
