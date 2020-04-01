const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const contactsPath = path.join(__dirname, "..", "db", "contacts.json");

class ContactController {
  listContacts(req, res, next) {
    fs.readFile(contactsPath, (error, data) => {
      if (error) {
        throw error;
      }
      return res.json(JSON.parse(data));
    });
  }

  getContactById(req, res, next) {
    fs.readFile(contactsPath, (error, data) => {
      if (error) {
        throw error;
      }
      const id = parseInt(req.params.contactId);
      const found = JSON.parse(data).find(el => el.id === id);
      if (found) {
        return res.status(200).json(found);
      } else {
        return res.status(404).json({ message: "Not found" });
      }
    });
  }

  addContact(req, res, next) {
    fs.readFile(contactsPath, (error, data) => {
      if (error) {
        throw error;
      }

      const parsedData = JSON.parse(data);
      const getLastId = parsedData[parsedData.length - 1].id;
      const id = getLastId + 1;

      const allProducts = [...parsedData, { ...{ id, ...req.body } }];

      const added = [{ ...{ id, ...req.body } }];
      fs.writeFile(contactsPath, JSON.stringify(allProducts), error => {
        if (error) {
          throw error;
        }
        return res.status(201).json(added);
      });
    });
  }

  removeContact(req, res, next) {
    fs.readFile(contactsPath, (error, data) => {
      if (error) {
        throw error;
      }

      const parsed = JSON.parse(data);
      const id = parseInt(req.params.contactId);

      const contactId = parsed.find(el => el.id === id);
      if (contactId === undefined) {
        return res.status(404).json({ message: "Not found" });
      } else {
        const deleted = parsed.filter(el => el.id !== contactId.id);
        fs.writeFile(contactsPath, JSON.stringify(deleted), error => {
          if (error) {
            throw err;
          }
        });
        return res.status(200).json({ message: "contact deleted" });
      }
    });
  }

  updateContact(req, res, next) {
    fs.readFile(contactsPath, (error, data) => {
      if (error) {
        throw error;
      }
      const parsedData = JSON.parse(data);

      const id = parseInt(req.params.contactId);
      const findIdx = JSON.parse(data).findIndex(el => el.id === id);
      const updated = { ...parsedData[findIdx], ...req.body };

      parsedData[findIdx] = {
        ...parsedData[findIdx],
        ...req.body
      };
      const allContacts = [...parsedData];

      fs.writeFile(contactsPath, JSON.stringify(allContacts), error => {
        if (error) {
          throw error;
        }
      });

      if (findIdx === -1) {
        return res.status(404).json({ message: "Not found" });
      }
      return res.status(200).json(updated);
    });
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
}

module.exports = new ContactController();
