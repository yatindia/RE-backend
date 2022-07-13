// const router = require("express").Router();
// import { Request, Response } from "express";
// const cloudinary = require("cloudinary").v2;
// import dotenv from "dotenv";
// dotenv.config();
// import upload from "../functions/multer";
// import { User, Properties, Image } from "../model/Model";
// import { Message } from "twilio/lib/twiml/MessagingResponse";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// router.post("/create/:id", upload.single("image"), async (req: any, res: Response) => {
//   console.log(req.params);
  
//   try {
//     // Upload image to cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path);

//     // Create new user
//     let user = new Image({
//       cloudinary_id: result.public_id,
//       propertyImage: result.secure_url,
//       property_id:req.params.id,

//     });
//     let propId = req.params.id;
//     // Save user
//     await user.save();
//     Properties.findByIdAndUpdate(propId, {$push: {photos: user}})
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

// // router.get("/", async (req:Request, res:Response) => {
// //   try {
// //     let user = await Properties.find();
// //     res.json(user);
// //   } catch (err) {
// //     console.log(err);
// //   }
// // });

// router.delete("/delete/:id", async (req: Request, res: Response) => {
//   try {
//     // Find user by id
//     let user: any = await Image.findById(req.params.id);
//     // Delete image from cldinary
//     await cloudinary.uploader.destroy(user.cloudinary_id);
//     // Delete user from db
//     await user.remove();
//     res.json({ message: "Successfully deleted" });
//   } catch (err) {
//     console.log(err);
//     res.json({ message: "Can't find image" });
//   }
// });

// router.put("/update/:id", upload.single("image"), async (req:Request, res:Response) => {
//   try {
//     let user:any = await Image.findById(req.params.id);
//     // Delete image from cloudinary
//     await cloudinary.uploader.destroy(user.cloudinary_id);
//     // Upload image to cloudinary
//     let result;
//     if (req.file) {
//       result = await cloudinary.uploader.upload(req.file.path);
//     }
//     const data = {
//       cloudinary_id: result.public_id || user.cloudinary_id,
//     };
//     user = await Image.findByIdAndUpdate(req.params.id, data, { new: true });
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

// // router.get("/:id", async (req, res) => {
// //   try {
// //     // Find user by id
// //     let user = await Properties.findById(req.params.id);
// //     res.json(user);
// //   } catch (err) {
// //     console.log(err);
// //   }
// // });

// export default router;





const express = require("express"),
      imageupload = express(),
      bodyParser = require("body-parser"),
      fs = require("fs"),
      multer = require("multer");
import path from 'path';
import {Image} from '../model/Model'
import {Request,Response} from 'express'


   
imageupload.use(bodyParser.urlencoded(
      { extended:true }
))



let storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
      cb(null, 'src/uploads')
    },
    filename: function (req:any, file:any, cb:any) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })

  let upload = multer({ storage: storage })

 

imageupload.post("/",upload.single('image'),(req:Request,res:Response)=>{
    let img = fs.readFileSync(req.file?.path);
    

})




imageupload.get("/Sigleimg/:id", async (req:any,res:any)=>{
  try {
    const img = await Image.findById(req.params.id);
    res.status(200).json(img);
  } catch (err) {throw err;
  }
})


export default imageupload


