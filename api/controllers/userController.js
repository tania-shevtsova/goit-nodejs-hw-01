const Joi = require("joi");
const userModel = require("../model/userModel");
const {
  Types: { ObjectId },
} = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { UnauthorizedError } = require("../helpers/errors");
const contactModel = require("../model/contactModel");
const crypto = require("crypto");
const request = require("request");
const fs = require("fs");
const path=require('path')
const fsExtra=require('fs-extra')

class UserController {
  constructor() {
    this.costFactor = 4;
  }

  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }

  get registerUser() {
    return this._registerUser.bind(this);
  }

  get updateUser() {
    return this._updateUser.bind(this);
  }

  get addContactForUser() {
    return this._addContactForUser.bind(this);
  }

  get removeContactFromUser() {
    return this._removeContactFromUser.bind(this);
  }

  get paginateContacts() {
    return this._paginateContacts.bind(this);
  }

  get filterUsersBySub() {
    return this._filterUsersBySub.bind(this);
  }

  async _filterUsersBySub(req, res, next) {
    try {
      const users = await userModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "subscription",
            foreignField: "subscription",
            as: "users",
          },
        },

        {
          $unwind: {
            path: "$users",
          },
        },

        {
          $match: {
            "users.subscription": req.query.sub,
          },
        },
      ]);

      return res.status(200).json(this.userResponse(users));
    } catch (err) {
      next(err);
    }
  }

  async _getCurrentUser(req, res, next) {
    try {
      const [userRes] = this.userResponse([req.user]);
      res.status(200).json({
        Status: `${res.statusCode} OK`,
        ContentType: "application/json",
        Method: req.method,
        ResponseBody: userRes,
      });
    } catch (err) {
      next(err);
    }
  }

  async _registerUser(req, res, next) {
    try {
      const { email, password, subscription, avatarURL } = req.body;

      const passwordHash = await bcrypt.hash(password, this.costFactor);

      const doesUserExist = await userModel.findUserByEmail(email);

      if (doesUserExist) {
        return res.status(409).json({
          Status: `${res.statusCode} Conflict`,
          "Content-Type": "application/json",
          Method: req.method,
          ResponseBody: "Email address is already in use",
        });
      }

      const hash = crypto.createHash("md5").update(email).digest("hex");

      let a = request(
        "https://www.gravatar.com/avatar/" + hash + "?d=monsterid",
        function (err, response, body) {
          if (!err) {
            console.log("Got image: ");
          } else {
            console.log("Error: " + err);
          }
        }
      );

      const write = a.uri.href;

      const user = await userModel.create({
        email,
        password: passwordHash,
        subscription,
        avatarURL: write,
      });
      request(write).pipe(fs.createWriteStream(path.join('tmp', Date.now()+'.png')));
       fs.readdir('tmp', (err, data) => {
        if (err) throw err;
        data.map(el=>{
           fs.rename(`tmp/${el}`, `api/public/images/${el}`, function (err) {
            if (err) throw err
            console.log('Successfully moved!')
          });
        })
      });
      
      return res.status(201).json({
        Status: `${res.statusCode} Created`,
        ContentType: "application/json",
        Method: req.method,
        ResponseBody: {
          id: user._id,
          email: user.email,
          subscription: user.subscription,
          avatarURL: user.avatarURL,
        },
      });
    } catch (err) {
      console.log(err)
      next(err);
    }
  }

  async logIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({
          Status: `${res.statusCode} Not Found`,
          "Content-Type": "application/json",
          Method: req.method,
          ResponseBody: "User not found",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          Status: `${res.statusCode} BAD`,
          "Content-Type": "application/json",
          Method: req.method,
          ResponseBody: "Invalid login or password",
        });
      }

      const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 2 * 24 * 60 * 60,
      });
      await userModel.updateToken(user._id, token);
      return res.status(200).json({
        Status: `${res.statusCode} OK`,
        ContentType: "application/json",
        Method: req.method,
        ResponseBody: {
          token: token,
          user: {
            email: email,
            subscription: user.subscription,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logOut(req, res, next) {
    try {
      const user = req.user;
      await userModel.updateToken(user._id, null);

      return res.status(200).json({
        Status: `${res.statusCode} OK`,
        "Content-Type": "application/json",
        Method: req.method,
        ResponseBody: "Logout success",
      });
    } catch (err) {
      next(err);
    }
  }

  async _updateUser(req, res, next) {
    try {
      const id = req.params.id;
      console.log('req', req.headers['content-type'])
      // req.headers['content-type']==='application/json' && 
      let updatedUser;
      if(req.headers['content-type']=== 'application/json'){
        updatedUser = await userModel.findByIdAndUpdate(
          id,
          {$set: req.body},
          { new: true }
        );
      }

        else {
        updatedUser = await userModel.findByIdAndUpdate(
          id,
          { $set: { avatarURL: req.file.filename }},
          { new: true }
        );
      }

      console.log('updatedUser', updatedUser)
      if (!updatedUser) {
        return res.status(404).json({ message: "Not found" });
      }
      console.log(updatedUser)
      return res.status(200).json(this.userResponse([updatedUser]));
    } catch (err) {
      next(err);
    }
  }

  validateUpdateUser(req, res, next) {
    const updateContactRules = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      subscription: Joi.string(),
      avatarURL: Joi.string()
    });
    const result = Joi.validate(req.body, updateContactRules);
    if (result.error) {
      return res.status(400).json({ message: "missing fields" });
    }

    next();
  }

  validateId(req, res, next) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Not found" });
    }
    next();
  }

  validateRegisterUser(req, res, next) {
    const addContactRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      subscription: Joi.string(),
    });
    const result = Joi.validate(req.body, addContactRules);
    if (result.error) {
      return res.status(422).json({
        Status: `${res.statusCode} Unprocessable Entity`,
        "Content-Type": "application/json",
        Method: req.method,
        ResponseBody: "missing required name field",
      });
    }

    next();
  }

  validateLogIn(req, res, next) {
    const signInRules = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      subscription: Joi.string(),
    });
    const result = Joi.validate(req.body, signInRules);
    if (result.error) {
      return res.status(400).json({ message: "missing fields" });
    }

    next();
  }

  async authorize(req, res, next) {
    try {
      const authHeader = req.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");

      let userId;
      try {
        userId = await jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (err) {
        next(new UnauthorizedError("User not authorized"));
      }

      const user = await userModel.findById(userId);

      if (!user || user.token !== token) {
        throw new UnauthorizedError(
          res.status(401).json({
            Status: `${res.statusCode} Not authorized`,
            "Content-Type": "application/json",
            Method: req.method,
            ResponseBody: "Not authorized",
          })
        );
      }

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  }

  userResponse(users) {
    return users.map((user) => {
      const { email, subscription, _id, contacts, avatarURL } = user;
      return { email, subscription, _id, contacts, avatarURL };
    });
  }
}

module.exports = new UserController();
