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

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(routers);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public"));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === DEFAULT_ENV ? err : {};

  logError(err);

  if (!res.headersSent) res.sendStatus(500);
});

export default app;
