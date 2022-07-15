import express,{Application,Request,Response,NextFunction} from "express";
import {Property} from "../model/Properties"
import {User} from "../model/Users";
import { response } from "../types/types";
import  jwt  from "jsonwebtoken";




const property:Application = express();

property.use(express.urlencoded({ extended: true }));


property.use((req:Request, res:Response, next:NextFunction)=>{
    let headers = req.headers['authorization']
    let bearer:any = headers?.split(" ")
    let token = bearer[1]

    jwt.verify(token, process.env.JWT_TOKEN_KEY2!, function(err:any, decoded:any) {
        if (err) {
            
            res.json({
                status: false,
                message: "somthing went wrong, try later",
            })
            
        }else{
            req.body = {
                ...req.body,
                authorization : {
                    _id : decoded.id
                }
                
            }
            next()
            
        }
      });


   
})

//CREATE
property.post("/create",async (req:Request, res:Response) => {

  let response: response = {
    status: false,
    message: "Something Went wrong.",
  };
  const loggeduser =
    (await User.findOne({
      _id: req.body.authorization._id,
    })) || false;

  if (!loggeduser) {
    throw new Error("User not exist");
  }else{
    const newProperty:any = new Property(req.body.propertydetails);
    newProperty.user_id =await loggeduser._id
    

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

});

//UPDATE
property.put("/update/:id", async (req:Request, res:Response) => {

 

  try {
    const loggeduser =
    (await User.findOne({
      _id: req.body.authorization._id,
    })) || false;

    if (!loggeduser) {
      throw new Error("this account does not exist");
    }else {
      const updatedproperty = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedproperty);
    }
   
 
  } catch (err) {throw err}
});

//DELETE
property.delete("/delete/:id", async (req:Request, res:Response) => {
  try {
    const loggeduser =
    (await User.findOne({
      _id: req.body.authorization._id,
    })) || false;

    if (!loggeduser) {
      throw new Error("this account does not exist");
    }else {
      await Property.findByIdAndDelete(req.params.id);
    res.status(200).json("Property has been deleted.");
    }
   

    
  } catch (err) {throw err}
});



export default property