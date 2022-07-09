import express, { Application } from "express";
import {
  createProperty,
  deleteProperty,
  getSingleProperty,
  updateProperty,
} from "../functions/property";
const property:Application = express();
//CREATE
property.post("/create",createProperty);

//UPDATE
property.put("/update/:id", updateProperty);
//DELETE
property.delete("/delete/:id", deleteProperty);
//GET

property.get("/findSigleProperty/:id", getSingleProperty);

export default property