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
userRouter.patch("/login", UserController.validateLogIn, UserController.logIn);

userRouter.put(
  "/contacts/:id",
  UserController.authorize,
  UserController.validateId,
  UserController.addContactForUser
);
userRouter.delete(
  "/contacts/:id",
  UserController.authorize,
  UserController.validateId,
  UserController.removeContactFromUser
);

userRouter.get(
  "/contacts",
  UserController.authorize,
  UserController.paginateContacts
);

userRouter.patch(
  "/users/:id",
  UserController.authorize,
  UserController.validateId,
  UserController.validateUpdateUser,
  UserController.updateUser
);

module.exports = userRouter;
