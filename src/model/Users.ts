// const mongoose = require("mongoose")
import { Schema, model } from "mongoose";



const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  login_token: {
    type: String,
    required: false,
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
  properties: [
    {type: String}
  ],
  favouriteProperties: [
    {type: String}
  ]
});






export const User = model("User", UserSchema);

