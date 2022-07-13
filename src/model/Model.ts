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
  login_token: {
    type: String,
    required: false
},
  accountVerified: {
    type: Boolean,
    default: false,
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
  properties: [{ type: Schema.Types.ObjectId, ref: 'Properties' }]
});

const ImageSchema = new Schema({
 
  propertyImage: {
    type: String,
  },
  cloudinary_id:{
    type: String
  },
  property_id:{
    type: String
  }
 
});




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
  photos: [ImageSchema],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user_id:{
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: new Date(),
    immutable: true
}
});






export const Properties = model("Properties", PropertySchema)

export const User = model("User", UserSchema)

export const Image = model("Image", ImageSchema)



