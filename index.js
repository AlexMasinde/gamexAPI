const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();
const router = express.Router();

const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");

const getUser = require("./middleware/getUser");

const PORT = 5000 || process.env.PORT;

//middleware
app.use(express.json());

//global route logic
router.all("/api/posts/*", getUser);

//route middleware
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

//connect to database
const mongoDB = process.env.DB_CONNECT;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection failed:"));

db.once("open", () => {
  console.log("Database connected succesfully");
});

//connect server
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
