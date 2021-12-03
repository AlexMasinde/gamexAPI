const express = require("express");
const Sentry = require("@sentry/node");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const xss = require("xss-clean");
require("dotenv/config");

const swaggerDocument = YAML.load("./swagger.yaml");

const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const commentRoutes = require("./routes/comments");
const likeRoute = require("./routes/likes");

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

app.use(Sentry.Handlers.requestHandler());
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(hpp());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/like", likeRoute);
app.get("/", (_, res) => {
  res.redirect("/api-docs");
});

app.use(Sentry.Handlers.errorHandler());

//connect to database
const mongoDB = process.env.DB_CONNECT;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", function (err) {
  Sentry.captureException(err);
});

db.once("open", function () {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT);
});
