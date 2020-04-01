const functions = require("./contacts");
const argv = require("yargs").argv;
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const contactRouter = require("./router/contacts.router");
require("dotenv").config();

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddleWares();
    this.initRoutes();
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
    this.server.use("/api/contacts", contactRouter);
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {});
  }
};
