import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { SENTRYDSN, TRUST_PROXY } from "./util/secrets";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 1 minutes",
});

export const app = express();

app.set("trust proxy", TRUST_PROXY);
Sentry.init({ dsn: SENTRYDSN, tracesSampleRate: 1.0 });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(Sentry.Handlers.requestHandler());
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return !!error;
    },
  })
);
app.use(limiter);
app.use(helmet());

app.get("/", (req, res) => {
  res.send("API is Running");
});

// app.get("/ip", (request, response) =>
//   response.send({
//     ips: request.ips,
//     ip: request.ip,
//     protocol: request.protocol,
//     headers: request.headers["x-forwarded-for"],
//   })
// );
