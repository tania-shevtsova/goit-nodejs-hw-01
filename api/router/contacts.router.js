const express = require("express");
const ContactController = require("../controllers/contactController");

const contactRouter = express.Router();

contactRouter.get("/", ContactController.listContacts);
contactRouter.get("/:contactId", ContactController.getContactById);
contactRouter.post(
  "/",
  ContactController.validateAddContact,
  ContactController.addContact
);
contactRouter.delete("/:contactId", ContactController.removeContact);
contactRouter.patch(
  "/:contactId",
  ContactController.validateUpdateContact,
  ContactController.updateContact
);
module.exports = contactRouter;
