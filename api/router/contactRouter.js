const express = require("express");
const ContactController = require("../controllers/contactController");

const contactRouter = express.Router();

contactRouter.get("/", ContactController.listContacts);
contactRouter.post(
  "/",
  ContactController.validateAddContact,
  ContactController.addContact
);
contactRouter.get(
  "/:contactId",
  ContactController.validateId,
  ContactController.getContactById
);
contactRouter.delete(
  "/:contactId",
  ContactController.validateId,
  ContactController.removeContact
);
contactRouter.patch(
  "/:contactId",
  ContactController.validateId,
  ContactController.validateUpdateContact,
  ContactController.updateContact
);
module.exports = contactRouter;