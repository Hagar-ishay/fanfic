import log from "pino";

const logger = log({
  level: process.env.LOG_LEVEL || "info",
});

export default logger;
