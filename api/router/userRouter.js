const express = require("express");
const UserController = require("../controllers/userController");

const userRouter = express.Router();
userRouter.post(
  "/register",
  UserController.validateRegisterUser,
  UserController.registerUser
);

userRouter.patch("/logout", UserController.authorize, UserController.logOut);

userRouter.get(
  "/users/current",
  UserController.authorize,
  UserController.getCurrentUser
);
userRouter.patch(
  "/login",
  UserController.validateLogIn,
  UserController.logIn
);
module.exports = userRouter;
