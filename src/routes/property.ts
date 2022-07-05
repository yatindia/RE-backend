import express, { Application } from "express";
import {
  createProperty,
  deleteProperty,
  getSingleProperty,
  updateProperty,
} from "../functions/property";
const property:Application = express();
//CREATE
property.post("/",createProperty);

//UPDATE
property.put("/:id", updateProperty);
//DELETE
property.delete("/:id", deleteProperty);
//GET

property.get("/find/:id", getSingleProperty);

export default property