// const mongoose = require("mongoose")
import {Schema,model} from "mongoose"

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
  accountVerified: {
    type: Boolean,
    default: false,
  },
})

const User = model("User", UserSchema)

export default User
