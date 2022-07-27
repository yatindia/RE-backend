import {Schema, model} from "mongoose";

const PropertySchema = new Schema({
  owner: {type: String, required: true},
  photos: [{type: String, required: true}],
  type: {type: String, required: true},
  space_use: {type: String, required: true},
  for : {type: String, required: true},
  address_1: {type: String, required: true},
  address_2: {type: String, required: true},
  country: {type: String, required: true},
  state: {type: String, required: true},
  city: {type: String, required: true},
  zip_code: {type: Number, required: true},
  year_built: {type: Number, required: true},
  renovated : {type: Boolean, required: false, default: false},
  renovated_year: {type: Number, required: false, default: 0},
  building_size: {type: Number, required: true},
  lot_size: {type: Number, required: true},
  construction_type:{type: String, required: true},
  electricity: {type: String, required: true},
  zoning: {type: String, required: true},
  highlights: [{type: String, required: true}],
  featured: {type: Boolean, required: false},
  importance: {type: Number, required: false},
  gps:{
    lat: {type: Number, required: false},
    lng: {type: Number, required: false}
  },
  
  floors: [
  
    {
      floor_number:{type: Number, required: true},
      floor_size: {type: Number, required: true},
      term: {type: String, required: true},
      rate: {type: String || Number, required: true},
      space_use: {type: String, required: true},
      condition: {type: String, required: true},
      amenities: [{type: String, required: true}],
      period_of_tenure: {type: Number, required: true},
      avaliable: {type: Boolean, required: true},
    }
  ]
  
  });


export const Property = model("Properties", PropertySchema);
