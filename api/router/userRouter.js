const express = require("express");
const UserController = require("../controllers/userController");

const userRouter = express.Router();
userRouter.post("/register", 
  UserController.validateRegisterUser, UserController.registerUser
);

userRouter.patch("/login", UserController.validateLogIn, UserController.logIn);


userRouter.get("/api/otp/:otpCode", UserController.verifyEmail)

module.exports = userRouter;
