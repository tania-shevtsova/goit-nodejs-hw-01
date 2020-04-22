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
      const { email, password, subscription } = req.body;

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

      const user = await userModel.create({
        email,
        password: passwordHash,
        subscription,
      });
      return res.status(201).json({
        Status: `${res.statusCode} Created`,
        ContentType: "application/json",
        Method: req.method,
        ResponseBody: {
          id: user._id,
          email: user.email,
          subscription: user.subscription,
        },
      });
    } catch (err) {
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

      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.status(200).json(this.userResponse([updatedUser]));
    } catch (err) {
      next(err);
    }
  }

  async _addContactForUser(req, res, next) {
    try {
      const contactId = req.params.id;
      const contact = await contactModel.findById(contactId);
      if (!contact) {
        return res.status(404).send("Contact doesnt exist");
      }

      await userModel.findByIdAndUpdate(
        req.user._id,
        {
          $push: { contacts: contactId, $sort: { name: 1 } },
        },
        {
          new: true,
        }
      );

      const usersWithContacts = await userModel.aggregate([
        { $match: { _id: req.user._id } },
        {
          $lookup: {
            from: "contacts",
            localField: "contacts",
            foreignField: "_id",
            as: "contacts",
          },
        },
      ]);

      return res.status(200).json(this.userResponse(usersWithContacts));
    } catch (err) {
      next(err);
    }
  }

  async _paginateContacts(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 0,
        limit: parseInt(req.query.limit, 10) || 10,
        offset: req.query.page > 0 ? (req.query.page - 1) * req.query.limit : 0,
        sort: { name: 1 },
      };
      await contactModel.paginate({}, options, function (err, result) {
        if (err) {
          res.status(500).json(err);
          return;
        }
        res.status(200).json(result);
      });

      // let perPage = 10;
      // let page = parseInt(req.query.page, 10) || 0;
      // let limit = parseInt(req.query.limit, 10) || perPage;

      // const a = await contactModel
      //   .find()
      //   .skip(page > 0 ? (page - 1) * limit : 0)
      //   .limit(limit)
      //   .sort({ name: 1 })
      //   .exec(function (err, body) {
      //     if (err) {
      //       res.status(500).json(err);
      //       return;
      //     }
      //     res.status(200).json(body);
      //   });
    } catch (err) {
      next(err);
    }
  }

  async _removeContactFromUser(req, res, next) {
    try {
      const contactId = req.params.id;
      await userModel.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { contacts: contactId },
        },
        {
          new: true,
        }
      );
      const usersWithContacts = await userModel.aggregate([
        {
          $lookup: {
            from: "contacts",
            localField: "contacts",
            foreignField: "_id",
            as: "contacts",
          },
        },
      ]);

      return res.status(200).json(this.userResponse(usersWithContacts));
    } catch (err) {
      next(err);
    }
  }

  validateUpdateUser(req, res, next) {
    const updateContactRules = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      subscription: Joi.string(),
    });
    const result = Joi.validate(req.body, updateContactRules);
    if (result.error) {
      return res.status(400).json({ message: "missing fields" });
    }

    next();
  }

  validateContactForUser(req, res, next) {
    const validRules = Joi.object({
      subscription: Joi.string().required(),
    });

    const result = Joi.validate(req.body, validRules);
    if (result.error) {
      return res.status(400).send(result.error);
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
      const { email, subscription, _id, contacts } = user;
      return { email, subscription, _id, contacts };
    });
  }
}

module.exports = new UserController();