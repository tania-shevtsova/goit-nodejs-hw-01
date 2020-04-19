const mongoose = require("mongoose");

const { Schema, 
    Types: { ObjectId }
  } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free"
  },
  token: { type: String, required: false }
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
userSchema.statics.findUserByEmail = findUserByEmail;
userSchema.statics.updateToken=updateToken;

async function findUserByIdAndUpdate(userId, updateParams) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: updateParams
    },
    {
      new: true
    }
  );
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function updateToken(id, updatedToken) {
  return this.findByIdAndUpdate(id, { token: updatedToken });
}
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
