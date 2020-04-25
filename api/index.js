const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./router/userRouter");
require("dotenv").config();

module.exports = class User {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddleWares();
    this.initRoutes();
    await this.initDB();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleWares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: "http://localhost:3000" }));
  }

  initRoutes() {
    this.server.use("/auth", userRouter);
  }

  async initDB() {
    try {
      await mongoose.connect(process.env.URL_MONGODB, {useNewUrlParser: true, useUnifiedTopology: true }, () => {
        console.log("Database connection successful");
      });
    } catch (err) {
      console.log("AN ERROR OCCURED", err);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {});
  }
};
