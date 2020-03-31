const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "db", "contacts.json");

function listContacts() {
  fs.readFile(contactsPath, (error, data) => {
    if (error) {
      throw error;
    }
    console.table(JSON.parse(data));
  });
}

function getContactById(contactId) {
  fs.readFile(contactsPath, (error, data) => {
    if (error) {
      throw error;
    }
    const found = JSON.parse(data).find(el => el.id === contactId);
    console.log(found);
  });
}

function removeContact(contactId) {
  fs.readFile(contactsPath, (error, data) => {
    if (error) {
      throw error;
    }

    const parsed = JSON.parse(data);

    const products = [...parsed];
    const deleted = products.filter(el => el.id !== contactId);

    fs.writeFile(contactsPath, JSON.stringify(deleted), error => {
      if (error) {
        throw err;
      }
      console.log("DELETED");
      listContacts();
    });
  });
}

function addContact(name, email, phone) {
  fs.readFile(contactsPath, (error, data) => {
    if (error) {
      throw error;
    }

    const parsedData = JSON.parse(data);
    const getLastId = parsedData[parsedData.length - 1].id;
    const id = getLastId + 1;

    const allProducts = [...parsedData, { ...{ id, name, email, phone } }];

    fs.writeFile(contactsPath, JSON.stringify(allProducts), error => {
      if (error) {
        throw error;
      }
      console.log("ADDED");
      listContacts();
    });
  });
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact
};