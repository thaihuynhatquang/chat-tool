import "@babel/polyfill";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import startChannels from "core/startChannels";
import routers from "routes";
import startCrons from "cronjobs";
import { DEFAULT_ENV } from "constants";
import { logError } from "utils/logging";

const app = express();

startChannels();
startCrons();

app.set("env", process.env.NODE_ENV || DEFAULT_ENV);
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(express.static(path.join(__dirname, "../../web/build")));
} else app.use(express.static(path.join(__dirname, "../../web/build-server")));

app.use(routers);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../web/build-server/index.html"));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === DEFAULT_ENV ? err : {};

  logError(err);

  if (!res.headersSent) res.sendStatus(500);
});

export default app;
