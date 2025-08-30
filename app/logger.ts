import log from "pino";

const logger = log({
  level: process.env.LOG_LEVEL || "info",
  // ...(process.env.NODE_ENV === "development" && {
  //   transport: {
  //     target: "pino-pretty",
  //     options: {
  //       colorize: true,
  //     },
  //   },
  // }),
});

export default logger;
