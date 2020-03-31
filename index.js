const functions = require("./contacts");
const argv = require("yargs").argv;

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      functions.listContacts();
      break;

    case "get":
      functions.getContactById(id);
      break;

    case "add":
      functions.addContact(name, email, phone);
      break;

    case "remove":
      functions.removeContact(id);
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);