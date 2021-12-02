const express = require("express");
const Sentry = require("@sentry/node");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
require("dotenv/config");

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
  const PORT = 5000 || process.env.PORT;
  app.listen(PORT);
});
