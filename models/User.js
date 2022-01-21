const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  first_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,
    default:""
  },
  numberOfIncorrectLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastIncorrectLoginTime: {
    type: Date,
    default: "2020-01-01",
  },
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
