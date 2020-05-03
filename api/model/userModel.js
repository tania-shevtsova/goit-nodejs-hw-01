const mongoose = require("mongoose");

const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otpCode: { type: Number },
  registered: { type: Boolean, default: false },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: { type: String, required: false },
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
userSchema.statics.findUserByEmail = findUserByEmail;
userSchema.statics.updateToken = updateToken;
userSchema.statics.createOtpToken = createOtpToken;
userSchema.statics.findByVerificationCode = findByVerificationCode;
userSchema.statics.verifyUser = verifyUser;

async function findUserByIdAndUpdate(userId, updateParams) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: updateParams,
    },
    {
      new: true,
    }
  );
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function updateToken(id, updatedToken) {
  return this.findByIdAndUpdate(id, { token: updatedToken });
}

async function createOtpToken(userId, otpCode) {
  return this.findByIdAndUpdate(
    userId,
    {
      otpCode,
    },
    {
      new: true,
    }
  );
}

async function findByVerificationCode(otpCode) {
  return this.findOne({ otpCode });
}

async function verifyUser(userId) {
  return this.findByIdAndUpdate(
    userId,
    {
      registered: true,
      otpCode: null,
    },
    {
      new: true,
    }
  );
}
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
