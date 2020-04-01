const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedbackRouter = require("./routes/feedback");
const userRouter = require("./routes/authentication");
const adminRouter = require('./routes/admin');

const initializeDB = require('./util/dbInit');

const app = express();

app.use("/", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});

app.use("/", bodyParser.json());

app.use("/feedback", feedbackRouter);
app.use("/authentication", multer().none(), userRouter);
app.use('/admin', multer().none(), adminRouter);

app.use("/", async (error, req, res, next) => {
  await res
    .status(error.status || 500)
    .json(
      error || {
        message:
          error.message ||
          "Что-то пошло не так...Извините за предоставленные неудобства"
      }
    );
});

mongoose.connect(
  "mongodb://localhost:27017/?readPreference=primary&ssl=false",
  async err => {
    if (err) {
      console.log(err);
      return;
    }

    // await initializeDB();

    app.listen(8080);
  }
);
