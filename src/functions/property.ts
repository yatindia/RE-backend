import {Properties} from "../model/Model"
import {User} from "../model/Model";
import { response } from "../types/types";

import {Application,Request,Response} from "express";
import property from "../routes/property";



export const createProperty = async (req:Request, res:Response) => {

  let response: response = {
    status: false,
    message: "Something Went wrong, Could Not signup at the moment.",
  };
  const emailCheck =
    (await User.findOne({
      email: req.body.email,
    })) || false;

  if (!emailCheck) {
    throw new Error("User not exist");
  }else{
    const newProperty:any = new Properties(req.body);
    newProperty.user_id =await emailCheck._id
    

  try {
    const savedproperty = await newProperty.save();
    // res.status(200).json(savedproperty);
    response.status= true;
    response.message= "Property saved successfully.";
  } catch (error:any) {response.status = false
    response.message = error.message
  }
  }
  res.json({
    response
  })

};
export const updateProperty = async (req:Request, res:Response) => {
  try {
    console.log(req)
    const updatedproperty = await Properties.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedproperty);
  } catch (err) {throw err;
  }
};
export const deleteProperty = async (req:Request, res:Response) => {
  try {
    await Properties.findByIdAndDelete(req.params.id);
    res.status(200).json("Property has been deleted.");
  } catch (err) {throw err;
  }
};
export const getSingleProperty = async (req:Request, res:Response) => {
  try {
    const property = await Properties.findById(req.params.id);
    res.status(200).json(property);
  } catch (err) {throw err;
  }
};



