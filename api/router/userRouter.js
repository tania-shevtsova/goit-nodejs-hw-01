const express = require("express");
const UserController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const { promises: fsPromises } = require("fs");

const userRouter = express.Router();

const storage = multer.diskStorage({
  destination: "api/public/images",
  filename: function (req, file, cb) {
    const extension = path.parse(file.originalname).ext;
    cb(null, Date.now() + extension);
  },
});

const upload = multer({ storage: storage });

userRouter.post("/register", function (req, res) {
  UserController.validateRegisterUser, UserController.registerUser;
});

userRouter.patch("/logout", function (req, res) {
  UserController.authorize, UserController.logOut;
});

userRouter.patch("/login", UserController.validateLogIn, UserController.logIn);

userRouter.patch(
  "/users/:id",
  //  function(req, res){
  UserController.authorize,
  UserController.validateId,
  UserController.validateUpdateUser,
  upload.single("avatar"),
  UserController.updateUser
  //  }
);

module.exports = userRouter;
