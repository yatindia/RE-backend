import Property from "../model/Properties"
import {Application,Request,Response} from "express";


export const createProperty = async (req:Request, res:Response) => {
  const newProperty = new Property(req.body);

  try {
    const savedproperty = await newProperty.save();
    res.status(200).json(savedproperty);
  } catch (err) {throw err;
  }
};
export const updateProperty = async (req:Request, res:Response) => {
  try {
    const updatedproperty = await Property.findByIdAndUpdate(
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
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json("Property has been deleted.");
  } catch (err) {throw err;
  }
};
export const getSingleProperty = async (req:Request, res:Response) => {
  try {
    const property = await Property.findById(req.params.id);
    res.status(200).json(property);
  } catch (err) {throw err;
  }
};



