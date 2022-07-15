import {Schema, model} from "mongoose";

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


export const Property = model("Properties", PropertySchema);
