const express = require("express");
const UserController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const {promises: fsPromises} =require('fs')
// const upload=multer({dest: 'api/public/images'});



const userRouter = express.Router();

// const storage = multer.diskStorage({
//   destination: "tmp",
//   filename: function (req, file, cb) {
//     console.log('REQ', req);
//     console.log('FILE', file);
//     const extension = path.parse(file.originalname).ext;
//     cb(null, Date.now() + extension);
//   },
// });

// const upload = multer({ storage: storage });

// userRouter.post("/multiform", generateAvatar, (req, res, next) => {
//   console.log("req.file", req.file);
//   res.status(200).send(req.file);
// });

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
userRouter.get("/", UserController.filterUsersBySub);
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

// async function generateAvatar(req, res, next){
//   try{
//     const hash = crypto.createHash('md5').update("example@hotmail.com").digest("hex");
// request("https://www.gravatar.com/avatar/"+hash+".jpg",function(err,response,body){
// 	if (!err){
// 		console.log("Got image: "+body);
// 	}else{
// 		console.log("Error: "+err);
// 	}
// })
//   }
//   catch(err){
//     next(err)
//   }
// }

async function minifyImage(req, res, next) {
  try{
  const MINIFIED_DIR = "api/public/images";
  await imagemin([req.file.path], {
    destination: MINIFIED_DIR,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

  const { filename, path: tmpPath } = req.file;
  // await fsPromises.unlink(tmpPath);
  req.file = {
    ...req.file,
    path: path.join(MINIFIED_DIR, filename),
    destination: MINIFIED_DIR,
  };
  console.log('minified', req.file);
  next();
}
catch(err){
  next(err)
}
}

module.exports = userRouter;
