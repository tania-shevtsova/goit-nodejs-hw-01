const mongoose = require("mongoose");

const { Schema } = mongoose;

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
 
   writeConcern: {
  w: 'majority',
  j: true,
  wtimeout: 1000
}
});

const contactModel = mongoose.model("Contact", contactSchema);
module.exports = contactModel;