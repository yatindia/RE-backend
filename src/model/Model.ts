// const mongoose = require("mongoose")
import { Schema, model } from "mongoose";

const PropertySchema = new Schema({
  propertyBuyingOption: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  primaryImage: {
    type: String,
  },
  photos: [{ type: String }],
  tittle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: new Date(),
    immutable: true,
  },
});

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
  properties: [{PropertySchema}],
});

// const ImageSchema = new Schema({

//   propertyImage: {
//     type: String,
//   },
//   cloudinary_id:{
//     type: String
//   },
//   property_id:{
//     type: String
//   }

// });



export const Properties = model("Properties", PropertySchema);

export const User = model("User", UserSchema);

// export const Image = model("Image", ImageSchema)
