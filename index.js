const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
require("dotenv/config");

const app = express();

const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const commentRoutes = require("./routes/comments");
const likeRoute = require("./routes/likes");

const PORT = 5000 || process.env.PORT;

//middleware
app.use(express.json());

//use Swagger-ui-express
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//route middleware
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/like", likeRoute);

//connect to database
const mongoDB = process.env.DB_CONNECT;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection failed:"));

db.once("open", () => {
  console.log("Database connected succesfully");
});

//connect server
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
