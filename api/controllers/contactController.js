const Joi = require("joi");
const contactModel = require("../model/contactModel");
const {
  Types: { ObjectId }
} = require("mongoose");

class ContactController {
  async listContacts(req, res, next) {
    try {
      const contacts = await contactModel.find();
      return res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async addContact(req, res, next) {
    try {
      const contact = await contactModel.create(req.body);
      return res.status(201).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async getContactById(req, res, next) {
    try {
      const id = req.params.contactId;
      console.log(id);

      const contact = await contactModel.findById(id);
      if (!contact) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async removeContact(req, res, next) {
    try {
      const id = req.params.contactId;

      const deletedContact = await contactModel.findByIdAndDelete(id);
      if (!deletedContact) {
        return res.status(404).json({ message: "Not found" });
      }

      return res.status(200).json({ message: "contact deleted" });
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const id = req.params.contactId;

      const updatedContact = await contactModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedContact) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  }

  validateAddContact(req, res, next) {
    const addContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required()
    });
    const result = Joi.validate(req.body, addContactRules);
    if (result.error) {
      return res.status(400).json({ message: "missing required name field" });
    }

    next();
  }

  validateUpdateContact(req, res, next) {
    const updateContactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string()
    });
    const result = Joi.validate(req.body, updateContactRules);
    if (result.error) {
      return res.status(400).json({ message: "missing fields" });
    }

    next();
  }

  validateId(req, res, next) {
    const id = req.params.contactId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Not found" });
    }
    next();
  }
}


module.exports = new ContactController();

