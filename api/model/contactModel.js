const mongoose = require("mongoose");

const { Schema } = mongoose;
<<<<<<< HEAD
const mongoosePaginate = require('mongoose-paginate-v2');
=======
>>>>>>> 9ffb2b3497645cc736cf725f63a295797230a495

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
});
<<<<<<< HEAD
contactSchema.plugin(mongoosePaginate)

const contactModel = mongoose.model("Contact", contactSchema);
module.exports = contactModel;
=======

const contactModel = mongoose.model("Contact", contactSchema);
module.exports = contactModel;
>>>>>>> 9ffb2b3497645cc736cf725f63a295797230a495
